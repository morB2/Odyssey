import * as chatService from '../services/chatService.js';

/**
 * Get conversation between current user and another user
 */
export const getConversation = async (req, res) => {
    try {
        console.log('getConversation params:', req.params);
        console.log('getConversation query:', req.query);
        const { userId } = req.params;
        const currentUserId = req.query.currentUserId || req.body.currentUserId;

        if (!currentUserId) {
            console.log('Missing currentUserId');
            return res.status(400).json({ error: 'Current user ID is required' });
        }

        const messages = await chatService.getConversation(currentUserId, userId);
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error in getConversation:', error);
        res.status(500).json({ error: 'Failed to fetch conversation' });
    }
};

/**
 * Send a message to another user
 */
export const sendMessage = async (req, res) => {
    try {
        console.log('sendMessage body:', req.body);
        const { senderId, receiverId, message } = req.body;

        if (!senderId || !receiverId || !message) {
            console.log('Missing fields in sendMessage');
            return res.status(400).json({ error: 'Sender ID, receiver ID, and message are required' });
        }

        const newMessage = await chatService.sendMessage(senderId, receiverId, message);
        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

/**
 * Mark messages as read
 */
export const markAsRead = async (req, res) => {
    try {
        const { userId } = req.params;
        const { currentUserId } = req.body;

        if (!currentUserId) {
            return res.status(400).json({ error: 'Current user ID is required' });
        }

        await chatService.markMessagesAsRead(currentUserId, userId);
        res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error in markAsRead:', error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
};

/**
 * Get unread message count
 */
export const getUnreadCount = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const count = await chatService.getUnreadCount(userId);
        res.status(200).json({ count });
    } catch (error) {
        console.error('Error in getUnreadCount:', error);
        res.status(500).json({ error: 'Failed to get unread count' });
    }
};
