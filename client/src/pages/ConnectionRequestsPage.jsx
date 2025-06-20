import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useNotifications } from '../hooks/useNotifications';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ConnectionRequestsPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { refreshCounts } = useNotifications();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConnectionRequests();
  }, []);

  // Refresh notification counts when connection requests are viewed
  useEffect(() => {
    if (requests.length > 0) {
      refreshCounts();
    }
  }, [requests, refreshCounts]);

  const fetchConnectionRequests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/connections/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch connection requests');
      }

      const data = await response.json();
      setRequests(data.connections);
    } catch (error) {
      setError('Failed to load connection requests');
      console.error('Error fetching connection requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (connectionId, requesterId, requesterName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/connections/${connectionId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve connection');
      }

      // Remove from requests list
      setRequests(requests.filter(req => req.id !== connectionId));

      // Automatically redirect to messages with the newly connected user
      const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      navigate(`/messages/${conversationId}`, {
        state: {
          recipientId: requesterId,
          recipientName: requesterName
        }
      });
    } catch (error) {
      setError('Failed to approve connection');
      console.error('Error approving connection:', error);
    }
  };

  const handleReject = async (connectionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/connections/${connectionId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reject connection');
      }

      // Remove from requests list
      setRequests(requests.filter(req => req.id !== connectionId));
    } catch (error) {
      setError('Failed to reject connection');
      console.error('Error rejecting connection:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading connection requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Connection Requests</h1>
          <p className="mt-2 text-gray-600">
            Review and respond to connection requests from other users
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {requests.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">📬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No connection requests</h3>
            <p className="text-gray-600">
              You don't have any pending connection requests at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">
                        {request.requester.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.requester.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {request.requester.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        {request.requester.role.toLowerCase()} • {request.requester.locationInput}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Requested {formatDate(request.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleApprove(request.id, request.requester.id, request.requester.name)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(request.id)}
                      variant="secondary"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
                
                {request.message && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Message:</span> {request.message}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionRequestsPage; 