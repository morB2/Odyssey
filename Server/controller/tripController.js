import { getTripsForUser, postCommentForUser, addReactionToComment, postReplyForUser, incrementTripView, deleteComment as deleteCommentService} from "../services/crudTripService.js";
import {fetchTrips as fetchTripsService } from "../services/tripFetcherService.js";
import { getFeedForUser } from "../services/feedService.js";
import { getIO } from "../config/socket.js";

export async function fetchTrips(req, res) {
  try {
    const currentUserId = req.params.id || null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const trips = await getFeedForUser(currentUserId, page, limit);
    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getTripById(req, res) {
  try {
    const { id } = req.params;
    const currentUserId = req.query.userId || null; // Optional: for isLiked/isSaved status

    const trips = await fetchTripsService({
      filter: { _id: id },
      viewerId: currentUserId,
      limit: 1,
      includeMetadata: false,
      processComments: true
    });

    if (!trips || trips.length === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.status(200).json(trips[0]);
  } catch (error) {
    console.error("Error fetching trip by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function postComment(req, res) {
  try {
    const { tripId } = req.params;
    const { comment, userId } = req.body;
    const newComment = await postCommentForUser(tripId, userId, comment);

    // Emit real-time event to all users in the trip room
    const io = getIO();
    io.to(`trip:${tripId}`).emit('newComment', {
      tripId,
      comment: newComment,
    });

    res.status(201).json(newComment);
  } catch (err) {
    console.error("Error posting comment:", err);
    res.status(400).json({ error: err.message });
  }
}

export async function addReaction(req, res) {
  try {
    const { tripId, commentId } = req.params;
    const { userId, emoji } = req.body;
    // This logic assumes you have a function addReactionToComment in your service layer
    const updatedReaction = await addReactionToComment(tripId, commentId, userId, emoji);

    // Emit real-time event to all users in the trip room
    const io = getIO();
    io.to(`trip:${tripId}`).emit('newReaction', {
      tripId,
      commentId,
      emoji,
      reactions: updatedReaction,
    });

    res.status(200).json(updatedReaction);
  } catch (err) {
    console.error("Error adding reaction:", err);
    res.status(400).json({ error: err.message });
  }
}

export async function postReply(req, res) {
  try {
    const { tripId, commentId } = req.params;
    const { userId, reply } = req.body;
    const newReply = await postReplyForUser(tripId, commentId, userId, reply);

    // Emit real-time event to all users in the trip room
    const io = getIO();
    io.to(`trip:${tripId}`).emit('newReply', {
      tripId,
      commentId,
      reply: newReply,
    });

    res.status(201).json(newReply);
  } catch (err) {
    console.error("Error posting reply:", err);
    res.status(400).json({ error: err.message });
  }
}

export async function incrementView(req, res) {
  try {
    const { tripId } = req.params;
    const { userId } = req.body;
    const newViewCount = await incrementTripView(tripId,userId);

    // Emit real-time event to all users in the trip room
    const io = getIO();
    io.to(`trip:${tripId}`).emit('viewUpdated', {
      tripId,
      views: newViewCount,
    });

    res.status(200).json({ views: newViewCount });
  } catch (err) {
    console.error("Error incrementing view:", err);
    res.status(400).json({ error: err.message });
  }
}

export async function deleteComment(req, res) {
  try {
    const { tripId, commentId } = req.params;
    const { userId } = req.body;

    const deletedComment = await deleteCommentService(tripId, commentId, userId);

    // Emit real-time event to all users in the trip room
    const io = getIO();
    io.to(`trip:${tripId}`).emit('commentDeleted', {
      tripId,
      commentId,
    });

    res.status(200).json({ message: "Comment deleted successfully", comment: deletedComment });
  } catch (err) {
    console.error("Error deleting comment:", err);
    const status = err.status || 400;
    res.status(status).json({ error: err.message });
  }
}

