import User from "../models/userModel.js";
import Trip from "../models/tripModel.js";
import bcrypt from "bcrypt";

export async function getProfile(userId) {
  if (!userId) throw new Error("userId required");
  const user = await User.findById(userId).select("-password -__v").lean();
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  return user;
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
  if (!userId) throw new Error("userId required");
  const trips = await Trip.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();
  return trips;
}

export async function getUserTrip(userId, tripId) {
  if (!userId || !tripId) throw new Error("userId and tripId required");
  const trip = await Trip.findOne({ _id: tripId, user: userId }).lean();
  if (!trip) throw Object.assign(new Error("Trip not found"), { status: 404 });
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
