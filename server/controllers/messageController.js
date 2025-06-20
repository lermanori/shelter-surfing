import { PrismaClient } from '@prisma/client';
import socketService from '../services/socketService.js';

const prisma = new PrismaClient();

// POST /api/messages - Send a new message
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const { recipientId, text, conversationId } = req.body;

    // Validation
    if (!recipientId || !text || !conversationId) {
      return res.status(400).json({ 
        error: 'Recipient ID, text, and conversation ID are required' 
      });
    }

    // Check if recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId }
    });

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Check if users are connected (approved connection)
    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: senderId, recipientId: recipientId },
          { requesterId: recipientId, recipientId: senderId }
        ],
        status: 'APPROVED'
      }
    });

    if (!connection) {
      return res.status(403).json({ 
        error: 'You must be connected with this user to send messages. Send a connection request first.' 
      });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        senderId,
        recipientId,
        text,
        conversationId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Emit Socket.IO events for real-time delivery
    socketService.sendNewMessage(conversationId, message);
    
    // Send notification to recipient if they're not in the conversation
    socketService.sendNotification(recipientId, {
      type: 'new_message',
      message: `New message from ${message.sender.name}`,
      conversationId,
      senderId: message.sender.id,
      senderName: message.sender.name
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: { message }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/messages/conversations - Get all conversations for current user
export const getConversations = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all conversations where user is either sender or recipient
    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group messages by conversation ID and get the latest message for each
    const conversationMap = new Map();
    
    conversations.forEach(msg => {
      const otherUserId = msg.senderId === userId ? msg.recipientId : msg.senderId;
      const otherUser = msg.senderId === userId ? msg.recipient : msg.sender;
      
      if (!conversationMap.has(msg.conversationId)) {
        conversationMap.set(msg.conversationId, {
          conversationId: msg.conversationId,
          otherUser,
          lastMessage: msg,
          unreadCount: 0
        });
      } else {
        const conversation = conversationMap.get(msg.conversationId);
        if (msg.createdAt > conversation.lastMessage.createdAt) {
          conversation.lastMessage = msg;
        }
      }
      
      // Count unread messages
      if (msg.recipientId === userId && !msg.isRead) {
        conversationMap.get(msg.conversationId).unreadCount++;
      }
    });

    const conversationList = Array.from(conversationMap.values());

    res.json({
      message: 'Conversations retrieved successfully',
      data: { conversations: conversationList }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/messages/:conversationId - Get messages for a specific conversation
export const getConversationMessages = async (req, res) => {
  try {
    const userId = req.userId;
    const { conversationId } = req.params;

    // Get all messages in the conversation
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        OR: [
          { senderId: userId },
          { recipientId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Mark messages as read if user is the recipient
    await prisma.message.updateMany({
      where: {
        conversationId,
        recipientId: userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    res.json({
      message: 'Messages retrieved successfully',
      data: { messages }
    });
  } catch (error) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/messages/unread/count - Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;

    const unreadCount = await prisma.message.count({
      where: {
        recipientId: userId,
        isRead: false
      }
    });

    res.json({
      message: 'Unread count retrieved successfully',
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/messages/:messageId/read - Mark a message as read
export const markMessageAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { messageId } = req.params;

    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        recipientId: userId
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Message marked as read',
      data: { message: updatedMessage }
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 