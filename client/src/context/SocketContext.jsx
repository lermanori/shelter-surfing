import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Message events
    newSocket.on('new_message', (message) => {
      console.log('New message received:', message);
      // Add notification
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'new_message',
        message: `New message from ${message.sender.name}`,
        data: message,
        timestamp: new Date()
      }]);
    });

    // Notification events
    newSocket.on('notification', (notification) => {
      console.log('Notification received:', notification);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        ...notification,
        timestamp: new Date()
      }]);
    });

    // Connection request events
    newSocket.on('connection_request', (data) => {
      console.log('Connection request received:', data);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'connection_request',
        message: `Connection request from ${data.requester.name}`,
        data: data,
        timestamp: new Date()
      }]);
    });

    // Connection update events
    newSocket.on('connection_update', (data) => {
      console.log('Connection update received:', data);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'connection_update',
        message: data.type === 'connection_approved' 
          ? `Connection approved by ${data.approvedBy.name}`
          : `Connection rejected by ${data.rejectedBy.name}`,
        data: data,
        timestamp: new Date()
      }]);
    });

    // Typing events
    newSocket.on('user_typing', (data) => {
      setTypingUsers(prev => ({
        ...prev,
        [data.conversationId]: data.userId
      }));
    });

    newSocket.on('user_stop_typing', (data) => {
      setTypingUsers(prev => {
        const newTypingUsers = { ...prev };
        if (newTypingUsers[data.conversationId] === data.userId) {
          delete newTypingUsers[data.conversationId];
        }
        return newTypingUsers;
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, token]);

  const joinConversation = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('join_conversation', conversationId);
    }
  };

  const leaveConversation = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('leave_conversation', conversationId);
    }
  };

  const sendTyping = (recipientId, conversationId) => {
    if (socket && isConnected) {
      socket.emit('typing', { recipientId, conversationId });
    }
  };

  const sendStopTyping = (recipientId, conversationId) => {
    if (socket && isConnected) {
      socket.emit('stop_typing', { recipientId, conversationId });
    }
  };

  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value = {
    socket,
    isConnected,
    notifications,
    typingUsers,
    joinConversation,
    leaveConversation,
    sendTyping,
    sendStopTyping,
    clearNotification,
    clearAllNotifications
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 