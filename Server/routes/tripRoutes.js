import { fetchTrips,postComment,addReaction } from "../controller/tripController.js";
import express from "express";
const router = express.Router();

// Route to fetch trips for the current user
router.get("/:id", fetchTrips);
router.post("/:tripId/comment",  postComment);
router.post("/:tripId/comment/:commentId/react", addReaction);

export default router;