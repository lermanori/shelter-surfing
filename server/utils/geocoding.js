// Enhanced geocoding utility with multiple API support
// Supports Google Maps, Mapbox, OpenCage, and Nominatim with fallbacks

/**
 * Geocode an address using multiple APIs with fallback
 * @param {string} address - The address to geocode
 * @param {number|null} latitude - GPS latitude (if available)
 * @param {number|null} longitude - GPS longitude (if available)
 * @param {string} preferredApi - Preferred API ('google', 'mapbox', 'opencage', 'nominatim')
 * @returns {Promise<{lat: number, lng: number, source: string}>}
 */
export const geocodeAddress = async (address, latitude = null, longitude = null, preferredApi = 'nominatim') => {
  // If GPS coordinates are provided, use them
  if (latitude !== null && longitude !== null) {
    console.log(`Using GPS coordinates: ${latitude}, ${longitude}`);
    return { 
      lat: parseFloat(latitude), 
      lng: parseFloat(longitude),
      source: 'gps'
    };
  }

  // Try preferred API first, then fallback to others
  const apis = [preferredApi, 'nominatim', 'opencage', 'mapbox', 'google'];
  
  for (const api of apis) {
    try {
      const result = await geocodeWithApi(address, api);
      if (result) {
        console.log(`Geocoded "${address}" using ${api}: ${result.lat}, ${result.lng}`);
        return { ...result, source: api };
      }
    } catch (error) {
      console.warn(`Failed to geocode with ${api}:`, error.message);
      continue;
    }
  }

  // Fallback to Israeli cities database
  console.log(`All APIs failed, using Israeli cities fallback for: ${address}`);
  return geocodeWithIsraeliCities(address);
};

/**
 * Geocode using a specific API
 */
const geocodeWithApi = async (address, api) => {
  switch (api) {
    case 'google':
      return await geocodeWithGoogle(address);
    case 'mapbox':
      return await geocodeWithMapbox(address);
    case 'opencage':
      return await geocodeWithOpenCage(address);
    case 'nominatim':
      return await geocodeWithNominatim(address);
    default:
      throw new Error(`Unknown API: ${api}`);
  }
};

/**
 * Google Maps Geocoding API
 */
const geocodeWithGoogle = async (address) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&region=il`
  );
  
  if (!response.ok) {
    throw new Error(`Google API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.status !== 'OK' || !data.results.length) {
    throw new Error(`Google API returned: ${data.status}`);
  }

  const location = data.results[0].geometry.location;
  return {
    lat: location.lat,
    lng: location.lng
  };
};

/**
 * Mapbox Geocoding API
 */
const geocodeWithMapbox = async (address) => {
  const apiKey = process.env.MAPBOX_API_KEY;
  if (!apiKey) {
    throw new Error('Mapbox API key not configured');
  }

  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${apiKey}&country=il&types=place,address`
  );
  
  if (!response.ok) {
    throw new Error(`Mapbox API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.features.length) {
    throw new Error('Mapbox API returned no results');
  }

  const [lng, lat] = data.features[0].center;
  return { lat, lng };
};

/**
 * OpenCage Geocoding API
 */
