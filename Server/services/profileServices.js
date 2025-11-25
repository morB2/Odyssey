import User from "../models/userModel.js";
import Trip from "../models/tripModel.js";
import Like from "../models/likesModel.js";
import Save from "../models/savesModel.js";
import Follow from "../models/followModel.js";
import bcrypt from "bcrypt";
import redis from "../db/redisClient.js";
import {
  clearUserFeedCache,
  clearUserProfileCache,
} from "../utils/cacheUtils.js";
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
  // Backwards-compatible wrapper: prefer using listUserTripsForViewer
  return listUserTripsForViewer(userId, viewerId);
}

// Enhanced version: returns trips for a specific owner with populated user/comments
// and optional viewerId to compute isLiked/isSaved/isFollowing flags.
export async function listUserTripsForViewer(ownerId, viewerId) {
  if (!ownerId) throw new Error("ownerId required");

  const cacheKey = `profile:${ownerId}:trips:viewer:${viewerId || "none"}`;
  console.log(
    `[Profile] Checking cache for user ${ownerId}, viewer ${viewerId}`
  );

  // Check Redis cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log(
      `[Profile] Cache hit! Returning cached trips for user ${ownerId}`
    );
    return JSON.parse(cached);
  }

  console.log(
    `[Profile] Cache miss. Loading trips from DB for user ${ownerId}`
  );

  const trips = await Trip.find({ user: ownerId })
    .sort({ createdAt: -1 })
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

  // Cache result for 60 seconds
  console.log(`[Profile] Caching trips for user ${ownerId} for 60 seconds`);
  await redis.setEx(cacheKey, 60, JSON.stringify(tripsWithStatus));

  return tripsWithStatus;
}

export async function getUserTrip(userId, tripId, viewerId) {
  if (!userId || !tripId) throw new Error("userId and tripId required");

  const trip = await Trip.findOne({ _id: tripId, user: userId })
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

  // Handle imagesExisting from client (prioritize over 'images' if present)
  if (updates.imagesExisting) {
    try {
      const existing = typeof updates.imagesExisting === "string"
        ? JSON.parse(updates.imagesExisting)
        : updates.imagesExisting;
      payload.images = Array.isArray(existing) ? existing : [existing];
    } catch (err) {
      console.warn("Failed to parse imagesExisting:", err);
      payload.images = [];
    }
  } else if (payload.images && typeof payload.images === "string") {
    // Fallback to parsing 'images' if it's a string
    try {
      payload.images = JSON.parse(payload.images);
    } catch (err) {
      console.warn("Failed to parse images JSON:", err);
      payload.images = []; // fallback
    }
  }

  if (files && files.length > 0) {
    const newPaths = files.map((f) => {
      const p = `/uploads/${f.filename}`;
      return p.startsWith("/") ? normalizeAvatarUrl(p) : p;
    });

    // Ensure payload.images is an array
    const currentImages = payload.images ? (Array.isArray(payload.images) ? payload.images : [payload.images]).map((img) =>
      typeof img === "string" && img.startsWith("/")
        ? normalizeAvatarUrl(img)
        : img
    ) : [];

    // Merge and deduplicate
    // Filter out any new paths that might already be in currentImages (unlikely but safe)
    // And ensure we don't add duplicates
    const uniqueNewPaths = newPaths.filter(p => !currentImages.includes(p));
    payload.images = [...currentImages, ...uniqueNewPaths];
  }

  // --- Image Deletion Logic ---
  const currentTrip = await Trip.findOne({ _id: tripId, user: userId }).lean();
  if (!currentTrip) throw Object.assign(new Error("Trip not found"), { status: 404 });

  if (payload.images) {
    const oldImages = currentTrip.images || [];
    const newImages = payload.images;
    const imagesToDelete = oldImages.filter((img) => !newImages.includes(img));

    for (const imgUrl of imagesToDelete) {
      if (imgUrl && imgUrl.includes("/uploads/")) {
        try {
          const parts = imgUrl.split("/uploads/");
          if (parts.length > 1) {
            const filename = parts[1].split("?")[0];
            const filePath = path.join(uploadsDir, filename);
            if (fs.existsSync(filePath)) {
              console.log(`[Profile] Deleting orphaned image: ${filePath}`);
              fs.unlinkSync(filePath);
            }
          }
        } catch (err) {
          console.warn(`[Profile] Failed to delete image file: ${imgUrl}`, err);
        }
      }
    }
  }

  const trip = await Trip.findOneAndUpdate(
    { _id: tripId, user: userId },
    { $set: payload },
    { new: true }
  ).lean();

  if (!trip) throw Object.assign(new Error("Trip not found"), { status: 404 });

  await clearUserFeedCache(userId);
  await clearUserProfileCache(userId);

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

  await clearUserFeedCache(userId);
  await clearUserProfileCache(userId);

  return trip;
}

export async function updateProfileAvatar(userId, authUser, file, avatarUrl) {
  if (!userId) throw new Error("userId required");
  if (!authUser || String(authUser._id || authUser.userId) !== String(userId))
    throw Object.assign(new Error("Forbidden"), { status: 403 });

  const avatarValue = file ? `/uploads/${file.filename}` : avatarUrl;
  if (!avatarValue)
    throw Object.assign(new Error("No avatar provided"), { status: 400 });

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

  const avatarToSave =
    typeof avatarValue === "string" && avatarValue.startsWith("/")
      ? normalizeAvatarUrl(avatarValue)
      : avatarValue;
  return User.findByIdAndUpdate(userId, { avatar: avatarToSave }, { new: true })
    .select("-password -__v")
    .lean();
}
