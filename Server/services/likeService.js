import Trip from "../models/tripModel.js";
import Like from "../models/likesModel.js";

export const likeTrip = async (userId, tripId) => {
  // Check if the like already exists
  const existingLike = await Like.findOne({ user: userId, trip: tripId });
  if (existingLike) throw new Error("You have already liked this trip.");

  // Add like
  const like = new Like({ user: userId, trip: tripId });
  await like.save();

  // Increment likes in trip
  const trip = await Trip.findByIdAndUpdate(tripId, { $inc: { likes: 1 } }, { new: true });
  return trip.likes;
};

export const unlikeTrip = async (userId, tripId) => {
  // Check if the like exists
  const existingLike = await Like.findOne({ user: userId, trip: tripId });
  if (!existingLike) throw new Error("You have not liked this trip yet.");

  // Remove like
  await Like.deleteOne({ _id: existingLike._id });

  // Decrement likes in trip
  const trip = await Trip.findByIdAndUpdate(tripId, { $inc: { likes: -1 } }, { new: true });
  return trip.likes;
};

export const getLikedTripsByUser = async (userId) => {
  // Find all likes by the user and populate trip details
  const likes = await Like.find({ user: userId }).populate("trip");
  
  // Return only the trips
  return likes.map(like => like.trip);
};