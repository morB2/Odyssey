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
      req.user.userId,
      req.user,
      req.body.currentPassword,
      req.body.newPassword
    );
    return result;
  });

export const listUserTrips = (req, res) =>
  handle(res, async () => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const result = await services.listUserTrips(req.ownerId, req.viewerId, page, limit);
    return result;
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
    const { tripId } = req.params;
    const user = req.user;

    // Get trip to verify ownership
    const tripUser = await services.getTripById(tripId);    
    if (!tripUser) {
      throw Object.assign(new Error("Trip not found"), { status: 404 });
    }

    // Check authorization: owner or admin    
    const isOwner = String(tripUser.user._id) === String(user.userId);

    if (!isOwner) {
      throw Object.assign(new Error("Forbidden"), { status: 403 });
    }
    const trip = await services.updateUserTrip(
      req.user.userId,
      req.params.tripId,
      req.user,
      req.body,
      req.files
    );
    return { trip };
  });

export const deleteUserTrip = (req, res) =>
  handle(res, async () => {
    const { tripId } = req.params;
    const user = req.user;

    // Get trip to verify ownership
    const trip = await services.getTripById(tripId);
    if (!trip) {
      throw Object.assign(new Error("Trip not found"), { status: 404 });
    }

    // Check authorization: owner or admin
    const isOwner = String(trip.user._id) === String(user.userId);
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      throw Object.assign(new Error("Forbidden"), { status: 403 });
    }

    // Delete the trip
    const deleted = await services.deleteUserTrip(user.userId, tripId);
    return { trip: deleted };
  });

export const updateProfileAvatar = (req, res) =>
  handle(res, async () => {
    const updatedUser = await services.updateProfileAvatar(
      req.user.userId,
      req.user,
      req.file,
      req.body.avatarUrl
    );
    return { user: updatedUser };
  });

export const getProfileLikedTrips = (req, res) =>
  handle(res, async () => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const result = await services.getProfileLikedTrips(
      req.ownerId,
      req.viewerId,
      page,
      limit
    );
    return result;
  });

export const getProfileSavedTrips = (req, res) =>
  handle(res, async () => {
    // Saved trips are private - only the owner can view them
    if (String(req.ownerId) != String(req.viewerId)) {
      throw Object.assign(
        new Error("You can only view your own saved trips"),
        { status: 403 }
      );
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const result = await services.getProfileSavedTrips(
      req.ownerId,
      req.viewerId,
      page,
      limit
    );
    return result;
  });

