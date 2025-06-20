import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different types
const shelterIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const requestIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map bounds updates
const MapBoundsUpdater = ({ items, userLocation, searchRadiusKm }) => {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      // If we have user location, calculate bounds based on search radius
      const center = [userLocation.latitude, userLocation.longitude];
      const radiusInDegrees = (searchRadiusKm * 1000) / 111000; // Rough conversion from meters to degrees

      // Calculate a bounding box that covers the search radius
      const bounds = L.latLngBounds([
        [center[0] - radiusInDegrees, center[1] - radiusInDegrees],
        [center[0] + radiusInDegrees, center[1] + radiusInDegrees]
      ]);

      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (items && items.length > 0) {
      // Fallback to fitting all items if no user location
      const bounds = L.latLngBounds(
        items.map(item => [item.latitude, item.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [items, map, userLocation, searchRadiusKm]);

  return null;
};

const Map = ({ 
  shelters = [], 
  requests = [], 
  userRole, 
  onMarkerClick,
  center = [31.7683, 35.2137], // Default to Jerusalem
  zoom = 8,
  userLocation,
  searchRadiusKm
}) => {
  const mapRef = useRef();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateRange = (from, to) => {
    const fromDate = formatDate(from);
    const toDate = to ? formatDate(to) : 'Ongoing';
    return `${fromDate} - ${toDate}`;
  };

  const renderShelterMarkers = () => {
    return shelters.map((shelter) => (
      <Marker
        key={shelter.id}
        position={[shelter.latitude, shelter.longitude]}
        icon={shelterIcon}
        eventHandlers={{
          click: () => onMarkerClick && onMarkerClick(shelter, 'shelter')
        }}
      >
        <Popup>
          <div className="p-2">
            <h3 className="font-bold text-lg text-green-700">{shelter.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{shelter.locationInput}</p>
            <p className="text-sm mb-1">
              <span className="font-medium">Available:</span> {formatDateRange(shelter.availableFrom, shelter.availableTo)}
            </p>
            <p className="text-sm mb-1">
              <span className="font-medium">Capacity:</span> {shelter.capacity} people
            </p>
            {shelter.tags && shelter.tags.length > 0 && (
              <div className="mb-2">
                <span className="font-medium text-sm">Tags:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {shelter.tags.map((tag, index) => (
                    <span key={`${shelter.id}-${tag}-${index}`} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <p className="text-sm text-gray-700 mt-2">{shelter.description}</p>
            <div className="mt-3 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Host: {shelter.host?.name || 'Unknown'}
              </p>
            </div>
          </div>
        </Popup>
      </Marker>
    ));
  };

  const renderRequestMarkers = () => {
    return requests.map((request) => {
      const markerId = `${request.id}-${request.shelterId || 'no-shelter'}`;
      return (
        <Marker
          key={markerId}
          position={[request.latitude, request.longitude]}
          icon={requestIcon}
          eventHandlers={{
            click: () => onMarkerClick && onMarkerClick({
              ...request,
              id: markerId
            }, 'request')
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-lg text-red-700">Shelter Request</h3>
              <p className="text-sm text-gray-600 mb-2">{request.locationInput}</p>
              <p className="text-sm mb-1">
                <span className="font-medium">Date:</span> {formatDate(request.date)}
              </p>
              <p className="text-sm mb-1">
                <span className="font-medium">People:</span> {request.numberOfPeople}
              </p>
              <p className="text-sm text-gray-700 mt-2">{request.description}</p>
              <div className="mt-3 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Seeker: {request.seeker?.name || 'Unknown'}
                </p>
              </div>
            </div>
          </Popup>
        </Marker>
      );
    });
  };

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Update bounds when items change */}
        <MapBoundsUpdater 
          items={[...shelters, ...requests]} 
          userLocation={userLocation}
          searchRadiusKm={searchRadiusKm}
        />
        
        {/* Render markers */}
        {renderShelterMarkers()}
        {renderRequestMarkers()}
        {/* User location marker and search radius */}
        {userLocation && (
          <>
            <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
              <Popup>Your Location</Popup>
            </Marker>
            {searchRadiusKm && (
              <Circle
                center={[userLocation.latitude, userLocation.longitude]}
                radius={searchRadiusKm * 1000}
                pathOptions={{ color: '#2563eb', weight: 1, fillOpacity: 0 }}
              />
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default Map; 