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
  // 1. Get first 10 trips, including user info and populated comment users
  const trips = await Trip.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate({
      path: "user",
      select: "_id firstName lastName avatar",
    })
    .populate({
      path: "comments.user", // 👈 populate comment users too
      select: "_id firstName lastName avatar",
    })
    .lean(); // convert to plain objects

  // 2. Extract trip and user IDs
  const tripIds = trips.map((t) => t._id);
  const userIds = trips.map((t) => t.user._id);

  // 3. Get likes and saves for current user
  const likedTrips = await Like.find({
    user: currentUserId,
    trip: { $in: tripIds },
  }).select("trip");

  const savedTrips = await Save.find({
    user: currentUserId,
    trip: { $in: tripIds },
  }).select("trip");

  const likedTripIds = new Set(likedTrips.map((l) => l.trip.toString()));
  const savedTripIds = new Set(savedTrips.map((s) => s.trip.toString()));

  // 4. Get follow status for users
  const follows = await Follow.find({
    follower: currentUserId,
    following: { $in: userIds },
  }).select("following");

  const followingUserIds = new Set(follows.map((f) => f.following.toString()));

  // 5. Add flags + comments to trips
  const tripsWithStatus = trips.map((trip) => ({
    ...trip,
    isLiked: likedTripIds.has(trip._id.toString()),
    isSaved: savedTripIds.has(trip._id.toString()),
    user: {
      ...trip.user,
      isFollowing: followingUserIds.has(trip.user._id.toString()),
    },
    comments: trip.comments || [], // 👈 ensure comments are included
  }));

  return tripsWithStatus;
}


/**
 * Adds a comment to a specific trip.
 * @param {string} tripId - ID of the trip to comment on
 * @param {string} userId - ID of the commenting user
 * @param {string} commentText - Comment content
 */
export async function postCommentForUser(tripId, userId, commentText) {
  if (!commentText?.trim()) throw new Error("Comment cannot be empty.");

  // Add new comment
  const updatedTrip = await Trip.findByIdAndUpdate(
    tripId,
    {
      $push: {
        comments: {
          user: userId,
          comment: commentText,
        },
      },
    },
    { new: true } // return updated doc
  )
    .populate({
      path: "comments.user",
      select: "_id firstName lastName avatar",
    })
    .lean();

  if (!updatedTrip) throw new Error("Trip not found.");

  // Get the last added comment (most recent one)
  const newComment = updatedTrip.comments[updatedTrip.comments.length - 1];

  return {
    _id: newComment._id,
    comment: newComment.comment,
    createdAt: newComment.createdAt,
    user: newComment.user
      ? {
        _id: newComment.user._id,
        firstName: newComment.user.firstName,
        lastName: newComment.user.lastName,
        avatar: newComment.user.avatar,
      }
      : null,
  };
}
