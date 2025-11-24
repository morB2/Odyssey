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

const getConversation = async (userId: string, currentUserId: string) => {
    try {
        const response = await httpService.get(`/chat/${userId}`, {
            params: { currentUserId }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching conversation:', error);
        throw error;
    }
};

const getConversations = async (currentUserId: string) => {
    try {
        const response = await httpService.get('/chat/conversations', {
            params: { currentUserId }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching conversations:', error);
        throw error;
    }
};

const sendMessage = async (senderId: string, receiverId: string, message: string) => {
    try {
        const response = await httpService.post('/chat/send', {
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

const handleRequest = async (conversationId: string, action: 'accept' | 'block', currentUserId: string) => {
    try {
        const response = await httpService.put(`/chat/request/${conversationId}`, {
            action,
            currentUserId
        });
        return response.data;
    } catch (error) {
        console.error('Error handling chat request:', error);
        throw error;
    }
};

const markAsRead = async (userId: string, currentUserId: string) => {
    try {
        const response = await httpService.put(`/chat/read/${userId}`, {
            currentUserId
        });
        return response.data;
    } catch (error) {
        console.error('Error marking messages as read:', error);
        throw error;
    }
};

const getUnreadCount = async (userId: string) => {
    try {
        const response = await httpService.post('/chat/unread', {
            userId
        });
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
