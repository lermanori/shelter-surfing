import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConnection } from '../hooks/useConnection';
import ConnectionRequestModal from './ConnectionRequestModal';

const RequestCard = ({ 
  request, 
  showActions = true, 
  showDistance = false,
  showSeekerInfo = true,
  onEdit,
  onDelete,
  onContact,
  onViewDetails 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  
  // Check connection status with the seeker
  const { connected, status, isLoading: connectionLoading, refreshConnection } = useConnection(request.seeker?.id);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'badge-warning';
      case 'APPROVED':
        return 'badge-success';
      case 'REJECTED':
        return 'badge-danger';
      case 'COMPLETED':
        return 'badge-primary';
      default:
        return 'badge-secondary';
    }
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
    if (onEdit) {
      onEdit(request);
    } else {
      navigate(`/request/${request.id}/edit`);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(request.id);
    }
  };

  const handleContact = () => {
    if (onContact) {
      onContact(request);
    } else {
      // Default contact behavior
      alert(`Contact functionality coming soon! You would contact ${request.seeker?.name} about their request.`);
    }
  };

  const handleMessage = () => {
    if (user && request.seeker?.id && user.id !== request.seeker.id) {
      if (connected) {
        // Users are connected, allow messaging
        const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        navigate(`/messages/${conversationId}`, { 
          state: { 
            recipientId: request.seeker.id, 
            recipientName: request.seeker.name 
          } 
        });
      } else {
        // Users are not connected, show connection request modal
        setShowConnectionModal(true);
      }
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(request);
    } else {
      // Default view details behavior
      alert(`Detailed view coming soon! You would see more details about this request.`);
    }
  };

  const handleConnectionSuccess = () => {
    refreshConnection();
  };

  const getActionButtonText = () => {
    if (connectionLoading) return 'Loading...';
    if (connected) return 'Message Seeker';
    if (status === 'PENDING') return 'Request Sent';
    return 'Request Connection';
  };

  const getActionButtonDisabled = () => {
    return connectionLoading || status === 'PENDING';
  };

  const getActionButtonClass = () => {
    if (status === 'PENDING') {
      return 'flex-1 bg-gray-400 text-white px-3 py-2 rounded-md cursor-not-allowed text-sm font-medium';
    }
    return 'flex-1 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium';
  };

  // Dashboard style - matches RequestInfo component design
  if (!showDistance && !showSeekerInfo) {
    return (
      <>
        <div className="card card-hover p-6">
          {/* Status and Distance */}
          <div className="flex items-center justify-between mb-6">
            <span className={`badge ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
            <div className="text-xs text-gray-500 flex items-center">
              <span className="mr-1">📅</span>
              Submitted {formatDate(request.createdAt)}
            </div>
          </div>

          {/* Main Request Info - Similar to RequestInfo style */}
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-md border border-blue-600/20">
              <span className="text-white text-xl">
                🏠
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Your Shelter Request</h3>
              <p className="text-sm text-gray-500">Status: {request.status}</p>
            </div>
          </div>

          {/* Request Details - Styled like RequestInfo */}
          <div className="text-sm text-gray-700 space-y-4 pl-4 border-l-2 border-blue-200/50">
            <div className="flex items-center">
              <span className="icon-container bg-blue-100/80 text-blue-600 border-blue-200/50 mr-3">
                <span className="text-blue-600 text-xs">📍</span>
              </span>
              <p><span className="font-semibold text-gray-500">Location:</span> {request.locationInput}</p>
            </div>
            <div className="flex items-center">
              <span className="icon-container bg-green-100/80 text-green-600 border-green-200/50 mr-3">
                <span className="text-green-600 text-xs">📅</span>
              </span>
              <p><span className="font-semibold text-gray-500">Date Needed:</span> {formatDate(request.date)}</p>
            </div>
            <div className="flex items-center">
              <span className="icon-container bg-gray-100/80 text-gray-600 border-gray-200/50 mr-3">
                <span className="text-gray-600 text-xs">👥</span>
              </span>
              <p><span className="font-semibold text-gray-500">People:</span> {request.numberOfPeople} {request.numberOfPeople === 1 ? 'person' : 'people'}</p>
            </div>
            {request.description && (
              <div className="pt-2">
                <div className="flex items-start">
                  <span className="icon-container bg-yellow-100/80 text-yellow-600 border-yellow-200/50 mr-3 mt-0.5">
                    <span className="text-yellow-600 text-xs">📝</span>
                  </span>
                  <div>
                    <p className="font-semibold text-gray-500">Description:</p>
                    <p className="text-gray-600 pl-2 text-sm italic mt-1">"{request.description}"</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {request.tags && request.tags.length > 0 && (
            <div className="mt-6">
              <p className="font-semibold text-gray-500 text-sm mb-3">Tags:</p>
              <div className="flex flex-wrap gap-2">
                {request.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="badge badge-primary"
                  >
                    {tag.replace('-', ' ')}
                  </span>
                ))}
                {request.tags.length > 3 && (
                  <span className="badge badge-secondary">
                    +{request.tags.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {showActions && (
            <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200/50">
              <button
                onClick={handleEdit}
                className="btn-outline flex-1"
              >
                Edit Request
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger-outline flex-1"
              >
                Delete Request
              </button>
            </div>
          )}
        </div>
      </>
    );
  }

  // Original card design for matches page and other contexts
  return (
    <>
      <div className="card card-hover p-6">
        <div className="">
          {/* Status and Distance */}
          <div className="flex items-center justify-between mb-4">
            <span className={`badge ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
            {showDistance && (request.distance === 0 || request.distance) && (
              <span className={`badge ${getDistanceColor(request.distance).includes('green') ? 'badge-success' : getDistanceColor(request.distance).includes('yellow') ? 'badge-warning' : 'badge-danger'}`}>
                {getDistanceIcon(request.distance)} {request.distance} km away
              </span>
            )}
          </div>

          {/* Request Description */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Shelter Request
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {request.description || `Need shelter for ${request.numberOfPeople} ${request.numberOfPeople === 1 ? 'person' : 'people'} on ${formatDate(request.date)}`}
          </p>

          {/* Seeker Information */}
          {showSeekerInfo && request.seeker && (
            <div className="flex items-center mb-3">
              {(request.seeker.profileImage1 || request.seeker.profileImage2) ? (
                <div className="flex space-x-2 mr-3">
                  {request.seeker.profileImage1 && (
                    <div className="w-8 h-8 rounded-xl overflow-hidden shadow-soft">
                      <img
                        src={request.seeker.profileImage1}
                        alt={`${request.seeker.name} - Profile 1`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {request.seeker.profileImage2 && (
                    <div className="w-8 h-8 rounded-xl overflow-hidden shadow-soft">
                      <img
                        src={request.seeker.profileImage2}
                        alt={`${request.seeker.name} - Profile 2`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center mr-3 border border-primary-600/20">
                  <span className="text-sm font-bold text-white">
                    {request.seeker.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{request.seeker.name}</p>
                <p className="text-xs text-gray-500">{request.seeker.locationInput}</p>
              </div>
            </div>
          )}

          {/* Request Details */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Number of People:</span>
              <span className="font-medium text-gray-900">{request.numberOfPeople} {request.numberOfPeople === 1 ? 'person' : 'people'}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Date Needed:</span>
              <span className="font-medium text-gray-900">{formatDate(request.date)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Location:</span>
              <span className="font-medium text-gray-900">{request.locationInput}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Submitted:</span>
              <span className="font-medium text-gray-900">{formatDate(request.createdAt)}</span>
            </div>
          </div>

          {/* Tags or Categories */}
          {request.tags && request.tags.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {request.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="badge badge-success"
                  >
                    {tag.replace('-', ' ')}
                  </span>
                ))}
                {request.tags.length > 3 && (
                  <span className="badge badge-secondary">
                    +{request.tags.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {showActions && (
            <div className="flex space-x-2">
              {/* For hosts viewing requests */}
              {showDistance ? (
                <>
                  <button
                    onClick={handleMessage}
                    disabled={getActionButtonDisabled()}
                    className={getActionButtonClass()}
                  >
                    {getActionButtonText()}
                  </button>
                  <button
                    onClick={handleViewDetails}
                    className="btn-secondary flex-1"
                  >
                    Details
                  </button>
                </>
              ) : (
                /* For seekers managing their requests */
                <>
                  <button
                    onClick={handleEdit}
                    className="btn-primary flex-1"
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
              )}
            </div>
          )}
        </div>
      </div>

      {/* Connection Request Modal */}
      <ConnectionRequestModal
        isOpen={showConnectionModal}
        onClose={() => setShowConnectionModal(false)}
        recipientId={request.seeker?.id}
        recipientName={request.seeker?.name}
        onSuccess={handleConnectionSuccess}
      />
    </>
  );
};

export default RequestCard; 