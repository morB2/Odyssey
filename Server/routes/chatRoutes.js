import express from 'express';
import * as chatController from '../controller/chatController.js';

const router = express.Router();

// Get all conversations for current user
router.get('/conversations', chatController.getConversations);

// Get conversation with a specific user
router.get('/:userId', chatController.getConversation);

// Send a message
router.post('/send', chatController.sendMessage);

// Handle chat request (accept/block)
router.put('/request/:conversationId', chatController.handleRequest);

// Mark messages as read
router.put('/read/:userId', chatController.markAsRead);

// Get unread message count
router.post('/unread', chatController.getUnreadCount);

export default router;
