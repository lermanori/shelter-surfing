import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useConnection = (otherUserId) => {
  const { token } = useAuth();
  // The state will now hold a map of statuses if no specific user ID is given
  const [connectionStatus, setConnectionStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllConnections = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/connections/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch connection statuses');
      const data = await response.json();
      setConnectionStatus(data.data.statuses || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const fetchSingleConnection = useCallback(async (id) => {
    if (!id || !token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/connections/check/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to check connection status');
      const data = await response.json();
      setConnectionStatus(prev => ({
        ...prev,
        [id]: {
          connected: data.connected,
          status: data.status,
          connectionId: data.connectionId,
        },
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (otherUserId) {
      fetchSingleConnection(otherUserId);
    } else {
      fetchAllConnections();
    }
  }, [otherUserId, token, fetchSingleConnection, fetchAllConnections]);

  const refreshConnection = useCallback(() => {
    if (otherUserId) {
      fetchSingleConnection(otherUserId);
    } else {
      fetchAllConnections();
    }
  }, [otherUserId, fetchSingleConnection, fetchAllConnections]);
  
  // For single-user checks, return the specific status object for backward compatibility
  const singleStatus = otherUserId ? (connectionStatus[otherUserId] || {}) : {};

  return {
    // If a specific user is requested, return its properties directly
    connected: singleStatus.connected,
    status: singleStatus.status,
    connectionId: singleStatus.connectionId,
    // Return the whole map for the MatchesPage
    connectionStatus,
    isLoading,
    error,
    refreshConnection,
  };
}; 