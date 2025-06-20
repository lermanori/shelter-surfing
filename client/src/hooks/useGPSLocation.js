import { useState, useEffect } from 'react';

export const useGPSLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('unknown');

  // Check if geolocation is supported
  const isSupported = 'geolocation' in navigator;

  // Request location permission and get current position
  const getCurrentLocation = () => {
    if (!isSupported) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setIsLoading(false);
        setPermissionStatus('granted');
      },
      (error) => {
        setIsLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionStatus('denied');
        }
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location permission denied. Please enable location access in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable. Please try again.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out. Please try again.');
            break;
          default:
            setError('An unknown error occurred while getting your location.');
        }
      },
      options
    );
  };

  // Check permission status
  const checkPermission = async () => {
    if (!isSupported) {
      setPermissionStatus('unsupported');
      return;
    }

    try {
      // For browsers that support the Permissions API
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(permission.state);
        
        permission.onchange = () => {
          setPermissionStatus(permission.state);
        };
      } else {
        // Fallback for browsers that don't support Permissions API
        setPermissionStatus('unknown');
      }
    } catch (err) {
      setPermissionStatus('unknown');
    }
  };

  // Request permission explicitly
  const requestPermission = () => {
    if (!isSupported) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    // Try to get location which will trigger permission request
    getCurrentLocation();
  };

  // Clear location data
  const clearLocation = () => {
    setLocation(null);
    setError(null);
  };

  // Get location with reverse geocoding (optional)
  const getLocationWithAddress = async () => {
    if (!location) {
      setError('No location available. Please get your location first.');
      return;
    }

    try {
      // You can integrate with a reverse geocoding service here
      // For now, we'll return the coordinates
      return {
        ...location,
        address: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
      };
    } catch (err) {
      setError('Failed to get address for location');
      return location;
    }
  };

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, []);

  return {
    location,
    error,
    isLoading,
    permissionStatus,
    isSupported,
    getCurrentLocation,
    requestPermission,
    clearLocation,
    getLocationWithAddress,
    checkPermission
  };
}; 