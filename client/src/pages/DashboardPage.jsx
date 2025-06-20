import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ShelterCard from '../components/ShelterCard';
import RequestCard from '../components/RequestCard';

const DashboardPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [shelters, setShelters] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Show success message if redirected from form creation
  const successMessage = location.state?.message;

  useEffect(() => {
    if (user?.role === 'HOST') {
      fetchHostShelters();
    } else if (user?.role === 'SEEKER') {
      fetchSeekerRequests();
    } else {
      setIsLoading(false);
    }
  }, [user, token]);

  const fetchHostShelters = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/shelters/host/my-shelters`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shelters');
      }

      const data = await response.json();
      setShelters(data.shelters);
    } catch (error) {
      setError('Failed to load your shelters');
      console.error('Error fetching shelters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSeekerRequests = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/requests/seeker/my-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      setRequests(data.requests);
    } catch (error) {
      setError('Failed to load your requests');
      console.error('Error fetching requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteShelter = async (shelterId) => {
    if (!window.confirm('Are you sure you want to delete this shelter?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/shelters/${shelterId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete shelter');
      }

      // Remove from state
      setShelters(shelters.filter(shelter => shelter.id !== shelterId));
    } catch (error) {
      setError('Failed to delete shelter');
      console.error('Error deleting shelter:', error);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this request?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete request');
      }

      // Remove from state
      setRequests(requests.filter(request => request.id !== requestId));
    } catch (error) {
      setError('Failed to delete request');
      console.error('Error deleting request:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-secondary-900">Dashboard</h1>
          <p className="mt-2 text-secondary-600">
            Welcome back, {user?.name}! You're logged in as a {user?.role.toLowerCase()}.
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 px-4 sm:px-0">
            <div className="notification-success text-white px-4 py-3 rounded-xl shadow-soft">
              {successMessage}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 px-4 sm:px-0">
            <div className="notification-error text-white px-4 py-3 rounded-xl shadow-soft">
              {error}
            </div>
          </div>
        )}

        {/* Host Dashboard */}
        {user?.role === 'HOST' && (
          <div className="px-4 sm:px-0">
            {/* My Shelters */}
            <div className="card">
              <div className="px-6 py-4 border-b border-secondary-200/50">
                <h2 className="text-xl font-semibold text-secondary-900">My Shelters</h2>
                <p className="text-sm text-secondary-600 mt-1">
                  Manage your shelter offerings
                </p>
              </div>

              <div className="p-6">
                {shelters.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft border border-primary-600/20">
                      <span className="text-4xl">🏠</span>
                    </div>
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">No shelters yet</h3>
                    <p className="text-secondary-600 mb-6">
                      Start helping people by offering your first shelter.
                    </p>
                    <Link
                      to="/shelter/new"
                      className="btn-success"
                    >
                      Offer Your First Shelter
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {shelters.map((shelter) => (
                      <ShelterCard
                        key={shelter.id}
                        shelter={shelter}
                        showActions={true}
                        showDistance={false}
                        showRequestInfo={false}
                        onEdit={() => navigate(`/shelter/${shelter.id}/edit`)}
                        onDelete={handleDeleteShelter}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Seeker Dashboard */}
        {user?.role === 'SEEKER' && (
          <div className="px-4 sm:px-0">
            {/* My Requests */}
            <div className="card">
              <div className="px-6 py-4 border-b border-secondary-200/50">
                <h2 className="text-xl font-semibold text-secondary-900">My Requests</h2>
                <p className="text-sm text-secondary-600 mt-1">
                  Manage your shelter requests
                </p>
              </div>

              <div className="p-6">
                {requests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft border border-primary-600/20">
                      <span className="text-4xl">🔍</span>
                    </div>
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">No requests yet</h3>
                    <p className="text-secondary-600 mb-6">
                      Submit your first request when you need shelter assistance.
                    </p>
                    <Link
                      to="/request/new"
                      className="btn-success"
                    >
                      Submit Your First Request
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        showActions={true}
                        showDistance={false}
                        showSeekerInfo={false}
                        onEdit={() => navigate(`/request/${request.id}/edit`)}
                        onDelete={handleDeleteRequest}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Admin Dashboard */}
        {user?.role === 'ADMIN' && (
          <div className="px-4 sm:px-0">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">Admin Panel</h2>
              <p className="text-secondary-600 mb-6">
                Manage users, shelters, and requests.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/admin/users"
                  className="btn-primary"
                >
                  Manage Users
                </Link>
                <Link
                  to="/admin/shelters"
                  className="btn-success"
                >
                  Manage Shelters
                </Link>
                <Link
                  to="/admin/requests"
                  className="bg-gradient-accent hover:shadow-glow-accent text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-accent-500/50 focus:ring-offset-2 shadow-soft border border-accent-600/20"
                >
                  Manage Requests
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
