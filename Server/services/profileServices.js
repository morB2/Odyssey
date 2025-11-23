// import User from "../models/userModel.js";
// import Trip from "../models/tripModel.js";
// import Like from "../models/likesModel.js";
// import Save from "../models/savesModel.js";
// import Follow from "../models/followModel.js";
// import bcrypt from "bcrypt";

// const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

// function normalizeAvatarUrl(avatar) {
//   if (!avatar) return avatar;
//   if (typeof avatar !== "string") return avatar;
//   if (avatar.startsWith("http://") || avatar.startsWith("https://"))
//     return avatar;
//   if (avatar.startsWith("/")) return `${SERVER_URL}${avatar}`;
//   return avatar;
// }

// export async function getProfile(userId) {
//   if (!userId) throw new Error("userId required");
//   const user = await User.findById(userId).select("-password -__v").lean();
//   if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
//   // normalize avatar to absolute URL for clients
//   if (user.avatar) user.avatar = normalizeAvatarUrl(user.avatar);
//   // include follower/following counts
//   try {
//     const followersCount = await Follow.countDocuments({ following: user._id });
//     const followingCount = await Follow.countDocuments({ follower: user._id });
//     return { ...user, followersCount, followingCount };
//   } catch (e) {
//     // on error computing counts, return user without counts but log
//     console.warn("failed to compute follow counts for user", userId, e);
//     return user;
//   }
// }

// export async function updateProfile(userId, updates) {
//   if (!userId) throw new Error("userId required");
//   const allowed = [
//     "firstName",
//     "lastName",
//     // email intentionally excluded: immutable via API
//     "birthday",
//     "preferences",
//     "avatar",
//   ];
//   const payload = {};
//   for (const k of allowed) if (k in updates) payload[k] = updates[k];
//   // If avatar is a local uploads path (starts with '/'), convert to absolute URL
//   if (payload.avatar && typeof payload.avatar === "string") {
//     const a = payload.avatar;
//     if (a.startsWith("/")) payload.avatar = normalizeAvatarUrl(a);
//   }
//   const user = await User.findByIdAndUpdate(userId, payload, { new: true })
//     .select("-password -__v")
//     .lean();
//   if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
//   if (user.avatar) user.avatar = normalizeAvatarUrl(user.avatar);
//   return user;
// }

// export async function updatePassword(userId, currentPassword, newPassword) {
//   if (!userId) throw new Error("userId required");
//   if (!newPassword) throw new Error("newPassword required");

//   const user = await User.findById(userId);
//   if (!user) throw Object.assign(new Error("User not found"), { status: 404 });

//   // If user already has a password, require currentPassword
//   if (user.password) {
//     if (!currentPassword)
//       throw Object.assign(new Error("Current password required"), {
//         status: 400,
//       });
//     const ok = await bcrypt.compare(currentPassword, user.password);
//     if (!ok)
//       throw Object.assign(new Error("Current password is incorrect"), {
//         status: 401,
//       });
//   }

//   const hashed = await bcrypt.hash(newPassword, 12);
//   user.password = hashed;
//   await user.save();
//   return { success: true };
// }

// export async function listUserTrips(userId, viewerId) {
//   // Backwards-compatible wrapper: prefer using listUserTripsForViewer
//   return listUserTripsForViewer(userId, viewerId);
// }

// // Enhanced version: returns trips for a specific owner with populated user/comments
// // and optional viewerId to compute isLiked/isSaved/isFollowing flags.
// export async function listUserTripsForViewer(ownerId, viewerId) {
//   if (!ownerId) throw new Error("ownerId required");

//   // get trips for owner
//   const trips = await Trip.find({ user: ownerId })
//     .sort({ createdAt: -1 })
//     .populate({ path: "user", select: "_id firstName lastName avatar" })
//     .populate({
//       path: "comments.user",
//       select: "_id firstName lastName avatar",
//     })
//     .lean();

//   if (!trips || trips.length === 0) return [];

