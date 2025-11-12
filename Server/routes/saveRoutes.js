import express from "express";
import { saveTripController, unSaveTripController,getSavedTripsController } from "../controller/saveController.js";

const router = express.Router();

// Like a trip
router.post("/:tripId/save", saveTripController);

// Unlike a trip
router.post("/:tripId/unsave", unSaveTripController);

router.get("/:userId", getSavedTripsController);

export default router;
