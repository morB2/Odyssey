import Save from "../models/savesModel.js";
import User from "../models/userModel.js";
import Trip from "../models/tripModel.js";
import Follow from "../models/followModel.js";
import { clearUserFeedCache, clearUserSavedCache } from "../utils/cacheUtils.js";
import redis from '../db/redisClient.js';

export const saveTrip = async (userId, tripId) => {
  const existingSave = await Save.findOne({ user: userId, trip: tripId });
  if (existingSave) return existingSave;

  const save = new Save({ user: userId, trip: tripId });
  await save.save();

  const trip = await Trip.findById(tripId).select("activities");

  if (trip?.activities?.length) {
    await User.findByIdAndUpdate(userId, {
      $addToSet: {
        preferences: { $each: trip.activities },
      },
    });
  }

  await clearUserFeedCache(userId);
  await clearUserSavedCache(userId);
  return save;
};

export const unSaveTrip = async (userId, tripId) => {
  const existingSave = await Save.findOne({ user: userId, trip: tripId });
  if (!existingSave) return true;

  await Save.deleteOne({ _id: existingSave._id });
  await clearUserFeedCache(userId);
  await clearUserSavedCache(userId);

  return true;
};

export const getSavedTripsByUser = async (userId) => {
  const cacheKey = `saved:${userId}`;

  const cached = await redis.get(cacheKey);
  if (cached) {

    return JSON.parse(cached);
  }



  const saves = await Save.find({ user: userId })
    .populate({
      path: "trip",
      populate: [
        { path: "user", select: "_id firstName lastName avatar" },
        { path: "comments.user", select: "_id firstName lastName avatar" },
      ],
    })
    .lean();

  const trips = saves.map((s) => s.trip).filter(Boolean);
  if (!trips.length) return [];

  const tripIds = trips.map((t) => t._id);

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
    isLiked: false,
    isSaved: true,
    user: {
      ...(trip.user || {}),
      isFollowing:
        trip.user && trip.user._id
          ? followingSet.has(String(trip.user._id))
          : false,
    },
    comments: trip.comments || [],
  }));

  await redis.setEx(cacheKey, 60, JSON.stringify(tripsWithStatus));

  return tripsWithStatus;
};
