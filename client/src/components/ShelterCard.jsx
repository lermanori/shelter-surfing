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
      <div className="card card-hover p-6">
        {/* Shelter Images */}
        {(shelter.image1 || shelter.image2) && (
          <div className="mb-6">
            <div className="flex space-x-3 overflow-x-auto">
              {shelter.image1 && (
                <div className="flex-shrink-0 w-40 h-28 rounded-lg overflow-hidden shadow-soft">
                  <img
                    src={shelter.image1}
                    alt={`${shelter.title} - Image 1`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {shelter.image2 && (
                <div className="flex-shrink-0 w-40 h-28 rounded-lg overflow-hidden shadow-soft">
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
        <div className="flex items-center justify-between mb-6">
          {/* Host Information */}
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mr-4 shadow-soft border border-primary-600/20">
              <span className="text-white font-bold text-lg">
                {shelter.host?.name?.charAt(0).toUpperCase() || 'H'}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-secondary-900">{shelter.host?.name || 'Host'}</p>
              <p className="text-xs text-secondary-500 flex items-center">
                <span className="mr-1">📍</span>
                {shelter.locationInput}
              </p>
            </div>
          </div>

          {/* Distance Badge */}
          {showDistance && (shelter.distance || shelter.distance === 0) && (
            <div className={`badge ${getDistanceColor(shelter.distance).includes('green') ? 'badge-success' : getDistanceColor(shelter.distance).includes('yellow') ? 'badge-warning' : 'badge-danger'}`}>
              {getDistanceIcon(shelter.distance)} {shelter.distance} km
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {/* Title and Description */}
          <div>
            <h3 className="text-xl font-bold text-secondary-900 mb-3">
              {shelter.title}
            </h3>
            <p className="text-secondary-600 text-sm leading-relaxed">
              {shelter.description}
            </p>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-secondary-200/50">
            <div className="flex items-center">
              <span className="icon-container icon-container-primary mr-3">
                <span className="text-primary-600 text-sm">📅</span>
              </span>
              <div>
                <p className="text-xs text-secondary-500 mb-1">Available From</p>
                <p className="text-sm font-medium text-secondary-900">{formatDate(shelter.availableFrom)}</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="icon-container icon-container-success mr-3">
                <span className="text-success-600 text-sm">📅</span>
              </span>
              <div>
                <p className="text-xs text-secondary-500 mb-1">Available Until</p>
                <p className="text-sm font-medium text-secondary-900">{shelter.availableTo ? formatDate(shelter.availableTo) : 'Ongoing'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="icon-container icon-container-secondary mr-3">
                <span className="text-secondary-600 text-sm">👥</span>
              </span>
              <div>
                <p className="text-xs text-secondary-500 mb-1">Capacity</p>
                <p className="text-sm font-medium text-secondary-900">{shelter.capacity} people</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="icon-container icon-container-warning mr-3">
                <span className="text-warning-600 text-sm">📍</span>
              </span>
              <div>
                <p className="text-xs text-secondary-500 mb-1">Location</p>
                <p className="text-sm font-medium text-secondary-900">{shelter.locationInput}</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {shelter.tags && shelter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {shelter.tags.map((tag, index) => (
                <span
                  key={`${shelter.id}-${tag}-${index}`}
                  className="badge badge-success"
                >
                  {tag.replace('-', ' ')}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          {showActions && (
            <div className="flex gap-3 mt-6">
              {isOwner ? (
                // Owner Actions
                <>
                  <button
                    onClick={handleViewDetails}
                    className="btn-secondary flex-1"
                  >
                    View Details
                  </button>
                  <button
                    onClick={handleEdit}
                    className="btn-outline flex-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="btn-danger-outline flex-1"
                  >
                    Delete
                  </button>
                </>
              ) : (
                // Non-owner Actions
                <>
                  <button
                    onClick={handleViewDetails}
                    className="btn-primary flex-1"
                  >
                    View Details
                  </button>
                  {connected ? (
                    <button
                      onClick={handleMessage}
                      className="btn-success flex-1"
                      disabled={connectionLoading}
                    >
                      {connectionLoading ? 'Loading...' : 'Message'}
                    </button>
                  ) : (
                    <button
                      onClick={handleMessage}
                      className="btn-outline flex-1"
                      disabled={connectionLoading}
                    >
                      {connectionLoading ? 'Loading...' : 'Request Connection'}
                    </button>
                  )}
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