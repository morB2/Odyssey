import { useCallback } from 'react';
import { useTripRoom, useSocketEvent } from './useSocket';
import { type Comment } from '../components/social/types';

interface UseTripRealtimeProps {
    tripId: string;
    onNewComment: (comment: Comment) => void;
    onNewReaction: (commentId: string, reactions: Record<string, number>) => void;
    onNewReply: (commentId: string, reply: Comment) => void;
    onLikeUpdate: (likes: number) => void;
    onViewUpdate?: (views: number) => void;
    onCommentDeleted?: (commentId: string) => void;
}

/**
 * Custom hook to handle real-time updates for a trip
 * Encapsulates all Socket.IO event listeners for TripPost
 */
export const useTripRealtime = ({
    tripId,
    onNewComment,
    onNewReaction,
    onNewReply,
    onLikeUpdate,
    onViewUpdate,
    onCommentDeleted,
}: UseTripRealtimeProps) => {
    // Join the trip room
    useTripRoom(tripId);

    // Handle new comments
    useSocketEvent('newComment', useCallback((data: any) => {
        if (data.tripId === tripId && data.comment) {
            const newComment: Comment = {
                id: data.comment._id,
                user: {
                    name: `${data.comment.user.firstName} ${data.comment.user.lastName}`,
                    username: `@${data.comment.user.firstName}${data.comment.user.lastName}`,
                    avatar: data.comment.user.avatar || '/default-avatar.png',
                },
                text: data.comment.comment,
                timestamp: data.comment.createdAt,
            };
            onNewComment(newComment);
        }
    }, [tripId, onNewComment]));

    // Handle new reactions
    useSocketEvent('newReaction', useCallback((data: any) => {
        if (data.tripId === tripId && data.commentId && data.reactions) {
            onNewReaction(data.commentId, data.reactions);
        }
    }, [tripId, onNewReaction]));

    // Handle new replies
    useSocketEvent('newReply', useCallback((data: any) => {
        if (data.tripId === tripId && data.reply) {
            const newReply: Comment = {
                id: data.reply._id,
                user: {
                    name: `${data.reply.user.firstName} ${data.reply.user.lastName}`,
                    username: `@${data.reply.user.firstName}${data.reply.user.lastName}`,
                    avatar: data.reply.user.avatar || '/default-avatar.png',
                },
                text: data.reply.comment,
                timestamp: data.reply.createdAt,
            };
            onNewReply(data.commentId, newReply);
        }
    }, [tripId, onNewReply]));

    // Handle like updates
    useSocketEvent('likeUpdate', useCallback((data: any) => {
        if (data.tripId === tripId && typeof data.likes === 'number') {
            onLikeUpdate(data.likes);
        }
    }, [tripId, onLikeUpdate]));

    // Handle view updates
    useSocketEvent('viewUpdated', useCallback((data: any) => {
        if (data.tripId === tripId && typeof data.views === 'number' && onViewUpdate) {
            onViewUpdate(data.views);
        }
    }, [tripId, onViewUpdate]));

    // Handle comment deletion
    useSocketEvent('commentDeleted', useCallback((data: any) => {
        if (data.tripId === tripId && data.commentId && onCommentDeleted) {
            onCommentDeleted(data.commentId);
        }
    }, [tripId, onCommentDeleted]));
};
