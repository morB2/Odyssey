import Trip from "../models/tripModel.js";
import Like from "../models/likesModel.js";
import Save from "../models/savesModel.js";
import Follow from "../models/followModel.js";
import User from "../models/userModel.js"; // Assuming User has name & avatar
import { clearUserFeedCache } from "../utils/cacheUtils.js";
import { fetchTrips } from "./tripFetcherService.js";
import redis from "../db/redisClient.js";

/**
 * Get first 10 trips with user info, following, liked, and saved status
 * @param {String} currentUserId - the ID of the current logged-in user
 */
export async function getTripsForUser(currentUserId) {
  const trips = await fetchTrips({
    filter: { visabilityStatus: "public" },
    viewerId: currentUserId,
    limit: 10,
    sort: { createdAt: -1 },
    includeMetadata: false,
    processComments: true,
  });

  return trips;
}


/**
 * Adds a comment to a specific trip.
 * @param {string} tripId - ID of the trip to comment on
 * @param {string} userId - ID of the commenting user
 * @param {string} commentText - Comment content
 */
export async function postCommentForUser(tripId, userId, commentText) {
  if (!commentText?.trim()) throw new Error("Comment cannot be empty.");

  // Add new comment
  const updatedTrip = await Trip.findByIdAndUpdate(
    tripId,
    {
      $push: {
        comments: {
          user: userId,
          comment: commentText,
        },
      },
    },
    { new: true } // return updated doc
  )
    .populate({
      path: "comments.user",
      select: "_id firstName lastName avatar",
    })
    .lean();

  if (!updatedTrip) throw new Error("Trip not found.");
  await clearUserFeedCache(userId);
  // Get the last added comment (most recent one)
  const newComment = updatedTrip.comments[updatedTrip.comments.length - 1];

  return {
    id: newComment._id?.toString(),
    text: newComment.comment,
    timestamp: newComment.createdAt,
    userId: newComment.user?._id?.toString(),
    user: newComment.user
      ? {
        _id: newComment.user._id?.toString(),
        firstName: newComment.user.firstName,
        lastName: newComment.user.lastName,
        name: `${(newComment.user.firstName || '').trim()} ${(newComment.user.lastName || '').trim()}`.trim(),
        username:
          (newComment.user.firstName || '')
            .toString()
            .replace(/\s+/g, '')
            .toLowerCase() || newComment.user._id?.toString(),
        avatar: newComment.user.avatar,
      }
      : null,
  };
}

/**
 * Adds a reaction (emoji) to a specific comment on a trip post.
 * @param {string} postId - The ID of the trip (post)
 * @param {string} commentId - The ID of the comment to react to
 * @param {string} userId - The ID of the user reacting
 * @param {string} emoji - The emoji reaction
 * @returns {Promise<Object>} - The updated comment with reactions
 */
export async function addReactionToComment(postId, commentId, userId, emoji) {
  if (!emoji || !userId) throw new Error("Emoji and userId are required.");

  // Add the reaction to the specific comment in the trip's comments array
  const trip = await Trip.findOneAndUpdate(
    {
      _id: postId,
      "comments._id": commentId
    },
    {
      $push: {
        "comments.$.reactions": {
          emoji: emoji,
          user: userId,
          createdAt: new Date()
        }
      }
    },
    { new: true }
  )
    .populate({
      path: "comments.user comments.reactions.user",
      select: "_id firstName lastName avatar",
    })
    .lean();

  if (!trip) throw new Error("Trip or comment not found.");

  // Find the updated comment object
  const updatedComment = trip.comments.find(c => c._id.toString() === commentId);

  return updatedComment;
}

/**
 * Adds a reply to a specific comment on a trip.
 * @param {string} tripId - ID of the trip
 * @param {string} commentId - ID of the comment to reply to
 * @param {string} userId - ID of the replying user
 * @param {string} replyText - Reply content
 */
