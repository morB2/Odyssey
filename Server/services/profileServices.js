import User from "../models/userModel.js";
import Trip from "../models/tripModel.js";
import Like from "../models/likesModel.js";
import Save from "../models/savesModel.js";
import Follow from "../models/followModel.js";
import bcrypt from "bcrypt";
import redis from "../db/redisClient.js";
import { clearUserFeedCache, clearUserProfileCache } from "../utils/cacheUtils.js";
import path from "path";
import fs from "fs";
import { uploadToCloudinary, deleteFromCloudinary } from "./cloudinaryHelper.js";
import { fetchTrips, normalizeAvatarUrl } from "./tripFetcherService.js";

const SERVER_URL = process.env.SERVER_URL || " https://odyssey-dbdn.onrender.com";
const uploadsDir = path.join(process.cwd(), "temp_uploads");

// -----------------------------------------------------
// Helpers
// -----------------------------------------------------
async function safeJsonParse(value, fallback = []) {
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
}

function deleteLocalFileIfExists(absolutePath) {
  try {
    if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
  } catch (err) {
    console.warn("File delete failed:", absolutePath, err);
  }
}

// -----------------------------------------------------
// PROFILE
// -----------------------------------------------------

export async function getProfile(userId) {
  if (!userId) throw new Error("userId required");

  const user = await User.findById(userId).select("-password -__v").lean();
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });

  if (user.avatar) user.avatar = normalizeAvatarUrl(user.avatar);

  try {
    const followersCount = await Follow.countDocuments({ following: user._id });
    const followingCount = await Follow.countDocuments({ follower: user._id });

    return { ...user, followersCount, followingCount };
  } catch {
    return user;
  }
}

// -----------------------------------------------------
// TRIPS - LIST
// -----------------------------------------------------

export async function listUserTripsForViewer(ownerId, viewerId, page = 1, limit = 12) {
  if (!ownerId) throw new Error("ownerId required");

  // Only cache first page with default limit
  const cacheKey = page === 1 && limit === 12
    ? `profile:${ownerId}:trips:${viewerId || "none"}`
    : null;

  return fetchTrips({
    filter: { user: ownerId },
    viewerId,
    page,
    limit,
    sort: { createdAt: -1 },
    cacheKey,
    cacheTTL: 60,
    includeMetadata: true,
    processComments: true,
  });
}

export async function listUserTrips(ownerId, viewerId, page, limit) {
  return listUserTripsForViewer(ownerId, viewerId, page, limit);
}

// -----------------------------------------------------
// TRIPS - GET SINGLE
// -----------------------------------------------------

// Helper to get trip by ID only (for authorization checks)
export async function getTripById(tripId) {
  if (!tripId) throw new Error("tripId required");

  const trip = await Trip.findById(tripId).select("user").lean();
  return trip;
}

export async function getUserTrip(userId, tripId, viewerId) {
  if (!userId || !tripId) throw new Error("Missing parameters");

  const result = await fetchTrips({
    filter: { _id: tripId, user: userId },
    viewerId,
    limit: 1,
    includeMetadata: false,
    processComments: true,
  });

  if (!result || result.length === 0) {
    throw Object.assign(new Error("Trip not found"), { status: 404 });
  }

  return result[0];
}

// -----------------------------------------------------
// PROFILE (LIKED + SAVED) 
// -----------------------------------------------------

async function fetchProfileTripCollection({
  ownerId,
  viewerId,
  model,
  cachePrefix,
  page = 1,
  limit = 12,
}) {
  if (!ownerId) throw new Error("ownerId required");

  const skip = (page - 1) * limit;

  // Only cache first page with default limit
  const cacheKey = page === 1 && limit === 12
    ? `${cachePrefix}:${ownerId}:${viewerId || "none"}`
    : null;

  if (cacheKey) {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  // Get total count
  const total = await model.countDocuments({ user: ownerId });

  // Get the liked/saved items with populated trips
  const items = await model
    .find({ user: ownerId })
    .skip(skip)
    .limit(limit)
    .populate({
      path: "trip",
      populate: [
        { path: "user", select: "_id firstName lastName avatar" },
        { path: "comments.user", select: "_id firstName lastName avatar" },
        { path: "comments.replies.user", select: "_id firstName lastName avatar" },
      ],
    })
    .lean();

  const trips = items.map(x => x.trip).filter(Boolean);

  // Use unified fetcher to enrich trips (but skip the query part)
  const tripIds = trips.map(t => t._id);
  const enriched = await fetchTrips({
    filter: { _id: { $in: tripIds } },
    viewerId,
    limit: trips.length,
    includeMetadata: false,
    processComments: true,
  });

  const response = {
    trips: enriched,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + trips.length < total,
    },
  };

  if (cacheKey) {
    await redis.setEx(cacheKey, 60, JSON.stringify(response));
  }

  return response;
}

export async function getProfileLikedTrips(ownerId, viewerId, page, limit) {
  return fetchProfileTripCollection({
    ownerId,
    viewerId,
    model: Like,
    cachePrefix: "profile:liked",
    page,
    limit,
  });
}

