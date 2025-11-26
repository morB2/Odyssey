import User from "../models/userModel.js";
import Trip from "../models/tripModel.js";
import Like from "../models/likesModel.js";
import Save from "../models/savesModel.js";
import Follow from "../models/followModel.js";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

function normalizeAvatarUrl(avatar) {
    if (!avatar) return avatar;
    if (typeof avatar !== "string") return avatar;
    if (avatar.startsWith("http://") || avatar.startsWith("https://"))
        return avatar;
    if (avatar.startsWith("/")) return `${SERVER_URL}${avatar}`;
    return avatar;
}

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

    // Log the search query for debugging
    console.log('Search query:', query.trim());
    console.log('Query length:', query.trim().length);
    console.log('Query bytes:', Buffer.from(query.trim(), 'utf8'));

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

    console.log('Found users:', users.length);

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

    // Search trips by title, description, or activities
    const trips = await Trip.find({
        visabilityStatus: "public", // Only public trips
        $or: [
            { title: { $regex: searchPattern, $options: 'i' } },
            { description: { $regex: searchPattern, $options: 'i' } },
            { activities: { $regex: searchPattern, $options: 'i' } },
        ],
    })
        .sort({ createdAt: -1 })
        .limit(tripLimit)
        .populate({ path: "user", select: "_id firstName lastName avatar" })
        .populate({
            path: "comments.user",
            select: "_id firstName lastName avatar",
        })
        .populate({
            path: "comments.replies.user",
            select: "_id firstName lastName avatar",
        })
        .lean();

    console.log('Found trips:', trips.length);

    // If viewerId is provided, add social flags (isLiked, isSaved, isFollowing)
    if (viewerId && trips.length > 0) {
        const tripIds = trips.map((t) => t._id);

        // Get likes and saves for this viewer
        const likes = await Like.find({
            user: viewerId,
            trip: { $in: tripIds },
        }).select("trip");

        const saves = await Save.find({
            user: viewerId,
            trip: { $in: tripIds },
        }).select("trip");

        const likedTripIds = new Set(likes.map((l) => String(l.trip)));
        const savedTripIds = new Set(saves.map((s) => String(s.trip)));

        // Get follows for trip owners
        const ownerIds = trips.map((t) => t.user?._id).filter(Boolean);
        const follows = await Follow.find({
            follower: viewerId,
            following: { $in: ownerIds },
        }).select("following");

        const followingUserIds = new Set(follows.map((f) => String(f.following)));

        // Add flags to trips
        trips.forEach((trip) => {
            trip.isLiked = likedTripIds.has(String(trip._id));
            trip.isSaved = savedTripIds.has(String(trip._id));
            trip.likes = trip.likes || 0;

            if (trip.user) {
                trip.user.avatar = normalizeAvatarUrl(trip.user.avatar);
                trip.user.isFollowing = followingUserIds.has(String(trip.user._id));
            }

            // Normalize comment avatars
            if (Array.isArray(trip.comments)) {
                trip.comments.forEach((comment) => {
                    if (comment.user?.avatar) {
                        comment.user.avatar = normalizeAvatarUrl(comment.user.avatar);
                    }
                    if (Array.isArray(comment.replies)) {
                        comment.replies.forEach((reply) => {
                            if (reply.user?.avatar) {
                                reply.user.avatar = normalizeAvatarUrl(reply.user.avatar);
                            }
                        });
                    }
                });
            }
        });
    } else {
        // No viewer, just normalize avatars
        trips.forEach((trip) => {
            trip.isLiked = false;
            trip.isSaved = false;
            trip.likes = trip.likes || 0;

            if (trip.user?.avatar) {
                trip.user.avatar = normalizeAvatarUrl(trip.user.avatar);
                trip.user.isFollowing = false;
            }

            if (Array.isArray(trip.comments)) {
                trip.comments.forEach((comment) => {
                    if (comment.user?.avatar) {
                        comment.user.avatar = normalizeAvatarUrl(comment.user.avatar);
                    }
                    if (Array.isArray(comment.replies)) {
                        comment.replies.forEach((reply) => {
                            if (reply.user?.avatar) {
                                reply.user.avatar = normalizeAvatarUrl(reply.user.avatar);
                            }
                        });
                    }
                });
            }
        });
    }

    return { users, trips };
}
