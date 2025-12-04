import Trip from "../models/tripModel.js";
import Like from "../models/likesModel.js";
import User from "../models/userModel.js";
import Save from "../models/savesModel.js";
import Follow from "../models/followModel.js";
import { clearUserFeedCache, clearUserLikedCache } from "../utils/cacheUtils.js";
import redis from '../db/redisClient.js';
export const likeTrip = async (userId, tripId) => {
  // Check if the like already exists
  const existingLike = await Like.findOne({ user: userId, trip: tripId });
  if (existingLike) throw new Error("You have already liked this trip.");

  // Add like
  const like = new Like({ user: userId, trip: tripId });
  await like.save();

  // Increment likes in trip
  const trip = await Trip.findByIdAndUpdate(
    tripId,
    { $inc: { likes: 1 } },
    { new: true }
  );

  const tripPrefrences = await Trip.findById(tripId).select("activities");

  if (tripPrefrences?.activities?.length) {
    await User.findByIdAndUpdate(userId, {
      $addToSet: {
        preferences: { $each: tripPrefrences.activities },
      },
    });
  }
  await clearUserFeedCache(userId);
  await clearUserLikedCache(userId);
  return trip.likes;
};

export const unlikeTrip = async (userId, tripId) => {
  // Check if the like exists
  const existingLike = await Like.findOne({ user: userId, trip: tripId });
  if (!existingLike) throw new Error("You have not liked this trip yet.");

  // Remove like
  await Like.deleteOne({ _id: existingLike._id });

  // Decrement likes in trip
  const trip = await Trip.findByIdAndUpdate(
    tripId,
    { $inc: { likes: -1 } },
    { new: true }
  );
  await clearUserFeedCache(userId);
  await clearUserLikedCache(userId);
  return trip.likes;
};

export const getLikedTripsByUser = async (userId) => {
  const cacheKey = `liked:${userId}`;

  // Check Redis cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Find all likes by the user and populate nested trip -> user and comments.user
  const likes = await Like.find({ user: userId })
    .populate({
      path: "trip",
      populate: [
        { path: "user", select: "_id firstName lastName avatar" },
        { path: "comments.user", select: "_id firstName lastName avatar" },
      ],
    })
    .lean();

  const trips = likes.map((l) => l.trip).filter(Boolean);
  if (!trips.length) return [];

  const tripIds = trips.map((t) => t._id);

  // compute saved trips for this viewer (so we can set isSaved)
  const saves = await Save.find({
    user: userId,
    trip: { $in: tripIds },
  }).select("trip");
  const savedSet = new Set(saves.map((s) => String(s.trip)));

  // compute follows for trip owners
  const ownerIds = Array.from(
    new Set(trips.map((t) => String(t.user?._id)).filter(Boolean))
  );
  const follows = await Follow.find({
    follower: userId,
    following: { $in: ownerIds },
  }).select("following");
  const followingSet = new Set(follows.map((f) => String(f.following)));

  const tripsWithStatus = trips.map((trip) => ({
    ...trip,
    likes: trip.likes || 0,
    isLiked: true,
    isSaved: savedSet.has(String(trip._id)),
    user: {
      ...(trip.user || {}),
      isFollowing:
        trip.user && trip.user._id
          ? followingSet.has(String(trip.user._id))
          : false,
    },
    comments: trip.comments || [],
  }));

  // Cache result for 60 seconds
  await redis.setEx(cacheKey, 60, JSON.stringify(tripsWithStatus));

  return tripsWithStatus;
};
