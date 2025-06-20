import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ShelterCard from '../components/ShelterCard';
import RequestCard from '../components/RequestCard';
import RequestInfo from '../components/RequestInfo';
import ShelterMatchInfo from '../components/ShelterMatchInfo';
import ConnectionRequestModal from '../components/ConnectionRequestModal';
import Map from '../components/Map';
import { useConnection } from '../hooks/useConnection';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const MatchesPage = () => {
  const { user, token } = useAuth();
  console.log('User in MatchesPage:', user); // DEBUG: Check user object for lat/lng
  const navigate = useNavigate();
  const [matchesByRequest, setMatchesByRequest] = useState([]);
  const [requests, setRequests] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    maxDistance: 5,
    minCapacity: 1,
    tags: []
  });
  const cardRefs = useRef({});
  const [highlightedId, setHighlightedId] = useState(null);
  const { connectionStatus, connectionLoading } = useConnection();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchMatches();
  }, [user, navigate, filters]);

  const fetchMatches = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (user.role === 'SEEKER') {
        // Fetch shelters that match seeker's requests
        const response = await fetch(
          `${API_BASE_URL}/api/matches?maxDistance=${filters.maxDistance}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch matches');
        }

        setMatchesByRequest(data.data.matchesByRequest || []);
        setRequests(data.data.requests || []);
        
        // Extract all shelters from matches for the map
        const allShelters = [];
        data.data.matchesByRequest?.forEach(group => {
          group.matches?.forEach(match => {
            allShelters.push(match);
          });
        });
        setShelters(allShelters);
      } else if (user.role === 'HOST') {
        // Fetch requests that match host's shelters
        const response = await fetch(
          `${API_BASE_URL}/api/matches/host?maxDistance=${filters.maxDistance}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch matches');
        }

        setMatchesByRequest(data.data.matches || []);
        setShelters(data.data.shelters || []);
        // For HOSTs, set requests to the flat matches array for the map
        setRequests(data.data.matches || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get total matches count
  const getTotalMatches = () => {
    return (matchesByRequest || []).reduce((total, group) => total + (group?.matches?.length || 0), 0);
  };

  const handleContactSeeker = async (request) => {
    try {
      // First check if we're already connected
      const connectionResponse = await fetch(
        `${API_BASE_URL}/api/connections/check/${request.seeker.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const connectionData = await connectionResponse.json();

      if (connectionData.connected) {
        // Already connected - redirect to messages
        const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        navigate(`/messages/${conversationId}`, {
          state: {
            recipientId: request.seeker.id,
            recipientName: request.seeker.name
          }
        });
      } else if (connectionData.status === 'PENDING') {
        alert('Connection request already pending. Please wait for approval.');
      } else {
        // Send connection request
        const response = await fetch(`${API_BASE_URL}/api/connections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            recipientId: request.seeker.id,
            message: `Hi ${request.seeker.name}, I'm interested in your shelter request for ${request.locationInput} on ${formatDate(request.date)}.`
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send connection request');
        }

        alert('Connection request sent! You can message once approved.');
      }
    } catch (error) {
      console.error('Error contacting seeker:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleContactHost = async (shelter) => {
    try {
      // First check if we're already connected
      const connectionResponse = await fetch(
        `${API_BASE_URL}/api/connections/check/${shelter.host.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const connectionData = await connectionResponse.json();

      if (connectionData.connected) {
        // Already connected - redirect to messages
        const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        navigate(`/messages/${conversationId}`, {
          state: {
            recipientId: shelter.host.id,
            recipientName: shelter.host.name
          }
        });
      } else if (connectionData.status === 'PENDING') {
        alert('Connection request already pending. Please wait for approval.');
      } else {
        // Send connection request
        const response = await fetch(`${API_BASE_URL}/api/connections`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            recipientId: shelter.host.id,
            message: `Hi ${shelter.host.name}, I'm interested in your shelter "${shelter.title}" in ${shelter.locationInput}.`
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send connection request');
        }

        alert('Connection request sent! You can message once approved.');
      }
    } catch (error) {
      console.error('Error contacting host:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleMarkerClick = (item, type) => {
    // Use the same ID format as the card rendering
    const id = user.role === 'HOST' ? item.id + '-' + item.shelterId : item.id;
    setHighlightedId(id);
    
    // Scroll to the card with smooth behavior
    if (cardRefs.current[id]) {
      cardRefs.current[id].scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center'
      });
    }

    // Remove highlight after 2 seconds
    setTimeout(() => setHighlightedId(null), 2000);
  };

  const handleContact = (item, type) => {
    if (type === 'shelter') {
      handleContactHost(item);
    } else if (type === 'request') {
      handleContactSeeker(item);
    }
  };

  const handleViewDetails = (item) => {
    if (user.role === 'HOST') {
      // For hosts viewing request details
      // TODO: Implement request details page
      alert(`Detailed view coming soon! You would see more details about ${item.description}.`);
    } else {
      // For seekers viewing shelter details
      navigate(`/shelter/${item.id}`);
    }
  };

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to view matches.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user.role === 'HOST' ? 'Matching Requests' : 'Available Shelters'}
              </h1>
              <p className="mt-2 text-gray-600">
                {user.role === 'HOST' 
                  ? 'Find people seeking shelter near your locations'
                  : 'Find temporary shelter based on your requests'
                }
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-0">
          {/* Filters */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Filters</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Distance (km)
                  </label>
                  <select
                    value={filters.maxDistance}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={3}>3 km</option>
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                    <option value={15}>15 km</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Capacity
                  </label>
                  <select
                    value={filters.minCapacity}
                    onChange={(e) => setFilters(prev => ({ ...prev, minCapacity: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1 person</option>
                    <option value={2}>2 people</option>
                    <option value={3}>3 people</option>
                    <option value={4}>4+ people</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={fetchMatches}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Map always shown above results */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <Map
              shelters={user.role === 'SEEKER' ? shelters : []}
              requests={user.role === 'HOST' ? requests : []}
              userRole={user.role}
              onMarkerClick={handleMarkerClick}
              userLocation={user.latitude && user.longitude ? { latitude: user.latitude, longitude: user.longitude } : null}
              searchRadiusKm={filters.maxDistance}
            />
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>💡 Click on markers to scroll to the result below</p>
              <p>🟢 Green markers: Shelters | 🔴 Red markers: Requests | 🔵 Blue: You</p>
            </div>
          </div>

          {/* Results Summary */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {user.role === 'HOST'
                      ? `${matchesByRequest.length} Match${matchesByRequest.length !== 1 ? 'es' : ''} Found`
                      : `${getTotalMatches()} Shelters Found`}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Showing results within {filters.maxDistance}km
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  <span>🟢 Shelters | 🔴 Requests</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading matches...</p>
            </div>
          ) : (
            /* List View */
            <div className="space-y-6">
              {matchesByRequest.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-8 text-center">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
                  <p className="text-gray-600">
                    Try adjusting your filters or expanding your search area.
                  </p>
                </div>
              ) : user.role === 'HOST' ? (
                matchesByRequest.length > 0 ? (
                  matchesByRequest.map((match) => {
                    // Defensively check if shelter exists on the match object
                    if (!match.shelter) {
                      console.warn("A match was found but it's missing shelter information:", match);
                      return null; // Don't render if shelter is missing
                    }
                    const cardId = `host-${match.id}-${match.shelter.id}`;
                    return (
                      <div
                        key={cardId}
                        ref={el => (cardRefs.current[cardId] = el)}
                        className={`bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-200 flex flex-col md:flex-row md:items-stretch gap-6 transition-all duration-300 ${highlightedId === cardId ? 'ring-4 ring-blue-400' : ''}`}
                      >
                        <RequestInfo request={match} />

                        <div className="hidden md:flex items-center justify-center px-4">
                          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        
                        {/* DEBUGGING: Log the connection status for this specific match */}
                        {console.log(`DEBUG: For seeker ${match.seeker.id}, connection status is:`, (connectionStatus || {})[match.seeker.id])}

                        <ShelterMatchInfo
                          match={match}
                          onContact={() => handleContact(match, 'request')}
                          connectionStatus={(connectionStatus || {})[match.seeker.id]}
                          connectionLoading={(connectionLoading || {})[match.seeker.id]}
                        />
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-500 py-8">No matching requests found for your shelters.</p>
                )
              ) : (
                matchesByRequest.map((group, index) => (
                  <div key={`group-${group.id || index}`} className="space-y-4">
                    {/* Request Info */}
                    <div className="bg-white shadow rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">Your Request</h4>
                          <p className="text-sm text-gray-600">
                            {group.request.locationInput} • {formatDate(group.request.date)} • {group.request.numberOfPeople} {group.request.numberOfPeople === 1 ? 'person' : 'people'}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {group.matchCount} matches found
                        </div>
                      </div>
                    </div>
                    
                    {/* Shelter Matches */}
                    <div className="space-y-4">
                      {group.matches?.map((shelter) => {
                        const cardId = `seeker-${group.request.id}-${shelter.id}`;
                        return (
                          <div
                            key={cardId}
                            ref={el => (cardRefs.current[cardId] = el)}
                            className={`transition-all duration-300 ${highlightedId === cardId ? 'ring-4 ring-blue-400' : ''}`}
                          >
                            <ShelterCard
                              shelter={{
                                ...shelter,
                                title: shelter.title || 'Available Shelter',
                                description: shelter.description || `Shelter available for ${shelter.capacity} people`,
                                host: shelter.host,
                                distance: Math.round(shelter.distance * 10) / 10
                              }}
                              showActions={true}
                              showDistance={true}
                              onContact={() => handleContact(shelter, 'shelter')}
                              onViewDetails={() => handleViewDetails(shelter)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchesPage; 