import * as services from "../services/profileServices.js";

// Helper for clean error handling
function handle(res, fn) {
  fn()
    .then(data => res.json({ success: true, ...data }))
    .catch(err => {
      console.error("profile controller error:", err);
      res.status(err.status || 500).json({ success: false, error: String(err.message || err) });
    });
}

export const getProfile = (req, res) =>
  handle(res, async () => {
    const user = await services.getProfile(req.params.userId);
    return { user };
  });

export const updatePassword = (req, res) =>
  handle(res, async () => {
    const result = await services.updatePassword(
      req.params.userId,
      req.user,
      req.body.currentPassword,
      req.body.newPassword
    );
    return result;
  });

export const listUserTrips = (req, res) =>
  handle(res, async () => {
    const trips = await services.listUserTrips(req.ownerId, req.viewerId);
    return { trips };
  });

export const getUserTrip = (req, res) =>
  handle(res, async () => {
    const trip = await services.getUserTrip(
      req.ownerId,
      req.params.tripId,
      req.viewerId
    );
    return { trip };
  });

export const updateUserTrip = (req, res) =>
  handle(res, async () => {
    const trip = await services.updateUserTrip(
      req.params.userId,
      req.params.tripId,
      req.user,
      req.body,
      req.files
    );
    return { trip };
  });

export const deleteUserTrip = (req, res) =>
  handle(res, async () => {
    const trip = await services.deleteUserTrip(
      req.params.userId,
      req.params.tripId,
      req.user
    );
    return { trip };
  });

export const updateProfileAvatar = (req, res) =>
  handle(res, async () => {
    const updatedUser = await services.updateProfileAvatar(
      req.params.userId,
      req.user,
      req.file,
      req.body.avatarUrl
    );
    return { user: updatedUser };
  });

export const getProfileLikedTrips = (req, res) =>
  handle(res, async () => {
    const trips = await services.getProfileLikedTrips(
      req.ownerId,
      req.viewerId
    );
    return { trips };
  });

export const getProfileSavedTrips = (req, res) =>
  handle(res, async () => {
    const trips = await services.getProfileSavedTrips(
      req.ownerId,
      req.viewerId
    );
    return { trips };
  });

