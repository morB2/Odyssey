import { getTripsForUser, postCommentForUser, addReactionToComment, postReplyForUser } from "../services/crudTripService.js";
import { getFeedForUser } from "../services/feedService.js";
import { getIO } from "../config/socket.js";

export async function fetchTrips(req, res) {
  try {
    const currentUserId = req.params.id; // assuming user ID is available in req.user
    const trips = await getFeedForUser(currentUserId);
    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
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

