import User from "../models/userModel.js";
import Trip from "../models/tripModel.js";
import Like from "../models/likesModel.js";
import Save from "../models/savesModel.js";
import Follow from "../models/followModel.js";
import redis from '../db/redisClient.js';

export async function getFeedForUser(userId, page = 1, limit = 20) {
    const cacheKey = `feed:${userId}:page:${page}:limit:${limit}`;
    console.log(`[Feed] Checking cache for user ${userId}, page ${page}`);

    // Check Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
        console.log(`[Feed] Cache hit! Returning cached feed for user ${userId}`);
        return JSON.parse(cached);
    }

    const skip = (page - 1) * limit;

    // Load the user (preferences)
    console.log(`[Feed] Cache miss. Loading user ${userId} from DB`);
    const user = await User.findById(userId).lean();
    if (!user) {
        console.log(`[Feed] User ${userId} not found`);
        throw new Error("User not found");
    }

    // Fetch followings
    console.log(`[Feed] Fetching users followed by ${userId}`);
    const followingDocs = await Follow.find({ follower: userId }).select("following");
    const followingIds = followingDocs.map(f => f.following.toString());
    console.log(`[Feed] User ${userId} follows ${followingIds.length} users`);

    // Get all public trips
    console.log(`[Feed] Fetching all public trips`);
    const allTrips = await Trip.find({ visabilityStatus: "public" })
        .populate("user", "_id firstName lastName avatar")
        .populate("comments.user", "_id firstName lastName avatar")
        .sort({ createdAt: -1 })
        .lean();
    console.log(`[Feed] Found ${allTrips.length} public trips`);

    const tripIds = allTrips.map(t => t._id);
    const userIds = allTrips.map(t => t.user._id);

    // Preload likes and saves per trip
    console.log(`[Feed] Loading like and save counts for ${tripIds.length} trips`);
    const [likeCounts, saveCounts] = await Promise.all([
        Like.aggregate([
            { $match: { trip: { $in: tripIds } } },
            { $group: { _id: "$trip", count: { $sum: 1 } } },
        ]),
        Save.aggregate([
            { $match: { trip: { $in: tripIds } } },
            { $group: { _id: "$trip", count: { $sum: 1 } } },
        ]),
    ]);
    console.log(`[Feed] Likes loaded: ${likeCounts.length}, Saves loaded: ${saveCounts.length}`);

    const likeMap = Object.fromEntries(likeCounts.map(l => [l._id.toString(), l.count]));
    const saveMap = Object.fromEntries(saveCounts.map(s => [s._id.toString(), s.count]));

    // Preload current user likes/saves
    console.log(`[Feed] Loading current user's liked and saved trips`);
    const [likedTrips, savedTrips] = await Promise.all([
        Like.find({ user: userId, trip: { $in: tripIds } }).select("trip"),
        Save.find({ user: userId, trip: { $in: tripIds } }).select("trip"),
    ]);
    const likedTripIds = new Set(likedTrips.map(l => l.trip.toString()));
    const savedTripIds = new Set(savedTrips.map(s => s.trip.toString()));
    console.log(`[Feed] User ${userId} liked ${likedTripIds.size} trips, saved ${savedTripIds.size} trips`);

    // Preload follow status for all users
    console.log(`[Feed] Loading follow status for all trip creators`);
    const follows = await Follow.find({ follower: userId, following: { $in: userIds } }).select("following");
    const followingUserIds = new Set(follows.map(f => f.following.toString()));
    console.log(`[Feed] User ${userId} is following ${followingUserIds.size} trip creators`);

    // Calculate personalized scores
    console.log(`[Feed] Calculating personalized scores for trips`);
    let scoredTrips = allTrips.map(trip => ({
        ...trip,
        score: calculatePersonalizedScore({
            trip,
            user,
            followingIds,
            likeCount: likeMap[trip._id] || 0,
            saveCount: saveMap[trip._id] || 0,
            commentCount: trip.comments?.length || 0,
        }),
    }));

    // Sort and apply diversity filter
    scoredTrips.sort((a, b) => b.score - a.score);
    scoredTrips = applyDiversityFilter(scoredTrips);
    console.log(`[Feed] Scored and filtered trips. Total after diversity filter: ${scoredTrips.length}`);

    // Pagination
    const paginated = scoredTrips.slice(skip, skip + limit);
    console.log(`[Feed] Paginating: page ${page}, limit ${limit}, returning ${paginated.length} trips`);

    // Format trips with flags and aggregated reactions
    const tripsWithStatus = paginated.map(trip => {
        const processedComments = (trip.comments || []).map(comment => {
            const reactionsByEmoji = {};
            (comment.reactions || []).forEach(r => {
                reactionsByEmoji[r.emoji] = (reactionsByEmoji[r.emoji] || 0) + 1;
            });
            return { ...comment, reactionsAggregated: reactionsByEmoji };
        });

        return {
            ...trip,
            isLiked: likedTripIds.has(trip._id.toString()),
            isSaved: savedTripIds.has(trip._id.toString()),
            user: {
                ...trip.user,
                isFollowing: followingUserIds.has(trip.user._id.toString()),
            },
            comments: processedComments,
        };
    });

    // Cache result
    console.log(`[Feed] Caching feed for user ${userId} for 60 seconds`);
    await redis.setEx(cacheKey, 60, JSON.stringify(tripsWithStatus));

    console.log(`[Feed] Returning feed for user ${userId}`);
    return tripsWithStatus;
}

// ---------------------------
// Personalized scoring
// ---------------------------
function calculatePersonalizedScore({ trip, user, followingIds, likeCount, saveCount, commentCount }) {
    let score = 0;
    const hoursOld = (Date.now() - new Date(trip.createdAt)) / 36e5;

    score += Math.max(0, 40 - hoursOld);
    score += likeCount * 3 + commentCount * 5 + saveCount * 8;

    const creatorId = trip.user._id.toString();
    const isFollowed = followingIds.includes(creatorId);
    const isCreator = creatorId === user._id.toString();

    if (isFollowed) score += 40;
    if (!isFollowed && !isCreator) score += 15;

    const sharedActivities = (trip.activities || []).filter(a => user.preferences.includes(a));
    score += sharedActivities.length * 5;

    if (isCreator) score += 5;
    if (hoursOld > 96) score -= 20;
    score += Math.random() * 2;

    return score;
}

// ---------------------------
// Diversity filter
// ---------------------------
function applyDiversityFilter(trips) {
    const creatorMap = new Map();
    const result = [];

    for (let trip of trips) {
        const creatorId = trip.user._id.toString();
        const lastIndex = creatorMap.get(creatorId) || -Infinity;
        // if (result.length - lastIndex <= 1) continue; // instead of 2

        result.push(trip);
        creatorMap.set(creatorId, result.length - 1);
    }

    return result;
}
