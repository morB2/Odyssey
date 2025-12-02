import { fetchTrips, postComment, addReaction, postReply, incrementView, deleteComment } from "../controller/tripController.js";
import express from "express";
const router = express.Router();

// Route to fetch trips for the current user or public feed
router.get("/", fetchTrips);
router.get("/:id", fetchTrips);
router.post("/:tripId/comment", postComment);
router.post("/:tripId/comment/:commentId/react", addReaction);
router.post("/:tripId/comment/:commentId/reply", postReply);
router.post("/:tripId/views", incrementView);
router.delete("/:tripId/comment/:commentId", deleteComment);

export default router;