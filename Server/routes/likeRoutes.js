import express from "express";
import { likeTripController, unlikeTripController,getLikedTripsController } from "../controller/likeController.js";

const router = express.Router();

// Like a trip
router.post("/:tripId/like", likeTripController);

// Unlike a trip
router.post("/:tripId/unlike", unlikeTripController);

router.get("/:userId", getLikedTripsController);

export default router;
