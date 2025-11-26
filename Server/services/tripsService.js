// // tripsService.js
// import Trip from "../models/tripModel.js";
// import Like from "../models/likesModel.js";
// import Save from "../models/savesModel.js";
// import Follow from "../models/followModel.js";
// import User from "../models/userModel.js";
// import redis from '../db/redisClient.js';

// const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";
// function normalizeAvatarUrl(avatar) {
//   if (!avatar) return avatar;
//   if (typeof avatar !== "string") return avatar;
//   if (avatar.startsWith("http://") || avatar.startsWith("https://")) return avatar;
//   if (avatar.startsWith("/")) return `${SERVER_URL}${avatar}`;
//   return avatar;
// }

// function calculatePersonalizedScore({ trip, user, followingIds, likeCount, saveCount, commentCount }) {
//   let score = 0;
//   const hoursOld = (Date.now() - new Date(trip.createdAt)) / 36e5;

//   score += Math.max(0, 40 - hoursOld);
//   score += likeCount * 3 + commentCount * 5 + saveCount * 8;

//   const creatorId = trip.user._id.toString();
//   const isFollowed = followingIds.includes(creatorId);
//   const isCreator = creatorId === user._id.toString();

//   if (isFollowed) score += 40;
//   if (!isFollowed && !isCreator) score += 15;

//   const sharedActivities = (trip.activities || []).filter(a => user.preferences?.includes(a));
//   score += sharedActivities.length * 5;

//   if (isCreator) score += 5;
//   if (hoursOld > 96) score -= 20;
//   score += Math.random() * 2;

//   return score;
// }

// function applyDiversityFilter(trips) {
//   const creatorMap = new Map();
//   const result = [];

//   for (let trip of trips) {
//     const creatorId = trip.user._id.toString();
//     const lastIndex = creatorMap.get(creatorId) || -Infinity;
//     result.push(trip);
//     creatorMap.set(creatorId, result.length - 1);
//   }

//   return result;
// }

// // ---------------------------
// // Core function: fetch trips
// // ---------------------------
// export async function fetchTrips({ 
//   filter = {}, 
//   viewerId, 
//   page, 
//   limit, 
//   forFeed = false, 
//   cacheKey = null 
// }) {
//   if (forFeed && cacheKey) {
//     const cached = await redis.get(cacheKey);
//     if (cached) return JSON.parse(cached);
//   }

//   const skip = page && limit ? (page - 1) * limit : 0;

//   const trips = await Trip.find(filter)
//     .sort({ createdAt: -1 })
//     .populate("user", "_id firstName lastName avatar")
//     .populate("comments.user", "_id firstName lastName avatar")
//     .lean();

//   if (!trips || trips.length === 0) return [];

//   const tripIds = trips.map(t => t._id);
//   const userIds = trips.map(t => t.user._id.toString());

//   let likedTripIds = new Set();
//   let savedTripIds = new Set();
//   let followingUserIds = new Set();

//   if (viewerId) {
//     const [likes, saves, follows] = await Promise.all([
//       Like.find({ user: viewerId, trip: { $in: tripIds } }).select("trip"),
//       Save.find({ user: viewerId, trip: { $in: tripIds } }).select("trip"),
//       Follow.find({ follower: viewerId, following: { $in: userIds } }).select("following")
//     ]);

//     likes.forEach(l => likedTripIds.add(String(l.trip)));
//     saves.forEach(s => savedTripIds.add(String(s.trip)));
//     follows.forEach(f => followingUserIds.add(String(f.following)));
//   }

//   // Preload counts for feed or profile (optional)
//   let likeMap = {}, saveMap = {};
//   if (forFeed || tripIds.length > 0) {
//     const [likeCounts, saveCounts] = await Promise.all([
//       Like.aggregate([{ $match: { trip: { $in: tripIds } } }, { $group: { _id: "$trip", count: { $sum: 1 } } }]),
//       Save.aggregate([{ $match: { trip: { $in: tripIds } } }, { $group: { _id: "$trip", count: { $sum: 1 } } }])
//     ]);
//     likeMap = Object.fromEntries(likeCounts.map(l => [l._id.toString(), l.count]));
//     saveMap = Object.fromEntries(saveCounts.map(s => [s._id.toString(), s.count]));
//   }

//   // Fetch user object for scoring
//   let userObj = null;
//   if (viewerId && forFeed) {
//     userObj = await User.findById(viewerId).lean();
//   }

//   const processedTrips = trips.map(trip => {
//     const commentsWithReactions = (trip.comments || []).map(c => {
//       const reactionsAggregated = {};
//       (c.reactions || []).forEach(r => {
//         reactionsAggregated[r.emoji] = (reactionsAggregated[r.emoji] || 0) + 1;
//       });
//       return { ...c, reactionsAggregated };
//     });

//     let score = 0;
//     if (forFeed && viewerId && userObj) {
//       score = calculatePersonalizedScore({
//         trip,
//         user: userObj,
//         followingIds: Array.from(followingUserIds),
//         likeCount: likeMap[trip._id] || 0,
//         saveCount: saveMap[trip._id] || 0,
//         commentCount: trip.comments?.length || 0
//       });
//     }

//     return {
//       ...trip,
//       score,
//       likes: likeMap[trip._id] || 0,
//       saves: saveMap[trip._id] || 0,
//       isLiked: viewerId ? likedTripIds.has(String(trip._id)) : false,
//       isSaved: viewerId ? savedTripIds.has(String(trip._id)) : false,
//       user: {
//         ...trip.user,
//         isFollowing: viewerId ? followingUserIds.has(String(trip.user._id)) : false
//       },
//       comments: commentsWithReactions
//     };
//   });

//   let finalTrips = processedTrips;
//   if (forFeed) {
//     finalTrips.sort((a, b) => b.score - a.score);
//     finalTrips = applyDiversityFilter(finalTrips);
//   }

//   const paginatedTrips = page && limit ? finalTrips.slice(skip, skip + limit) : finalTrips;

//   for (const t of paginatedTrips) {
//     if (t.user && t.user.avatar) t.user.avatar = normalizeAvatarUrl(t.user.avatar);
//     if (Array.isArray(t.comments)) {
//       for (const c of t.comments) {
//         if (c.user && c.user.avatar) c.user.avatar = normalizeAvatarUrl(c.user.avatar);
//       }
//     }
//   }

//   if (forFeed && cacheKey) {
//     await redis.setEx(cacheKey, 60, JSON.stringify(paginatedTrips));
//   }

//   return paginatedTrips;
// }

// // Wrappers
// export async function getFeedForUser(userId, page = 1, limit = 20) {
//   const cacheKey = `feed:${userId}:page:${page}:limit:${limit}`;
//   return fetchTrips({ 
//     filter: { visabilityStatus: "public" },
//     viewerId: userId,
//     page,
//     limit,
//     forFeed: true,
//     cacheKey
//   });
// }

// export async function listUserTripsForViewer(ownerId, viewerId) {
//   return fetchTrips({
//     filter: { user: ownerId },
//     viewerId,
//     forFeed: false
//   });
// }
