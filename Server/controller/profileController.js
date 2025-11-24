// import * as services from "../services/profileServices.js";

// // Controller functions: receive req/res data, delegate to services, return data
// export async function getProfile(userId) {
//   return services.getProfile(userId);
// }

// export async function updatePassword(userId, currentPassword, newPassword) {
//   return services.updatePassword(userId, currentPassword, newPassword);
// }

// export async function listUserTrips(userId, viewerId) {
//   // forward viewerId (may be undefined) to service
//   return services.listUserTripsForViewer(userId, viewerId);
// }

// export async function getUserTrip(userId, tripId, viewerId) {
//   return services.getUserTrip(userId, tripId, viewerId);
// }

// export async function updateUserTrip(userId, tripId, updates) {
//   return services.updateUserTrip(userId, tripId, updates);
// }

// export async function deleteUserTrip(userId, tripId) {
//   return services.deleteUserTrip(userId, tripId);
// }
import * as services from "../services/profileServices.js";

// Controllers: just delegate to services

export async function getProfile(userId) {
  return services.getProfile(userId);
}

export async function updatePassword(userId, authUser, currentPassword, newPassword) {
  return services.updatePassword(userId, authUser, currentPassword, newPassword);
}

export async function listUserTrips(userId, viewerId) {
  return services.listUserTrips(userId, viewerId);
}

export async function getUserTrip(userId, tripId, viewerId) {
  return services.getUserTrip(userId, tripId, viewerId);
}

export async function updateUserTrip(userId, tripId, authUser, updates, files) {
  return services.updateUserTrip(userId, tripId, authUser, updates, files);
}

export async function deleteUserTrip(userId, tripId, authUser) {
  return services.deleteUserTrip(userId, tripId, authUser);
}

export async function updateProfileAvatar(userId, authUser, file, avatarUrl) {
  return services.updateProfileAvatar(userId, authUser, file, avatarUrl);
}
