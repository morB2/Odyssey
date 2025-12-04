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
            const c = data.comment;
            const newComment: Comment = {
                id: c.id ?? c._id,
                user: {
                    name: c.user?.name ?? `${c.user?.firstName || ''} ${c.user?.lastName || ''}`.trim(),
                    username: c.user?.username ?? `@${(c.user?.firstName || '').toString().toLowerCase()}${(c.user?.lastName || '').toString().toLowerCase()}`,
                    avatar: c.user?.avatar || '/default-avatar.png',
                },
                text: c.text ?? c.comment ?? '',
                timestamp: c.timestamp ?? c.createdAt,
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
            const r = data.reply;
            const newReply: Comment = {
                id: r.id ?? r._id,
                user: {
                    name: r.user?.name ?? `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.trim(),
                    username: r.user?.username ?? `@${(r.user?.firstName || '').toString().toLowerCase()}${(r.user?.lastName || '').toString().toLowerCase()}`,
                    avatar: r.user?.avatar || '/default-avatar.png',
                },
                text: r.text ?? r.comment ?? '',
                timestamp: r.timestamp ?? r.createdAt,
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
