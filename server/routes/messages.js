import express from 'express';
import { 
  sendMessage, 
  getConversations, 
  getConversationMessages, 
  getUnreadCount,
  markMessageAsRead
} from '../controllers/messageController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

// POST /api/messages - Send a new message
router.post('/', verifyToken, sendMessage);

// GET /api/messages/conversations - Get all conversations for current user
router.get('/conversations', verifyToken, getConversations);

// GET /api/messages/:conversationId - Get messages for a specific conversation
router.get('/:conversationId', verifyToken, getConversationMessages);

// GET /api/messages/unread/count - Get unread message count
router.get('/unread/count', verifyToken, getUnreadCount);

// PUT /api/messages/:messageId/read - Mark a message as read
router.put('/:messageId/read', verifyToken, markMessageAsRead);

export default router; 