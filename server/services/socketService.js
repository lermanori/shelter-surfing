import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected with socket ${socket.id}`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id);

      // Join user to their personal room
      socket.join(`user_${socket.userId}`);

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        this.connectedUsers.delete(socket.userId);
      });

      // Handle typing events
      socket.on('typing', (data) => {
        const { recipientId, conversationId } = data;
        socket.to(`user_${recipientId}`).emit('user_typing', {
          userId: socket.userId,
          conversationId
        });
      });

      // Handle stop typing events
      socket.on('stop_typing', (data) => {
        const { recipientId, conversationId } = data;
        socket.to(`user_${recipientId}`).emit('user_stop_typing', {
          userId: socket.userId,
          conversationId
        });
      });

      // Handle join conversation
      socket.on('join_conversation', (conversationId) => {
        socket.join(`conversation_${conversationId}`);
        console.log(`User ${socket.userId} joined conversation ${conversationId}`);
      });

      // Handle leave conversation
      socket.on('leave_conversation', (conversationId) => {
        socket.leave(`conversation_${conversationId}`);
        console.log(`User ${socket.userId} left conversation ${conversationId}`);
      });
    });
  }

  // Send message to specific user
  sendMessageToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  // Send message to conversation
  sendMessageToConversation(conversationId, event, data) {
    this.io.to(`conversation_${conversationId}`).emit(event, data);
  }

  // Send notification to user
  sendNotification(userId, notification) {
    this.sendMessageToUser(userId, 'notification', notification);
  }

  // Send new message to conversation participants
  sendNewMessage(conversationId, message) {
    this.sendMessageToConversation(conversationId, 'new_message', message);
  }

  // Send connection request notification
  sendConnectionRequest(recipientId, request) {
    this.sendMessageToUser(recipientId, 'connection_request', request);
  }

  // Send connection status update
  sendConnectionUpdate(userId, connection) {
    this.sendMessageToUser(userId, 'connection_update', connection);
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  // Get online users count
  getOnlineUsersCount() {
    return this.connectedUsers.size;
  }
}

export default new SocketService(); 