//   const tripIds = trips.map((t) => t._id);

//   // prepare sets for likes and saves for this viewer (if provided)
//   const likedTripIds = new Set();
//   const savedTripIds = new Set();
//   const followingUserIds = new Set();

//   if (viewerId) {
//     const likes = await Like.find({
//       user: viewerId,
//       trip: { $in: tripIds },
//     }).select("trip");
//     const saves = await Save.find({
//       user: viewerId,
//       trip: { $in: tripIds },
//     }).select("trip");
//     likes.forEach((l) => likedTripIds.add(String(l.trip)));
//     saves.forEach((s) => savedTripIds.add(String(s.trip)));

//     // check follows for the owner
//     if (trips[0].user && trips[0].user._id) {
//       const f = await Follow.findOne({
//         follower: viewerId,
//         following: trips[0].user._id,
//       }).select("following");
//       if (f) followingUserIds.add(String(trips[0].user._id));
//     }
//   }

//   const tripsWithStatus = trips.map((trip) => ({
//     ...trip,
//     likes: trip.likes || 0,
//     isLiked: viewerId ? likedTripIds.has(String(trip._id)) : false,
//     isSaved: viewerId ? savedTripIds.has(String(trip._id)) : false,
//     user: {
//       ...trip.user,
//       isFollowing: viewerId
//         ? followingUserIds.has(String(trip.user?._id))
//         : false,
//     },
//     comments: trip.comments || [],
//   }));

//   // normalize avatars in returned trips
//   for (const t of tripsWithStatus) {
//     if (t.user && t.user.avatar)
//       t.user.avatar = normalizeAvatarUrl(t.user.avatar);
//     if (Array.isArray(t.comments)) {
//       for (const c of t.comments) {
//         if (c.user && c.user.avatar)
//           c.user.avatar = normalizeAvatarUrl(c.user.avatar);
//       }
//     }
//   }

//   return tripsWithStatus;
// }

// export async function getUserTrip(userId, tripId, viewerId) {
//   if (!userId || !tripId) throw new Error("userId and tripId required");

//   // populate owner info and comment users
//   const trip = await Trip.findOne({ _id: tripId, user: userId })
//     .populate({ path: "user", select: "_id firstName lastName avatar" })
//     .populate({
//       path: "comments.user",
//       select: "_id firstName lastName avatar",
//     })
//     .lean();

//   if (!trip) throw Object.assign(new Error("Trip not found"), { status: 404 });

//   // If a viewerId is provided, compute social flags (isLiked, isSaved, isFollowing)
//   if (viewerId) {
//     try {
//       const like = await Like.findOne({ user: viewerId, trip: trip._id }).select("_id");
//       trip.isLiked = !!like;

//       const save = await Save.findOne({ user: viewerId, trip: trip._id }).select("_id");
//       trip.isSaved = !!save;

//       if (trip.user && trip.user._id) {
//         const follow = await Follow.findOne({ follower: viewerId, following: trip.user._id }).select("_id");
//         trip.user.isFollowing = !!follow;
//       }
//     } catch (e) {
//       // don't fail the whole request if social lookups fail
//       console.warn("social flags lookup failed", e);
//     }
//   }

//   return trip;
// }

// export async function updateUserTrip(userId, tripId, updates) {
//   if (!userId || !tripId) throw new Error("userId and tripId required");
//   const allowed = [
//     "chosenTrip",
//     "title",
//     "description",
//     "optimizedRoute",
//     "activities",
//     "status",
//     "visabilityStatus",
//     "images",
//     "notes",
//   ];
//   const payload = {};
//   for (const k of allowed) if (k in updates) payload[k] = updates[k];
//   const trip = await Trip.findOneAndUpdate(
//     { _id: tripId, user: userId },
//     { $set: payload },
//     { new: true }
//   ).lean();
//   if (!trip) throw Object.assign(new Error("Trip not found"), { status: 404 });
//   return trip;
// }

