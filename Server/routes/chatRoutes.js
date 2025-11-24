import express from 'express';
import * as chatController from '../controller/chatController.js';

const router = express.Router();

// Get conversation with a specific user
router.get('/:userId', chatController.getConversation);

// Send a message
router.post('/send', chatController.sendMessage);

// Mark messages as read
router.put('/read/:userId', chatController.markAsRead);

// Get unread message count
router.post('/unread', chatController.getUnreadCount);

export default router;
