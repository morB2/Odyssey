import Collection from "../models/collectionModel.js";
import Trip from "../models/tripModel.js";
import { fetchTrips } from "./tripFetcherService.js";
import redis from "../db/redisClient.js";
import { generateCollectionTitleInstruction, generateCollectionDescriptionInstruction } from "./prompts.js";
import { askGemini, sanitizeAIOutput } from "./geminiService.js";
import dotenv from "dotenv";

dotenv.config();

export const createCollectionService = async (userId, data) => {
    const { name, description, trips, image, isPrivate } = data;

    const newCollection = new Collection({
        user: userId,
        name,
        description,
        trips: trips || [],
        image,
        isPrivate: !!isPrivate,
    });

    const savedCollection = await newCollection.save();

    // Populate trips and user before returning
    return await Collection.findById(savedCollection._id)
        .populate({
            path: "trips",
            populate: { path: "user", select: "firstName lastName avatar" }
        })
        .populate("user", "firstName lastName avatar")
        .lean();
};

export const getCollectionsByUserService = async (userId, viewerId, options = {}) => {
    const cacheKey = `collections:${userId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }
    const query = { user: userId };

    if (viewerId !== userId) {
        query.isPrivate = false;
    }

    // Fetch collections first
    const collections = await Collection.find(query)
        .sort({ createdAt: -1 })
        .lean();

    // For each collection, fetch trips using your unified fetchTrips
    const result = [];
    for (const c of collections) {
        const fetchedTrips = await fetchTrips({
            filter: { _id: { $in: c.trips } },
            viewerId,
            ...options
        });

        // Re-order trips to match the order in c.trips
        // Create a map for quick lookup
        console.log(fetchedTrips)
        const filteredTrips = (viewerId === userId) ? fetchedTrips : fetchedTrips.filter(trip => trip.visabilityStatus === 'public')
        console.log(filteredTrips)
        const tripMap = new Map(filteredTrips.map(t => [t._id.toString(), t]));

        // Map c.trips to the fetched trip objects, filtering out any that might have been deleted/not found
        const trips = c.trips
            .map(id => tripMap.get(id.toString()))
            .filter(Boolean);

        result.push({
            ...c,
            trips,
            tripCount: trips.length,
            coverImage: c.image || (trips[0] && trips[0].images && trips[0].images[0]) || null,
        });
    }
    await redis.setEx(cacheKey, 60, JSON.stringify(result));
    return result;
};

export const getCollectionByIdService = async (id) => {
    return await Collection.findById(id)
        .populate({
            path: "trips",
            populate: { path: "user", select: "firstName lastName avatar" }
        })
        .populate("user", "firstName lastName avatar")
        .lean();
};

export const updateCollectionService = async (id, userId, updates) => {
    const collection = await Collection.findOne({ _id: id, user: userId });

    if (!collection) return null;

    Object.keys(updates).forEach((key) => {
        collection[key] = updates[key];
    });

    await collection.save();

    // Populate trips and user before returning, just like getCollectionByIdService
    return await Collection.findById(id)
        .populate({
            path: "trips",
            populate: { path: "user", select: "firstName lastName avatar" }
        })
        .populate("user", "firstName lastName avatar")
        .lean();
};

export const deleteCollectionService = async (id, userId) => {
    const result = await Collection.deleteOne({ _id: id, user: userId });
    return result.deletedCount > 0;
};


// ============================================
// AI Generation Functions
// ============================================

export const generateCollectionTitle = async (tripIds) => {
    if (!tripIds || tripIds.length === 0) {
        throw new Error("At least one trip is required");
    }

    // Fetch the trips
    const trips = await Trip.find({ _id: { $in: tripIds } })
        .select("title description")
        .lean();

    if (trips.length === 0) {
        throw new Error("No trips found");
    }

    // Build the prompt
    const tripsData = trips.map(t => ({
        title: t.title || "Untitled Trip",
        description: t.description || ""
    }));

    const userPrompt = `Generate a collection title for these trips:\n${JSON.stringify(tripsData, null, 2)}`;

    // Call Gemini
    const out = await askGemini(generateCollectionTitleInstruction, userPrompt);
    const sanitized = sanitizeAIOutput(out);

    try {
        const result = JSON.parse(sanitized);
        return result.title;
    } catch (e) {
        throw new Error("AI returned invalid JSON for title generation");
    }
};

export const generateCollectionDescription = async (tripIds) => {
    if (!tripIds || tripIds.length === 0) {
        throw new Error("At least one trip is required");
    }

    // Fetch the trips
    const trips = await Trip.find({ _id: { $in: tripIds } })
        .select("title description")
        .lean();

    if (trips.length === 0) {
        throw new Error("No trips found");
    }

    // Build the prompt
    const tripsData = trips.map(t => ({
        title: t.title || "Untitled Trip",
        description: t.description || ""
    }));

    const userPrompt = `Generate a collection description for these trips:\n${JSON.stringify(tripsData, null, 2)}`;

    // Call Gemini
    const out = await askGemini(generateCollectionDescriptionInstruction, userPrompt);
    const sanitized = sanitizeAIOutput(out);

    try {
        const result = JSON.parse(sanitized);
        return result.description;
    } catch (e) {
        throw new Error("AI returned invalid JSON for description generation");
    }
};
