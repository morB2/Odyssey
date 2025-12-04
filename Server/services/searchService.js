import User from "../models/userModel.js";
import Trip from "../models/tripModel.js";
import Like from "../models/likesModel.js";
import Save from "../models/savesModel.js";
import Follow from "../models/followModel.js";
import { fetchTrips, normalizeAvatarUrl } from "./tripFetcherService.js";

/**
 * Search for users and trips based on a query string
 * @param {string} query - Search query
 * @param {string} viewerId - Optional user ID for social flags
 * @param {number} userLimit - Maximum number of users to return (default: 5)
 * @param {number} tripLimit - Maximum number of trips to return (default: 5)
 * @returns {Object} { users: [], trips: [] }
 */
export async function search(query, viewerId = null, userLimit = 5, tripLimit = 5) {
    if (!query || query.trim().length === 0) {
        return { users: [], trips: [] };
    }
    // Use MongoDB's $regex operator directly for better Unicode support
    const searchPattern = query.trim();

    // Search users by firstName, lastName, or email
    const users = await User.find({
        $or: [
            { firstName: { $regex: searchPattern, $options: 'i' } },
            { lastName: { $regex: searchPattern, $options: 'i' } },
            { email: { $regex: searchPattern, $options: 'i' } },
        ],
        // status: true, // Only active users
    })
        .select("_id firstName lastName email avatar")
        .limit(userLimit)
        .lean();


    // Normalize avatars
    users.forEach((user) => {
        if (user.avatar) user.avatar = normalizeAvatarUrl(user.avatar);
    });

    // If viewerId is provided, check if viewer is following these users
    if (viewerId) {
        const userIds = users.map((u) => u._id);
        const follows = await Follow.find({
            follower: viewerId,
            following: { $in: userIds },
        }).select("following");

        const followingSet = new Set(follows.map((f) => String(f.following)));

        users.forEach((user) => {
            user.isFollowing = followingSet.has(String(user._id));
        });
    }

    // Search trips using unified fetcher
    const tripFilter = {
        visabilityStatus: "public",
        $or: [
            { title: { $regex: searchPattern, $options: 'i' } },
            { description: { $regex: searchPattern, $options: 'i' } },
            { activities: { $regex: searchPattern, $options: 'i' } },
        ],
    };

    const trips = await fetchTrips({
        filter: tripFilter,
        viewerId,
        limit: tripLimit,
        sort: { createdAt: -1 },
        includeMetadata: false,
        processComments: true,
    });

    return { users, trips };
}

