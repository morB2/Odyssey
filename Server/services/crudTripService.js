import Trip from "../models/tripModel.js";
import Like from "../models/likesModel.js";
import Save from "../models/savesModel.js";
import Follow from "../models/followModel.js";
import User from "../models/userModel.js"; // Assuming User has name & avatar

/**
 * Get first 10 trips with user info, following, liked, and saved status
 * @param {String} currentUserId - the ID of the current logged-in user
 */
export async function getTripsForUser(currentUserId) {
  // 1. Get first 10 trips, populate the user info
  const trips = await Trip.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate({
      path: "user",
      select: "_id firstName lastName avatar", // select only needed fields
    })
    .lean(); // lean() converts Mongoose docs to plain JS objects

  // 2. Extract trip ids and user ids
  const tripIds = trips.map((t) => t._id);
  const userIds = trips.map((t) => t.user._id);

  // 3. Get likes and saves for current user
  const likedTrips = await Like.find({ user: currentUserId, trip: { $in: tripIds } }).select("trip");
  const savedTrips = await Save.find({ user: currentUserId, trip: { $in: tripIds } }).select("trip");

  const likedTripIds = new Set(likedTrips.map((l) => l.trip.toString()));
  const savedTripIds = new Set(savedTrips.map((s) => s.trip.toString()));

  // 4. Get follow status for users
  const follows = await Follow.find({ follower: currentUserId, following: { $in: userIds } }).select("following");
  const followingUserIds = new Set(follows.map((f) => f.following.toString()));

  // 5. Add flags to trips
  const tripsWithStatus = trips.map((trip) => ({
    ...trip,
    isLiked: likedTripIds.has(trip._id.toString()),
    isSaved: savedTripIds.has(trip._id.toString()),
    user: {
      ...trip.user,
      isFollowing: followingUserIds.has(trip.user._id.toString()),
    },
  }));

  return tripsWithStatus;
}

