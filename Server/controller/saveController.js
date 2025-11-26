import * as saveService from "../services/saveService.js";
import { getIO } from "../config/socket.js";

export const saveTripController = async (req, res, next) => {
  try {
    const userId = req.body.userId; // ideally from auth middleware
    const tripId = req.params.tripId;

    await saveService.saveTrip(userId, tripId);

    // Emit real-time event to all users viewing the trip
    const io = getIO();
    io.to(`trip:${tripId}`).emit('saveUpdate', {
      tripId,
      action: 'save',
    });

    res.status(200).json({ message: "Trip saved!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const unSaveTripController = async (req, res, next) => {
  try {
    const userId = req.body.userId; // ideally from auth middleware
    const tripId = req.params.tripId;

    await saveService.unSaveTrip(userId, tripId);

    // Emit real-time event to all users viewing the trip
    const io = getIO();
    io.to(`trip:${tripId}`).emit('saveUpdate', {
      tripId,
      action: 'unsave',
    });

    res.status(200).json({ message: "Trip unsaved!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getSavedTripsController = async (req, res) => {
  try {
    const userId = req.params.userId;
    const trips = await saveService.getSavedTripsByUser(userId);
    res.status(200).json({ success: true, trips });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