export async function postReplyForUser(tripId, commentId, userId, replyText) {
  if (!replyText?.trim()) throw new Error("Reply cannot be empty.");

  const updatedTrip = await Trip.findOneAndUpdate(
    { _id: tripId, "comments._id": commentId },
    {
      $push: {
        "comments.$.replies": {
          user: userId,
          comment: replyText,
        },
      },
    },
    { new: true }
  )
    .populate({
      path: "comments.replies.user",
      select: "_id firstName lastName avatar",
    })
    .lean();

  if (!updatedTrip) throw new Error("Trip or comment not found.");

  // Clear cache after adding reply
  await clearUserFeedCache(userId);

  // Find the updated comment and the new reply
  const comment = updatedTrip.comments.find(c => c._id.toString() === commentId);
  const newReply = comment.replies[comment.replies.length - 1];

  return {
    id: newReply._id?.toString(),
    text: newReply.comment,
    timestamp: newReply.createdAt,
    userId: newReply.user?._id?.toString(),
    user: newReply.user
      ? {
        _id: newReply.user._id?.toString(),
        firstName: newReply.user.firstName,
        lastName: newReply.user.lastName,
        name: `${(newReply.user.firstName || '').trim()} ${(newReply.user.lastName || '').trim()}`.trim(),
        username:
          (newReply.user.firstName || '')
            .toString()
            .replace(/\s+/g, '')
            .toLowerCase() || newReply.user._id?.toString(),
        avatar: newReply.user.avatar,
      }
      : null,
  };
}

/**
 * Increments the view count for a trip.
 * @param {string} tripId - ID of the trip
 * @returns {Promise<number>} - The new view count
 */
export async function incrementTripView(tripId, userId = null) {
  const updatedTrip = await Trip.findByIdAndUpdate(
    tripId,
    { $inc: { views: 1 } },
    { new: true, select: "views" }
  );

  if (!updatedTrip) throw new Error("Trip not found.");
  if (userId) {
    const added = await redis.sAdd(`user:${userId}:seenTrips`, tripId);
    await redis.expire(`user:${userId}:seenTrips`, 60 * 60 * 24 * 7);
  }
  return updatedTrip.views;
}

/**
 * Deletes a comment from a trip.
 * Only the comment creator or the trip owner can delete the comment.
 * @param {string} tripId - ID of the trip
 * @param {string} commentId - ID of the comment to delete
 * @param {string} userId - ID of the user attempting to delete
 * @returns {Promise<Object>} - The deleted comment data
 */
export async function deleteComment(tripId, commentId, userId) {
  // First, get the trip and the specific comment to check authorization
  const trip = await Trip.findById(tripId)
    .populate({
      path: "user",
      select: "_id"
    })
    .populate({
      path: "comments.user",
      select: "_id firstName lastName avatar"
    })
    .lean();

  if (!trip) throw new Error("Trip not found.");

  // Find the comment to delete
  const comment = trip.comments.find(c => c._id.toString() === commentId);
  if (!comment) throw new Error("Comment not found.");

  // Check authorization: user must be either the comment creator OR the trip owner
  const isCommentCreator = comment.user._id.toString() === userId;
  const isTripOwner = trip.user._id.toString() === userId;

  if (!isCommentCreator && !isTripOwner) {
    throw Object.assign(new Error("Forbidden: You can only delete your own comments or comments on your own posts."), { status: 403 });
  }

  // Delete the comment using $pull
  const updatedTrip = await Trip.findByIdAndUpdate(
    tripId,
    {
      $pull: {
        comments: { _id: commentId }
      }
    },
    { new: true }
  ).lean();

  if (!updatedTrip) throw new Error("Failed to delete comment.");

  // Clear cache
  await clearUserFeedCache(userId);

  return {
    id: comment._id?.toString(),
    text: comment.comment,
    timestamp: comment.createdAt,
    userId: comment.user?._id?.toString(),
    user: comment.user
      ? {
        _id: comment.user._id?.toString(),
        firstName: comment.user.firstName,
        lastName: comment.user.lastName,
        name: `${(comment.user.firstName || '').trim()} ${(comment.user.lastName || '').trim()}`.trim(),
        username:
          (comment.user.firstName || '')
            .toString()
            .replace(/\s+/g, '')
            .toLowerCase() || comment.user._id?.toString(),
        avatar: comment.user.avatar,
      }
      : null,
  };
}
