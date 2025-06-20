import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useNotifications = () => {
  const { token } = useAuth();
  const { notifications } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionRequestsCount, setConnectionRequestsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUnreadCount = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/unread/count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchConnectionRequestsCount = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/connections/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConnectionRequestsCount(data.connections?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching connection requests count:', error);
    }
  };

  const refreshCounts = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchUnreadCount(),
      fetchConnectionRequestsCount()
    ]);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshCounts();
  }, [token]);

  // Update counts when new notifications arrive
  useEffect(() => {
    // Check for new message or connection request notifications from the socket
    const hasNewMessage = notifications.some(n => n.type === 'new_message');
    const hasNewConnection = notifications.some(n => ['connection_request', 'connection_accepted'].includes(n.type));

    // If there's a new message, refresh the unread count from the server
    if (hasNewMessage) {
      fetchUnreadCount();
    }

    // If there's a new connection event, refresh the connection requests count
    if (hasNewConnection) {
      fetchConnectionRequestsCount();
    }
  }, [notifications]);

  return {
    unreadCount,
    connectionRequestsCount,
    isLoading,
    refreshCounts
  };
}; 