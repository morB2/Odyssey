import { fetchTrips, postComment, addReaction, postReply, incrementView, deleteComment, getTripById } from "../controller/tripController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import express from "express";
const router = express.Router();

// Route to fetch trips for the current user or public feed
router.get("/", fetchTrips);  // Public feed - no auth required
router.get("/:id", fetchTrips);  // Public single trip view - no auth required
router.get("/single/:id", getTripById);  // Public single trip - no auth required
router.post("/:tripId/comment", authMiddleware, postComment); // ✅ Auth required
router.post("/:tripId/comment/:commentId/react", authMiddleware, addReaction); // ✅ Auth required
router.post("/:tripId/comment/:commentId/reply", authMiddleware, postReply); // ✅ Auth required
router.post("/:tripId/views", incrementView);  // Public view tracking - no auth required
router.delete("/:tripId/comment/:commentId", authMiddleware, deleteComment); // ✅ Auth required

export default router;