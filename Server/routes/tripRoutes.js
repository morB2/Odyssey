import { fetchTrips,postComment,addReaction,postReply } from "../controller/tripController.js";
import express from "express";
const router = express.Router();

// Route to fetch trips for the current user
router.get("/:id", fetchTrips);
router.post("/:tripId/comment",  postComment);
router.post("/:tripId/comment/:commentId/react", addReaction);
router.post("/:tripId/comment/:commentId/reply", postReply);

export default router;