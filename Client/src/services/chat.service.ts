import httpService from './httpService';

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

// ✅ Removed currentUserId - backend now uses JWT authentication
const getConversation = async (userId: string) => {
    try {
        const response = await httpService.get(`/chat/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching conversation:', error);
        throw error;
    }
};

// ✅ Removed currentUserId - backend now uses JWT authentication
const getConversations = async () => {
    try {
        const response = await httpService.get('/chat/conversations');
        return response.data;
    } catch (error) {
        console.error('Error fetching conversations:', error);
        throw error;
    }
};

// ✅ Removed senderId - backend now uses JWT authentication
const sendMessage = async (receiverId: string, message: string) => {
    try {
        const response = await httpService.post('/chat/send', {
            receiverId,
            message
        });
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

// ✅ Removed currentUserId - backend now uses JWT authentication
const handleRequest = async (conversationId: string, action: 'accept' | 'block') => {
    try {
        const response = await httpService.put(`/chat/request/${conversationId}`, {
            action
        });
        return response.data;
    } catch (error) {
        console.error('Error handling chat request:', error);
        throw error;
    }
};

// ✅ Removed currentUserId - backend now uses JWT authentication
const markAsRead = async (userId: string) => {
    try {
        const response = await httpService.put(`/chat/read/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error marking messages as read:', error);
        throw error;
    }
};

// ✅ Removed userId - backend now uses JWT authentication
const getUnreadCount = async () => {
    try {
        const response = await httpService.post('/chat/unread');
        return response.data;
    } catch (error) {
        console.error('Error getting unread count:', error);
        throw error;
    }
};

export default {
    getConversation,
    getConversations,
    sendMessage,
    handleRequest,
    markAsRead,
    getUnreadCount
};
