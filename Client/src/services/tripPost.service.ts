import api from "./httpService";

// ✅ Removed userId - backend now uses JWT authentication
export const toggleLike = async (tripId: string, isLiked: boolean) => {
    try {
        const endpoint = isLiked ? `/likes/${tripId}/unlike` : `/likes/${tripId}/like`;
        const res = await api.post(endpoint);
        return res.data;
    } catch (error) {
        console.error("Error toggling like:", error);
        throw error;
    }
};

// ✅ Removed userId - backend now uses JWT authentication
export const toggleSave = async (tripId: string, isSaved: boolean) => {
    try {
        const endpoint = isSaved ? `/saves/${tripId}/unsave` : `/saves/${tripId}/save`;
        const res = await api.post(endpoint);
        return res.data;
    } catch (error) {
        console.error("Error toggling save:", error);
        throw error;
    }
};

// ✅ Removed currentUserId - backend now uses JWT authentication
export const toggleFollow = async (targetUserId: string, isFollowing: boolean) => {
    try {
        const action = isFollowing ? 'unfollow' : 'follow';
        const res = await api.post(`/follow/${targetUserId}/${action}`);
        return res.data;
    } catch (error) {
        console.error("Error toggling follow:", error);
        throw error;
    }
};

// ✅ Removed userId - backend now uses JWT authentication
export const addComment = async (tripId: string, comment: string) => {
    try {
        const res = await api.post(`/trips/${tripId}/comment`, {
            comment
        });
        return res.data;
    } catch (error) {
        console.error("Error adding comment:", error);
        throw error;
    }
};

// ✅ Removed userId - backend now uses JWT authentication
export const addReaction = async (tripId: string, commentId: string, emoji: string) => {
    try {
        const res = await api.post(`/trips/${tripId}/comment/${commentId}/react`, {
            emoji
        });
        return res.data;
    } catch (error) {
        console.error("Error adding reaction:", error);
        throw error;
    }
};

// ✅ Removed userId - backend now uses JWT authentication
export const addReply = async (tripId: string, commentId: string, reply: string) => {
    try {
        const res = await api.post(`/trips/${tripId}/comment/${commentId}/reply`, {
            reply
        });
        return res.data;
    } catch (error) {
        console.error("Error adding reply:", error);
        throw error;
    }
};

export const incrementView = async (tripId: string, userId: string) => {
    try {
        const res = await api.post(`/trips/${tripId}/views`, {
            userId
        });
        return res.data;
    } catch (error) {
        console.error("Error incrementing view:", error);
        throw error;
    }
};

// ✅ Removed userId - backend now uses JWT authentication
export const deleteComment = async (tripId: string, commentId: string) => {
    try {
        const res = await api.delete(`/trips/${tripId}/comment/${commentId}`);
        return res.data;
    } catch (error) {
        console.error("Error deleting comment:", error);
        throw error;
    }
};

export const getTripById = async (tripId: string, userId?: string) => {
    try {
        const res = await api.get(`/trips/single/${tripId}`, {
            params: { userId }
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching trip:", error);
        throw error;
    }
};

export default {
    toggleLike,
    toggleSave,
    toggleFollow,
    addComment,
    addReaction,
    addReply,
    incrementView,
    deleteComment,
    getTripById
};