export async function getProfileSavedTrips(ownerId, viewerId, page, limit) {
  return fetchProfileTripCollection({
    ownerId,
    viewerId,
    model: Save,
    cachePrefix: "profile:saved",
    page,
    limit,
  });
}

export async function updatePassword(userId, authUser, currentPassword, newPassword) {
  if (!userId || !newPassword) throw new Error("Missing parameters");

  if (!authUser || String(authUser._id || authUser.userId) !== String(userId))
    throw Object.assign(new Error("Forbidden"), { status: 403 });

  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });

  // Compare current password if exists
  if (user.password) {
    if (!currentPassword)
      throw Object.assign(new Error("Current password required"), { status: 400 });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok)
      throw Object.assign(new Error("Current password incorrect"), { status: 401 });
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  return { success: true };
}

export async function updateUserTrip(userId, tripId, authUser, updates, files) {
  if (!userId || !tripId) throw new Error("Missing parameters");

  if (!authUser || String(authUser._id || authUser.userId) !== String(userId))
    throw Object.assign(new Error("Forbidden"), { status: 403 });

  const allowedFields = [
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
  allowedFields.forEach(key => {
    if (key in updates) payload[key] = updates[key];
  });

  // Parse client existing images
  if ("imagesExisting" in updates) {
    payload.images = await safeJsonParse(updates.imagesExisting, []);
  } else if (typeof payload.images === "string") {
    payload.images = await safeJsonParse(payload.images, []);
  }

  // Upload new images to Cloudinary
  if (files?.length) {
    const newUrls = [];

    for (const f of files) {
      const abs = path.join(uploadsDir, f.filename);
      try {
        const uploaded = await uploadToCloudinary(abs, "odyssey/trips");
        if (uploaded) newUrls.push(uploaded);
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
      }
    }

    payload.images = [...(payload.images || []), ...newUrls];
  }

  // Remove files (local and Cloudinary) that are no longer in images
  const currentTrip = await Trip.findById(tripId).lean();
  if (!currentTrip) throw Object.assign(new Error("Trip not found"), { status: 404 });

  if (payload.images) {
    const missing = (currentTrip.images || []).filter(old => !payload.images.includes(old));

    // Delete removed media from both local storage and Cloudinary
    for (const img of missing) {
      // Delete from Cloudinary if it's a Cloudinary URL
      if (img.includes("cloudinary.com")) {
        await deleteFromCloudinary(img);
      }
      // Delete from local storage if it's a local file
      else if (img.includes("/uploads/")) {
        const filename = img.split("/uploads/")[1];
        deleteLocalFileIfExists(path.join(uploadsDir, filename));
      }
    }
  }

  const updated = await Trip.findOneAndUpdate(
    { _id: tripId, user: userId },
    { $set: payload },
    { new: true }
  ).lean();

  await clearUserFeedCache(userId);
  await clearUserProfileCache(userId);

  return updated;
}

// -----------------------------------------------------
// TRIPS - DELETE
// -----------------------------------------------------

export async function deleteUserTrip(userId, tripId) {
  // Get trip before deleting to access its images
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw Object.assign(new Error("Trip not found"), { status: 404 });

  // Delete all media from Cloudinary
  if (trip.images && trip.images.length > 0) {
    for (const img of trip.images) {
      if (img.includes("cloudinary.com")) {
        await deleteFromCloudinary(img);
      } else if (img.includes("/uploads/")) {
        const filename = img.split("/uploads/")[1];
        deleteLocalFileIfExists(path.join(uploadsDir, filename));
      }
    }
  }

  // Now delete the trip
  const deleted = await Trip.findOneAndDelete({ _id: tripId }).lean();

  await clearUserFeedCache(userId);
  await clearUserProfileCache(userId);

  return deleted;
}

// -----------------------------------------------------
// AVATAR
// -----------------------------------------------------

export async function updateProfileAvatar(userId, authUser, file, avatarUrl) {
  if (!userId) throw new Error("Missing userId");

  if (!authUser || String(authUser._id || authUser.userId) !== String(userId))
    throw Object.assign(new Error("Forbidden"), { status: 403 });

  let newAvatar = avatarUrl;

  if (file) {
    const fileAbs = path.join(uploadsDir, file.filename);
    newAvatar = await uploadToCloudinary(fileAbs, "odyssey/avatars");
  }

  if (!newAvatar)
    throw Object.assign(new Error("No avatar provided"), { status: 400 });

  const previous = await User.findById(userId).lean();

  // Delete old local avatar if needed
  const prev = previous?.avatar;
  if (prev && prev.includes("/uploads/") && prev !== newAvatar) {
    const fileName = prev.split("/uploads/")[1];
    deleteLocalFileIfExists(path.join(uploadsDir, fileName));
  }

  const avatarToSave = newAvatar.startsWith("/") ? normalizeAvatarUrl(newAvatar) : newAvatar;

  return User.findByIdAndUpdate(
    userId,
    { avatar: avatarToSave },
    { new: true }
  )
    .select("-password -__v")
    .lean();
}

