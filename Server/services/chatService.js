import Message from '../models/messageModel.js';
import { getIO } from '../config/socket.js';

/**
 * Get conversation between two users
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {Promise<Array>} Array of messages
 */
export const getConversation = async (userId1, userId2) => {
    try {
        const messages = await Message.find({
            $or: [
                { senderId: userId1, receiverId: userId2 },
                { senderId: userId2, receiverId: userId1 }
            ]
        })
            .sort({ createdAt: 1 })
            .populate('senderId', 'firstName lastName avatar')
            .populate('receiverId', 'firstName lastName avatar')
            .lean();

        return messages;
    } catch (error) {
        console.error('Error fetching conversation:', error);
        throw error;
    }
};

/**
 * Send a message and emit via Socket.IO
 * @param {string} senderId - Sender user ID
 * @param {string} receiverId - Receiver user ID
 * @param {string} messageText - Message content
 * @returns {Promise<Object>} Created message
 */
export const sendMessage = async (senderId, receiverId, messageText) => {
    try {
        const message = new Message({
            senderId,
            receiverId,
            message: messageText
        });

        await message.save();

        // Populate sender and receiver info
        await message.populate('senderId', 'firstName lastName avatar');
        await message.populate('receiverId', 'firstName lastName avatar');

        // Emit the message via Socket.IO to the receiver
        const io = getIO();
        io.to(`user:${receiverId}`).emit('newMessage', message);

        return message;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

/**
 * Mark all messages from a specific user as read
 * @param {string} userId - Current user ID
 * @param {string} otherUserId - Other user ID
 * @returns {Promise<Object>} Update result
 */
export const markMessagesAsRead = async (userId, otherUserId) => {
    try {
        const result = await Message.updateMany(
            {
                senderId: otherUserId,
                receiverId: userId,
                read: false
            },
            {
                $set: { read: true }
            }
        );

        return result;
    } catch (error) {
        console.error('Error marking messages as read:', error);
        throw error;
    }
};

/**
 * Get unread message count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Count of unread messages
 */
export const getUnreadCount = async (userId) => {
    try {
        const count = await Message.countDocuments({
            receiverId: userId,
            read: false
        });

        return count;
    } catch (error) {
        console.error('Error getting unread count:', error);
        throw error;
    }
};
