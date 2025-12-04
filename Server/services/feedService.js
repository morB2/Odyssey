import User from "../models/userModel.js";
import Trip from "../models/tripModel.js";
import Like from "../models/likesModel.js";
import Save from "../models/savesModel.js";
import Follow from "../models/followModel.js";
import redis from '../db/redisClient.js';
import { fetchTrips } from "./tripFetcherService.js";

export async function getFeedForUser(userId, page = 1, limit = 20) {
    const cacheKey = userId
        ? `feed:${userId}:page:${page}:limit:${limit}`
        : `feed:public:page:${page}:limit:${limit}`;

    return fetchTrips({
        filter: { visabilityStatus: "public" },
        viewerId: userId,
        page,
        limit,
        enableScoring: true,      // Enable personalized scoring
        enableDiversity: true,
        softRepeat: true,   // Apply diversity filter
        scoringWindow: 1000,      // Limit trips for scoring (scalability)
        cacheKey,
        cacheTTL: 60,
        includeMetadata: false,
        processComments: true,
    });
}