// export async function deleteUserTrip(userId, tripId) {
//   if (!userId || !tripId) throw new Error("userId and tripId required");
//   const trip = await Trip.findOneAndDelete({
//     _id: tripId,
//     user: userId,
//   }).lean();
//   if (!trip) throw Object.assign(new Error("Trip not found"), { status: 404 });
//   return trip;
// }
import User from "../models/userModel.js";
import Trip from "../models/tripModel.js";
import Like from "../models/likesModel.js";
import Save from "../models/savesModel.js";
import Follow from "../models/followModel.js";
import bcrypt from "bcrypt";
import path from "path";
import fs from "fs";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";
const uploadsDir = path.join(process.cwd(), "uploads");

function normalizeAvatarUrl(avatar) {
  if (!avatar) return avatar;
  if (avatar.startsWith("http://") || avatar.startsWith("https://"))
    return avatar;
  if (avatar.startsWith("/")) return `${SERVER_URL}${avatar}`;
  return avatar;
}

// --- Profile ---
export async function getProfile(userId) {
  if (!userId) throw new Error("userId required");
  const user = await User.findById(userId).select("-password -__v").lean();
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  if (user.avatar) user.avatar = normalizeAvatarUrl(user.avatar);

  try {
    const followersCount = await Follow.countDocuments({ following: user._id });
    const followingCount = await Follow.countDocuments({ follower: user._id });
    return { ...user, followersCount, followingCount };
  } catch (e) {
    console.warn("failed to compute follow counts", userId, e);
    return user;
  }
}

export async function updatePassword(
  userId,
  authUser,
  currentPassword,
  newPassword
) {
  if (!userId || !newPassword)
    throw new Error("userId and newPassword required");
  if (!authUser || String(authUser._id || authUser.userId) !== String(userId))
    throw Object.assign(new Error("Forbidden"), { status: 403 });

  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });

  if (user.password) {
    if (!currentPassword)
      throw Object.assign(new Error("Current password required"), {
        status: 400,
      });
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok)
      throw Object.assign(new Error("Current password incorrect"), {
        status: 401,
      });
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
  return { success: true };
}

// --- Trips ---
export async function listUserTrips(userId, viewerId) {
  if (!userId) throw new Error("ownerId required");

  const trips = await Trip.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate({ path: "user", select: "_id firstName lastName avatar" })
    .populate({
      path: "comments.user",
      select: "_id firstName lastName avatar",
    })
    .lean();

  if (!trips || trips.length === 0) return [];

  const tripIds = trips.map((t) => t._id);
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

    const f = await Follow.findOne({
      follower: viewerId,
      following: trips[0].user._id,
    }).select("following");
    if (f) followingUserIds.add(String(trips[0].user._id));
  }

  return trips
    .map((trip) => ({
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
    }))
    .map((t) => {
      if (t.user?.avatar) t.user.avatar = normalizeAvatarUrl(t.user.avatar);
      t.comments.forEach((c) => {
        if (c.user?.avatar) c.user.avatar = normalizeAvatarUrl(c.user.avatar);
      });
      return t;
    });
}

export async function getUserTrip(userId, tripId, viewerId) {
  if (!userId || !tripId) throw new Error("userId and tripId required");

  const trip = await Trip.findOne({ _id: tripId, user: userId })
    .populate({ path: "user", select: "_id firstName lastName avatar" })
    .populate({
      path: "comments.user",
      select: "_id firstName lastName avatar",
    })
    .lean();

  if (!trip) throw Object.assign(new Error("Trip not found"), { status: 404 });

  if (viewerId) {
    trip.isLiked = !!(await Like.findOne({
      user: viewerId,
      trip: trip._id,
    }).select("_id"));
    trip.isSaved = !!(await Save.findOne({
      user: viewerId,
      trip: trip._id,
    }).select("_id"));
    if (trip.user?._id)
      trip.user.isFollowing = !!(await Follow.findOne({
        follower: viewerId,
        following: trip.user._id,
      }).select("_id"));
  }

  return trip;
}

