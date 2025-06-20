// Haversine distance calculation utility
// Calculates the distance between two points on Earth using their latitude and longitude

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

/**
 * Calculate the distance between two points on Earth using the Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  
  return distance;
};

/**
 * Filter shelters by distance from a given location
 * @param {Array} shelters - Array of shelter objects with latitude and longitude
 * @param {number} requestLat - Latitude of the request location
 * @param {number} requestLon - Longitude of the request location
 * @param {number} maxDistance - Maximum distance in kilometers (default: 50km)
 * @returns {Array} Filtered shelters within the specified distance
 */
export const filterSheltersByDistance = (shelters, requestLat, requestLon, maxDistance = 50) => {
  const maxDistanceInt = parseInt(maxDistance);
  
  return shelters.filter(shelter => {
    if (!shelter.latitude || !shelter.longitude) {
      return false; // Skip shelters without coordinates
    }
    
    const distance = haversineDistance(
      requestLat,
      requestLon,
      shelter.latitude,
      shelter.longitude
    );
    
    return distance <= maxDistanceInt;
  }).map(shelter => {
    const distance = haversineDistance(
      requestLat,
      requestLon,
      shelter.latitude,
      shelter.longitude
    );
    
    return {
      ...shelter,
      distance: Math.round(distance * 10) / 10 // Round to 1 decimal place
    };
  }).sort((a, b) => a.distance - b.distance); // Sort by distance (closest first)
}; 