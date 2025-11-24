import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ChatMessage {
    _id: string;
    senderId: {
        _id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
    };
    receiverId: {
        _id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
    };
    message: string;
    read: boolean;
    createdAt: string;
}

/**
 * Get conversation with a specific user
 */
export const getConversation = async (currentUserId: string, otherUserId: string): Promise<ChatMessage[]> => {
    try {
        const response = await axios.get(`${API_URL}/chat/${otherUserId}`, {
            params: { currentUserId }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching conversation:', error);
        throw error;
    }
};

/**
 * Send a message to another user
 */
export const sendMessage = async (senderId: string, receiverId: string, message: string): Promise<ChatMessage> => {
    try {
        const response = await axios.post(`${API_URL}/chat/send`, {
            senderId,
            receiverId,
            message
        });
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

/**
 * Mark messages as read
 */
export const markAsRead = async (currentUserId: string, otherUserId: string): Promise<void> => {
    try {
        await axios.put(`${API_URL}/chat/read/${otherUserId}`, {
            currentUserId
        });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        throw error;
    }
};

/**
 * Get unread message count
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
    try {
        const response = await axios.post(`${API_URL}/chat/unread`, {
            userId
        });
        return response.data.count;
    } catch (error) {
        console.error('Error getting unread count:', error);
        throw error;
    }
};
