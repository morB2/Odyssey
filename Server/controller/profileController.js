import * as services from "../services/profileServices.js";

// Controller functions: receive req/res data, delegate to services, return data
export async function getProfile(userId) {
  return services.getProfile(userId);
}

export async function updatePassword(userId, currentPassword, newPassword) {
  return services.updatePassword(userId, currentPassword, newPassword);
}

export async function listUserTrips(userId) {
  return services.listUserTrips(userId);
}

// export async function getUserTrip(userId, tripId) {
//   return services.getUserTrip(userId, tripId);
// }

export async function updateUserTrip(userId, tripId, updates) {
  return services.updateUserTrip(userId, tripId, updates);
}

export async function deleteUserTrip(userId, tripId) {
  return services.deleteUserTrip(userId, tripId);
}
