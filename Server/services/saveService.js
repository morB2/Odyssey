import Save from "../models/savesModel.js";
import Trip from "../models/tripModel.js";
import Follow from "../models/followModel.js";

export const saveTrip = async (userId, tripId) => {
  const existingSave = await Save.findOne({ user: userId, trip: tripId });
  if (existingSave) throw new Error("You have already saved this trip.");

  const save = new Save({ user: userId, trip: tripId });
  await save.save();
  return save;
};

export const unSaveTrip = async (userId, tripId) => {
  const existingSave = await Save.findOne({ user: userId, trip: tripId });
  if (!existingSave) throw new Error("You have not saved this trip yet.");

  await Save.deleteOne({ _id: existingSave._id });
  return true;
};

export const getSavedTripsByUser = async (userId) => {
  // return saved trips enriched similar to profile trips
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

  // all saved by this user -> isSaved = true
  // compute follows for owners
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

  return tripsWithStatus;
};