// export async function updateUserTrip(userId, tripId, authUser, updates, files) {
//   if (!userId || !tripId) throw new Error("userId and tripId required");
//   if (!authUser || String(authUser._id || authUser.userId) != String(userId))
//     throw Object.assign(new Error("Forbidden"), { status: 403 });

//   const allowed = ["chosenTrip", "title", "description", "optimizedRoute", "activities", "status", "visabilityStatus", "images", "notes"];
//   const payload = {};
//   for (const k of allowed) if (k in updates) payload[k] = updates[k];

//   if (files && files.length > 0) {
//     const newPaths = files.map(f => `/uploads/${f.filename}`);
//     payload.images = payload.images ? [...payload.images, ...newPaths] : newPaths;
//   }

//   const trip = await Trip.findOneAndUpdate({ _id: tripId, user: userId }, { $set: payload }, { new: true }).lean();
//   if (!trip) throw Object.assign(new Error("Trip not found"), { status: 404 });
//   return trip;
// }
export async function updateUserTrip(userId, tripId, authUser, updates, files) {
  if (!userId || !tripId) throw new Error("userId and tripId required");
  if (!authUser || String(authUser._id || authUser.userId) != String(userId))
    throw Object.assign(new Error("Forbidden"), { status: 403 });

  const allowed = [
    "chosenTrip",
    "title",
    "description",
    "optimizedRoute",
    "activities",
    "status",
    "visabilityStatus",
    "images",
    "notes",
  ];
  const payload = {};

  for (const k of allowed) {
    if (k in updates) {
      payload[k] = updates[k];
    }
  }

  // אם images הגיעו בתור JSON string, נעשה parse
  if (payload.images && typeof payload.images === "string") {
    try {
      payload.images = JSON.parse(payload.images);
    } catch (err) {
      console.warn("Failed to parse images JSON:", err);
      payload.images = []; // fallback
    }
  }

  if (files && files.length > 0) {
    const newPaths = files.map((f) => `/uploads/${f.filename}`);
    payload.images = payload.images
      ? [...payload.images, ...newPaths]
      : newPaths;
  }

  const trip = await Trip.findOneAndUpdate(
    { _id: tripId, user: userId },
    { $set: payload },
    { new: true }
  ).lean();

  if (!trip) throw Object.assign(new Error("Trip not found"), { status: 404 });
  return trip;
}

export async function deleteUserTrip(userId, tripId, authUser) {
  if (!userId || !tripId) throw new Error("userId and tripId required");
  if (!authUser || String(authUser._id || authUser.userId) !== String(userId))
    throw Object.assign(new Error("Forbidden"), { status: 403 });

  const trip = await Trip.findOneAndDelete({
    _id: tripId,
    user: userId,
  }).lean();
  if (!trip) throw Object.assign(new Error("Trip not found"), { status: 404 });
  return trip;
}

// --- Avatar upload (clean) ---
export async function updateProfileAvatar(userId, authUser, file, avatarUrl) {
  if (!userId) throw new Error("userId required");
  if (!authUser || String(authUser._id || authUser.userId) !== String(userId))
    throw Object.assign(new Error("Forbidden"), { status: 403 });

  const avatarValue = file ? `/uploads/${file.filename}` : avatarUrl;
  if (!avatarValue)
    throw Object.assign(new Error("No avatar provided"), { status: 400 });

  // Remove old avatar file if exists
  try {
    const prev = await User.findById(userId).lean();
    const prevAvatar = prev?.avatar;
    if (prevAvatar?.includes("/uploads/") && prevAvatar !== avatarValue) {
      const filename = path.join(uploadsDir, prevAvatar.split("/uploads/")[1]);
      if (fs.existsSync(filename)) fs.unlinkSync(filename);
    }
  } catch (e) {
    console.warn("failed to remove previous avatar file", e);
  }

  return User.findByIdAndUpdate(userId, { avatar: avatarValue }, { new: true })
    .select("-password -__v")
    .lean();
}
