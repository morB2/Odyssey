import api from "./httpService";

export const toggleLike = async (tripId: string, userId: string, isLiked: boolean) => {
    try {
        const endpoint = isLiked ? `/api/likes/${tripId}/unlike` : `/api/likes/${tripId}/like`;
        const res = await api.post(endpoint, { userId });
        return res.data;
    } catch (error) {
        console.error("Error toggling like:", error);
        throw error;
    }
};

export const toggleSave = async (tripId: string, userId: string, isSaved: boolean) => {
    try {
        const endpoint = isSaved ? `/api/saves/${tripId}/unsave` : `/api/saves/${tripId}/save`;
        const res = await api.post(endpoint, { userId });
        return res.data;
    } catch (error) {
        console.error("Error toggling save:", error);
        throw error;
    }
};

export const toggleFollow = async (targetUserId: string, currentUserId: string, isFollowing: boolean) => {
    try {
        const action = isFollowing ? 'unfollow' : 'follow';
        const res = await api.post(`/api/follow/${targetUserId}/${action}`, { userId: currentUserId });
        return res.data;
    } catch (error) {
        console.error("Error toggling follow:", error);
        throw error;
    }
};

export const addComment = async (tripId: string, userId: string, comment: string) => {
    try {
        const res = await api.post(`/api/trips/${tripId}/comment`, {
            userId,
            comment
        });
        return res.data;
    } catch (error) {
        console.error("Error adding comment:", error);
        throw error;
    }
};

export const addReaction = async (tripId: string, commentId: string, userId: string, emoji: string) => {
    try {
        const res = await api.post(`/api/trips/${tripId}/comment/${commentId}/react`, {
            userId,
            emoji
        });
        return res.data;
    } catch (error) {
        console.error("Error adding reaction:", error);
        throw error;
    }
};

export const addReply = async (tripId: string, commentId: string, userId: string, reply: string) => {
    try {
        const res = await api.post(`/api/trips/${tripId}/comment/${commentId}/reply`, {
            userId,
            reply
        });
        return res.data;
    } catch (error) {
        console.error("Error adding reply:", error);
        throw error;
    }
};

export default {
    toggleLike,
    toggleSave,
    toggleFollow,
    addComment,
    addReaction,
    addReply
};
