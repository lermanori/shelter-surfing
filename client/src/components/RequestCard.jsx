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
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-shadow">
          {/* Status and Distance */}
          <div className="flex items-center justify-between mb-6">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
            <div className="text-xs text-gray-500">
              Submitted {formatDate(request.createdAt)}
            </div>
          </div>

          {/* Main Request Info - Similar to RequestInfo style */}
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4 shadow-sm">
              <span className="text-xl font-bold text-blue-600">
                🏠
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-900">Your Shelter Request</h3>
              <p className="text-sm text-gray-500">Status: {request.status}</p>
            </div>
          </div>

          {/* Request Details - Styled like RequestInfo */}
          <div className="text-sm text-gray-700 space-y-3 pl-4 border-l-2 border-blue-100">
            <p><span className="font-semibold text-gray-500">Location:</span> {request.locationInput}</p>
            <p><span className="font-semibold text-gray-500">Date Needed:</span> {formatDate(request.date)}</p>
            <p><span className="font-semibold text-gray-500">People:</span> {request.numberOfPeople} {request.numberOfPeople === 1 ? 'person' : 'people'}</p>
            {request.description && (
              <div className="pt-2">
                <p className="font-semibold text-gray-500">Description:</p>
                <p className="text-gray-600 pl-2 text-sm italic mt-1">"{request.description}"</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {request.tags && request.tags.length > 0 && (
            <div className="mt-6">
              <p className="font-semibold text-gray-500 text-sm mb-2">Tags:</p>
              <div className="flex flex-wrap gap-2">
                {request.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag.replace('-', ' ')}
                  </span>
                ))}
                {request.tags.length > 3 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    +{request.tags.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {showActions && (
            <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={handleEdit}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Edit Request
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
              >
                Delete Request
              </button>
            </div>
          )}
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
  }

  // Original card design for matches page and other contexts
  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
        <div className="p-6">
          {/* Status and Distance */}
          <div className="flex items-center justify-between mb-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
            {showDistance && (request.distance === 0 || request.distance) && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDistanceColor(request.distance)} bg-gray-100`}>
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
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img
                        src={request.seeker.profileImage1}
                        alt={`${request.seeker.name} - Profile 1`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {request.seeker.profileImage2 && (
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img
                        src={request.seeker.profileImage2}
                        alt={`${request.seeker.name} - Profile 2`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-bold text-green-600">
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
              <span className="font-medium">{request.numberOfPeople} {request.numberOfPeople === 1 ? 'person' : 'people'}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Date Needed:</span>
              <span className="font-medium">{formatDate(request.date)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Location:</span>
              <span className="font-medium">{request.locationInput}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Submitted:</span>
              <span className="font-medium">{formatDate(request.createdAt)}</span>
            </div>
          </div>

          {/* Tags or Categories */}
          {request.tags && request.tags.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {request.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {tag.replace('-', ' ')}
                  </span>
                ))}
                {request.tags.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
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
                    className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Details
                  </button>
                </>
              ) : (
                /* For seekers managing their requests */
                <>
                  <button
                    onClick={handleEdit}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
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