const geocodeWithOpenCage = async (address) => {
  const apiKey = process.env.OPENCAGE_API_KEY;
  if (!apiKey) {
    throw new Error('OpenCage API key not configured');
  }

  const response = await fetch(
    `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&countrycode=il&key=${apiKey}&limit=1`
  );
  
  if (!response.ok) {
    throw new Error(`OpenCage API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.results.length) {
    throw new Error('OpenCage API returned no results');
  }

  const result = data.results[0];
  return {
    lat: result.geometry.lat,
    lng: result.geometry.lng
  };
};

/**
 * Nominatim (OpenStreetMap) - Free API
 */
const geocodeWithNominatim = async (address) => {
  // Add delay to respect rate limit (1 request per second)
  await new Promise(resolve => setTimeout(resolve, 1000));

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&countrycodes=il&format=json&limit=1&addressdetails=1`
  );
  
  if (!response.ok) {
    throw new Error(`Nominatim API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.length) {
    throw new Error('Nominatim API returned no results');
  }

  const result = data[0];
  return {
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon)
  };
};

/**
 * Geocode using Israeli cities database with strict matching
 */
const geocodeWithIsraeliCities = (address) => {
  // Israeli cities coordinates
  const israeliCities = {
    'תל אביב': { lat: 32.0853, lng: 34.7818 },
    'tel aviv': { lat: 32.0853, lng: 34.7818 },
    'jerusalem': { lat: 31.7683, lng: 35.2137 },
    'ירושלים': { lat: 31.7683, lng: 35.2137 },
    'haifa': { lat: 32.7940, lng: 34.9896 },
    'חיפה': { lat: 32.7940, lng: 34.9896 },
    'rishon lezion': { lat: 31.9608, lng: 34.8013 },
    'ראשון לציון': { lat: 31.9608, lng: 34.8013 },
    'petah tikva': { lat: 32.0840, lng: 34.8878 },
    'פתח תקווה': { lat: 32.0840, lng: 34.8878 },
    'ashdod': { lat: 31.8044, lng: 34.6503 },
    'אשדוד': { lat: 31.8044, lng: 34.6503 },
    'netanya': { lat: 32.3328, lng: 34.8600 },
    'נתניה': { lat: 32.3328, lng: 34.8600 },
    'beer sheva': { lat: 31.2518, lng: 34.7913 },
    'באר שבע': { lat: 31.2518, lng: 34.7913 },
    'holon': { lat: 32.0167, lng: 34.7792 },
    'חולון': { lat: 32.0167, lng: 34.7792 }
  };

  const normalizedAddress = address.toLowerCase().trim();
  
  // Try to find an exact match first
  for (const [city, coords] of Object.entries(israeliCities)) {
    if (normalizedAddress === city || normalizedAddress.startsWith(city + ' ') || normalizedAddress.endsWith(' ' + city)) {
      console.log(`Found exact Israeli city match: ${city}`);
      return { lat: coords.lat, lng: coords.lng, source: 'israeli-cities' };
    }
  }

  // If no exact match, try partial match but require city name to be a complete word
  for (const [city, coords] of Object.entries(israeliCities)) {
    const cityWords = city.split(' ');
    const addressWords = normalizedAddress.split(' ');
    
    if (cityWords.some(word => addressWords.includes(word))) {
      console.log(`Found partial Israeli city match: ${city}`);
      return { lat: coords.lat, lng: coords.lng, source: 'israeli-cities' };
    }
  }

  // If no match found, return default coordinates (Tel Aviv)
  console.log(`No Israeli city match found for: ${address}, using default coordinates`);
  return { lat: 32.0853, lng: 34.7818, source: 'default' };
};

/**
 * Reverse geocoding - convert coordinates to address
 */
export const reverseGeocode = async (latitude, longitude, api = 'nominatim') => {
  try {
    switch (api) {
      case 'nominatim':
        return await reverseGeocodeWithNominatim(latitude, longitude);
      case 'google':
        return await reverseGeocodeWithGoogle(latitude, longitude);
      default:
        throw new Error(`Reverse geocoding not supported for API: ${api}`);
    }
  } catch (error) {
    console.warn(`Reverse geocoding failed:`, error.message);
    return null;
  }
};

const reverseGeocodeWithNominatim = async (latitude, longitude) => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
  );
  
  if (!response.ok) {
    throw new Error(`Nominatim reverse geocoding error: ${response.status}`);
  }

  const data = await response.json();
  return data.display_name;
};

const reverseGeocodeWithGoogle = async (latitude, longitude) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
  );
  
  if (!response.ok) {
    throw new Error(`Google reverse geocoding error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.status !== 'OK' || !data.results.length) {
    throw new Error(`Google API returned: ${data.status}`);
  }

  return data.results[0].formatted_address;
}; 