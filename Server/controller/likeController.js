import * as likeService from "../services/likeService.js";

export const likeTripController = async (req, res, next) => {
  try {
    const userId = req.body.userId; // ideally from auth middleware
    const tripId = req.params.tripId;

    const likes = await likeService.likeTrip(userId, tripId);
    res.status(200).json({ message: "Trip liked!", likes });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const unlikeTripController = async (req, res, next) => {
  try {
    const userId = req.body.userId; // ideally from auth middleware
    const tripId = req.params.tripId;

    const likes = await likeService.unlikeTrip(userId, tripId);
    res.status(200).json({ message: "Trip unliked!", likes });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getLikedTripsController = async (req, res) => {
  try {
    const userId = req.params.userId; // userId comes from URL
    const trips = await likeService.getLikedTripsByUser(userId);
    res.status(200).json({ success: true, trips });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
