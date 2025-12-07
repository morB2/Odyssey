import Collection from "../models/collectionModel.js";
import Trip from "../models/tripModel.js";
import { fetchTrips } from "./tripFetcherService.js";

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

    return await newCollection.save();
};

export const getCollectionsByUserService = async (userId, viewerId, options = {}) => {
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
        const trips = await fetchTrips({
            filter: { _id: { $in: c.trips } },
            viewerId,
            ...options
        });

        result.push({
            ...c,
            trips,
            tripCount: trips.length,
            coverImage: c.image || (trips[0] && trips[0].images && trips[0].images[0]) || null,
        });
    }

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

    return await collection.save();
};

export const deleteCollectionService = async (id, userId) => {
    const result = await Collection.deleteOne({ _id: id, user: userId });
    return result.deletedCount > 0;
};
