import Message from '../models/messageModel.js';
import Conversation from '../models/conversationModel.js';
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
 * Get all conversations for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of conversations
 */
export const getConversations = async (userId) => {
    try {
        const conversations = await Conversation.find({
            participants: userId
        })
            .sort({ updatedAt: -1 })
            .populate('participants', 'firstName lastName avatar')
            .populate('lastMessage')
            .lean();

        return conversations;
    } catch (error) {
        console.error('Error fetching conversations:', error);
        throw error;
    }
};

/**
 * Get conversation status between two users
 * @param {string} userId1 
 * @param {string} userId2 
 */
export const getConversationStatus = async (userId1, userId2) => {
    try {
        const conversation = await Conversation.findOne({
            participants: { $all: [userId1, userId2] }
        });
        return conversation ? conversation : null;
    } catch (error) {
        console.error('Error fetching conversation status:', error);
        throw error;
    }
};

/**
 * Handle chat request (accept/block)
 * @param {string} conversationId 
 * @param {string} action - 'accept' | 'block'
 * @param {string} userId - User performing the action
 */
export const handleChatRequest = async (conversationId, action, userId) => {
    try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) throw new Error('Conversation not found');

        if (action === 'accept') {
            conversation.status = 'accepted';
        } else if (action === 'block') {
            conversation.status = 'blocked';
            conversation.blockedBy = userId;
        }

        await conversation.save();
        return conversation;
    } catch (error) {
        console.error('Error handling chat request:', error);
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
        // Check or create conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (conversation) {
            if (conversation.status === 'blocked') {
                throw new Error('Conversation is blocked');
            }
        } else {
            conversation = new Conversation({
                participants: [senderId, receiverId],
                initiator: senderId,
                status: 'pending'
            });
            await conversation.save();
        }

        const message = new Message({
            senderId,
            receiverId,
            message: messageText
        });

        await message.save();

        // Update conversation last message
        conversation.lastMessage = message._id;
        await conversation.save();

        // Populate sender and receiver info
        await message.populate('senderId', 'firstName lastName avatar');
        await message.populate('receiverId', 'firstName lastName avatar');

        // Emit the message via Socket.IO to the receiver
        const io = getIO();
        io.to(`user:${receiverId}`).emit('newMessage', message);

        // Also emit conversation update
        io.to(`user:${receiverId}`).emit('conversationUpdate', conversation);
        io.to(`user:${senderId}`).emit('conversationUpdate', conversation);

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
