import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConnection } from '../hooks/useConnection';
import ConnectionRequestModal from '../components/ConnectionRequestModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ShelterDetailsPage = () => {
  const { shelterId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [shelter, setShelter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  
  // Check if the current user is the shelter owner
  const isOwner = user?.id === shelter?.host?.id;
  
  // Only check connection if not the owner
  const { connected, status, isLoading: connectionLoading, refreshConnection } = useConnection(
    !isOwner ? shelter?.host?.id : null
  );

  useEffect(() => {
    const fetchShelterDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/shelters/${shelterId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch shelter details');
        }

        const data = await response.json();
        setShelter(data.shelter);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (shelterId && token) {
      fetchShelterDetails();
    }
  }, [shelterId, token]);

  const handleEdit = () => {
    navigate(`/shelter/${shelterId}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this shelter?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/shelters/${shelterId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete shelter');
      }

      navigate('/dashboard', { state: { message: 'Shelter deleted successfully' } });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleConnectionSuccess = () => {
    refreshConnection();
    setShowConnectionModal(false);
  };

  const handleContact = () => {
    if (connected) {
      // If already connected, navigate to messages
      const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      navigate(`/messages/${conversationId}`, {
        state: {
          recipientId: shelter.host?.id,
          recipientName: shelter.host?.name
        }
      });
    } else {
      // If not connected, show connection modal
      setShowConnectionModal(true);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading shelter details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-8">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!shelter) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-8">
            <div className="text-center text-gray-600">
              <p>Shelter not found</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        {/* Main Content */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl font-bold text-blue-600">
                    {shelter.host?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{shelter.title}</h1>
                  <p className="text-gray-500">{shelter.locationInput}</p>
                </div>
              </div>
              {isOwner && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Edit Shelter
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Shelter Images */}
          {(shelter.image1 || shelter.image2) && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shelter.image1 && (
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img
                      src={shelter.image1}
                      alt={`${shelter.title} - Image 1`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {shelter.image2 && (
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img
                      src={shelter.image2}
                      alt={`${shelter.title} - Image 2`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">About this shelter</h2>
            <p className="text-gray-600 whitespace-pre-line">{shelter.description}</p>
          </div>

          {/* Details Grid */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Available From</h3>
                <p className="mt-1 text-lg text-gray-900">{formatDate(shelter.availableFrom)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Available Until</h3>
                <p className="mt-1 text-lg text-gray-900">
                  {shelter.availableTo ? formatDate(shelter.availableTo) : 'Ongoing'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Capacity</h3>
                <p className="mt-1 text-lg text-gray-900">{shelter.capacity} people</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p className="mt-1 text-lg text-gray-900">{shelter.locationInput}</p>
              </div>
            </div>
          </div>

          {/* Amenities/Tags */}
          {shelter.tags && shelter.tags.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities & Features</h2>
              <div className="flex flex-wrap gap-2">
                {shelter.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-100"
                  >
                    {tag.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Host Information */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">About the Host</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl font-bold text-blue-600">
                    {shelter.host?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{shelter.host?.name}</h3>
                  <p className="text-gray-500">{shelter.host?.locationInput}</p>
                </div>
              </div>
              {!isOwner && shelter.host?.id && (
                <button
                  onClick={() => navigate(`/user/${shelter.host.id}`)}
                  className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Profile →
                </button>
              )}
            </div>
          </div>

          {/* Action Button */}
          {!isOwner && (
            <div className="p-6">
              <button
                onClick={handleContact}
                disabled={connectionLoading || status === 'PENDING'}
                className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  connectionLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : status === 'PENDING'
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : connected
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {connectionLoading 
                  ? 'Loading...' 
                  : status === 'PENDING' 
                  ? 'Request Sent' 
                  : connected 
                  ? 'Message Host'
                  : 'Request Connection'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Connection Request Modal */}
      {showConnectionModal && (
        <ConnectionRequestModal
          isOpen={showConnectionModal}
          onClose={() => setShowConnectionModal(false)}
          recipientId={shelter.host?.id}
          recipientName={shelter.host?.name}
          onSuccess={handleConnectionSuccess}
          message={`Hi ${shelter.host?.name}, I'm interested in your shelter "${shelter.title}" in ${shelter.locationInput}.`}
        />
      )}
    </div>
  );
};

export default ShelterDetailsPage;