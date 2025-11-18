import User from "../models/userModel.js";
import Trip from "../models/tripModel.js";
import Like from "../models/likesModel.js";
import Save from "../models/savesModel.js";
import Follow from "../models/followModel.js";
import bcrypt from "bcrypt";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

function normalizeAvatarUrl(avatar) {
  if (!avatar) return avatar;
  if (typeof avatar !== "string") return avatar;
  if (avatar.startsWith("http://") || avatar.startsWith("https://"))
    return avatar;
  if (avatar.startsWith("/")) return `${SERVER_URL}${avatar}`;
  return avatar;
}

export async function getProfile(userId) {
  if (!userId) throw new Error("userId required");
  const user = await User.findById(userId).select("-password -__v").lean();
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  // normalize avatar to absolute URL for clients
  if (user.avatar) user.avatar = normalizeAvatarUrl(user.avatar);
  // include follower/following counts
  try {
    const followersCount = await Follow.countDocuments({ following: user._id });
    const followingCount = await Follow.countDocuments({ follower: user._id });
    return { ...user, followersCount, followingCount };
  } catch (e) {
    // on error computing counts, return user without counts but log
    console.warn("failed to compute follow counts for user", userId, e);
    return user;
  }
}

export async function updateProfile(userId, updates) {
  if (!userId) throw new Error("userId required");
  const allowed = [
    "firstName",
    "lastName",
    // email intentionally excluded: immutable via API
    "birthday",
    "preferences",
    "avatar",
  ];
  const payload = {};
  for (const k of allowed) if (k in updates) payload[k] = updates[k];
  const user = await User.findByIdAndUpdate(userId, payload, { new: true })
    .select("-password -__v")
    .lean();
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  if (user.avatar) user.avatar = normalizeAvatarUrl(user.avatar);
  return user;
}

export async function updatePassword(userId, currentPassword, newPassword) {
  if (!userId) throw new Error("userId required");
  if (!newPassword) throw new Error("newPassword required");

  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });

  // If user already has a password, require currentPassword
  if (user.password) {
    if (!currentPassword)
      throw Object.assign(new Error("Current password required"), {
        status: 400,
      });
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok)
      throw Object.assign(new Error("Current password is incorrect"), {
        status: 401,
      });
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  user.password = hashed;
  await user.save();
  return { success: true };
}

export async function listUserTrips(userId) {
  throw new Error("use listUserTrips(userId, viewerId?) instead");
}

// Enhanced version: returns trips for a specific owner with populated user/comments
// and optional viewerId to compute isLiked/isSaved/isFollowing flags.
export async function listUserTripsForViewer(ownerId, viewerId) {
  if (!ownerId) throw new Error("ownerId required");

  // get trips for owner
  const trips = await Trip.find({ user: ownerId })
    .sort({ createdAt: -1 })
    .populate({ path: "user", select: "_id firstName lastName avatar" })
    .populate({
      path: "comments.user",
      select: "_id firstName lastName avatar",
    })
    .lean();

  if (!trips || trips.length === 0) return [];

  const tripIds = trips.map((t) => t._id);

  // prepare sets for likes and saves for this viewer (if provided)
  const likedTripIds = new Set();
  const savedTripIds = new Set();
  const followingUserIds = new Set();

  if (viewerId) {
    const likes = await Like.find({
      user: viewerId,
      trip: { $in: tripIds },
    }).select("trip");
    const saves = await Save.find({
      user: viewerId,
      trip: { $in: tripIds },
    }).select("trip");
    likes.forEach((l) => likedTripIds.add(String(l.trip)));
    saves.forEach((s) => savedTripIds.add(String(s.trip)));

    // check follows for the owner
    if (trips[0].user && trips[0].user._id) {
      const f = await Follow.findOne({
        follower: viewerId,
        following: trips[0].user._id,
      }).select("following");
      if (f) followingUserIds.add(String(trips[0].user._id));
    }
  }

  const tripsWithStatus = trips.map((trip) => ({
    ...trip,
    likes: trip.likes || 0,
    isLiked: viewerId ? likedTripIds.has(String(trip._id)) : false,
    isSaved: viewerId ? savedTripIds.has(String(trip._id)) : false,
    user: {
      ...trip.user,
      isFollowing: viewerId
        ? followingUserIds.has(String(trip.user?._id))
        : false,
    },
    comments: trip.comments || [],
  }));

  // normalize avatars in returned trips
  for (const t of tripsWithStatus) {
    if (t.user && t.user.avatar)
      t.user.avatar = normalizeAvatarUrl(t.user.avatar);
    if (Array.isArray(t.comments)) {
      for (const c of t.comments) {
        if (c.user && c.user.avatar)
          c.user.avatar = normalizeAvatarUrl(c.user.avatar);
      }
    }
  }

  return tripsWithStatus;
}

export async function getUserTrip(userId, tripId, viewerId) {
  if (!userId || !tripId) throw new Error("userId and tripId required");

  // populate owner info and comment users
  const trip = await Trip.findOne({ _id: tripId, user: userId })
    .populate({ path: "user", select: "_id firstName lastName avatar" })
    .populate({
      path: "comments.user",
      select: "_id firstName lastName avatar",
    })
    .lean();

  if (!trip) throw Object.assign(new Error("Trip not found"), { status: 404 });

  // If a viewerId is provided, compute social flags (isLiked, isSaved, isFollowing)
  if (viewerId) {
    const Like = await import("./../models/likesModel.js")
      .then((m) => m.default)
      .catch(() => null);
    const Save = await import("./../models/savesModel.js")
      .then((m) => m.default)
      .catch(() => null);
    const Follow = await import("./../models/followModel.js")
      .then((m) => m.default)
      .catch(() => null);

    try {
      if (Like) {
        const like = await Like.findOne({
          user: viewerId,
          trip: trip._id,
        }).select("_id");
        trip.isLiked = !!like;
      }
      if (Save) {
        const save = await Save.findOne({
          user: viewerId,
          trip: trip._id,
        }).select("_id");
        trip.isSaved = !!save;
      }
      if (Follow && trip.user && trip.user._id) {
        const follow = await Follow.findOne({
          follower: viewerId,
          following: trip.user._id,
        }).select("_id");
        trip.user.isFollowing = !!follow;
      }
    } catch (e) {
      // don't fail the whole request if social lookups fail
      console.warn("social flags lookup failed", e);
    }
  }

  return trip;
}

export async function updateUserTrip(userId, tripId, updates) {
  if (!userId || !tripId) throw new Error("userId and tripId required");
  const allowed = [
    "chosenTrip",
    "title",
    "description",
    "optimizedRoute",
    "activities",
    "status",
    "visabilityStatus",
    "notes",
  ];
  const payload = {};
  for (const k of allowed) if (k in updates) payload[k] = updates[k];
  const trip = await Trip.findOneAndUpdate(
    { _id: tripId, user: userId },
    { $set: payload },
    { new: true }
  ).lean();
  if (!trip) throw Object.assign(new Error("Trip not found"), { status: 404 });
  return trip;
}

export async function deleteUserTrip(userId, tripId) {
  if (!userId || !tripId) throw new Error("userId and tripId required");
  const trip = await Trip.findOneAndDelete({
    _id: tripId,
    user: userId,
  }).lean();
  if (!trip) throw Object.assign(new Error("Trip not found"), { status: 404 });
  return trip;
}
