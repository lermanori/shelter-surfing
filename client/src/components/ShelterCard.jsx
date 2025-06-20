import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConnection } from '../hooks/useConnection';
import ConnectionRequestModal from './ConnectionRequestModal';

const ShelterCard = ({ 
  shelter, 
  showActions = true, 
  showDistance = false, 
  showRequestInfo = false,
  onEdit,
  onDelete,
  onContact,
  onViewDetails 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  
  // Check if the current user is the shelter owner
  const isOwner = user?.id === shelter.host?.id;
  
  // Check connection status with the host (only if not owner)
  const { connected, status, isLoading: connectionLoading, refreshConnection } = useConnection(
    !isOwner ? shelter.host?.id : null
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDistanceColor = (distance) => {
    if (distance <= 5) return 'text-green-600';
    if (distance <= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDistanceIcon = (distance) => {
    if (distance <= 5) return '🟢';
    if (distance <= 15) return '🟡';
    return '🔴';
  };

  const handleEdit = () => {
    if (onEdit) onEdit(shelter);
    else navigate(`/shelter/${shelter.id}/edit`);
  };

  const handleDelete = () => {
    if (onDelete) onDelete(shelter.id);
  };

  const handleContact = () => {
    if (onContact) onContact(shelter);
  };

  const handleMessage = () => {
    if (user && shelter.host?.id && user.id !== shelter.host.id) {
      if (connected) {
        const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        navigate(`/messages/${conversationId}`, { 
          state: { 
            recipientId: shelter.host.id, 
            recipientName: shelter.host.name 
          } 
        });
      } else {
        setShowConnectionModal(true);
      }
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(shelter);
    } else {
      navigate(`/shelter/${shelter.id}`);
    }
  };

  const handleConnectionSuccess = () => {
    refreshConnection();
  };

  return (
    <>
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
        {/* Shelter Images */}
        {(shelter.image1 || shelter.image2) && (
          <div className="mb-4">
            <div className="flex space-x-2 overflow-x-auto">
              {shelter.image1 && (
                <div className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden">
                  <img
                    src={shelter.image1}
                    alt={`${shelter.title} - Image 1`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {shelter.image2 && (
                <div className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden">
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

        {/* Header with Distance and Host Info */}
        <div className="flex items-center justify-between mb-4">
          {/* Host Information */}
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-lg font-bold text-blue-600">
                {shelter.host?.name?.charAt(0).toUpperCase() || 'H'}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{shelter.host?.name || 'Host'}</p>
              <p className="text-xs text-gray-500">{shelter.locationInput}</p>
            </div>
          </div>

          {/* Distance Badge */}
          {showDistance && (shelter.distance || shelter.distance === 0) && (
            <div className={`flex items-center ${getDistanceColor(shelter.distance)} text-sm font-medium`}>
              {getDistanceIcon(shelter.distance)} {shelter.distance} km
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {/* Title and Description */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {shelter.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {shelter.description}
            </p>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">Available From</p>
              <p className="text-sm font-medium">{formatDate(shelter.availableFrom)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Available Until</p>
              <p className="text-sm font-medium">{shelter.availableTo ? formatDate(shelter.availableTo) : 'Ongoing'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Capacity</p>
              <p className="text-sm font-medium">{shelter.capacity} people</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Location</p>
              <p className="text-sm font-medium">{shelter.locationInput}</p>
            </div>
          </div>

          {/* Tags */}
          {shelter.tags && shelter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {shelter.tags.map((tag, index) => (
                <span
                  key={`${shelter.id}-${tag}-${index}`}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100"
                >
                  {tag.replace('-', ' ')}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          {showActions && (
            <div className="flex gap-3 mt-4">
              {isOwner ? (
                // Owner Actions
                <>
                  <button
                    onClick={handleViewDetails}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                  <button
                    onClick={handleEdit}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Edit Shelter
                  </button>
                </>
              ) : (
                // Non-owner Actions
                <>
                  <button
                    onClick={handleViewDetails}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                  <button
                    onClick={handleContact}
                    disabled={connectionLoading || status === 'PENDING'}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${
                      connectionLoading || status === 'PENDING'
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : connected
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } transition-colors`}
                  >
                    {connectionLoading 
                      ? 'Loading...' 
                      : status === 'PENDING' 
                      ? 'Request Sent' 
                      : connected 
                      ? 'Contact Host'
                      : 'Request Connection'}
                  </button>
                </>
              )}
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
    </>
  );
};

export default ShelterCard; 