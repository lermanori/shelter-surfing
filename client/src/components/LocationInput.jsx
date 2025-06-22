import { useState, useEffect, useRef } from 'react';
import { useGPSLocation } from '../hooks/useGPSLocation';
import { searchIsraeliLocations, getLocationByName } from '../data/israeliLocations';

const LocationInput = ({ 
  value, 
  onChange, 
  onLocationSelect, 
  placeholder = "Enter location or use GPS",
  className = "",
  required = false,
  disabled = false,
  showGPSButton = true,
  showAutocomplete = true
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [gpsAddress, setGpsAddress] = useState('');
  
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  const {
    location: gpsLocation,
    error: gpsError,
    isLoading: gpsLoading,
    permissionStatus,
    isSupported,
    getLocationWithAddress,
    clearLocation
  } = useGPSLocation();

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Handle GPS location changes
  useEffect(() => {
    if (gpsLocation) {
      // The new hook now returns the address directly
      setGpsAddress(gpsLocation.address);
      setInputValue(gpsLocation.address);
      if (onChange) onChange(gpsLocation.address);
      if (onLocationSelect) {
        onLocationSelect({
          locationInput: gpsLocation.address,
          latitude: gpsLocation.latitude,
          longitude: gpsLocation.longitude,
          source: 'gps'
        });
      }
    }
  }, [gpsLocation]);

  // Handle input changes
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);
    
    if (onChange) onChange(newValue);
    
    // Show suggestions if autocomplete is enabled
    if (showAutocomplete && newValue.length > 0) {
      const results = searchIsraeliLocations(newValue);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    const displayName = suggestion.english || suggestion.name;
    setInputValue(displayName);
    setShowSuggestions(false);
    setSuggestions([]);
    
    if (onChange) onChange(displayName);
    if (onLocationSelect) {
      onLocationSelect({
        locationInput: displayName,
        latitude: null, // Will be geocoded by backend
        longitude: null,
        source: 'autocomplete',
        locationData: suggestion
      });
    }
  };

  // Handle GPS button click
  const handleGPSClick = async () => {
    if (gpsLoading) return;
    
    if (gpsLocation) {
      // Clear GPS location
      clearLocation();
      setGpsAddress('');
      setInputValue('');
      if (onChange) onChange('');
      if (onLocationSelect) onLocationSelect(null);
    } else {
      // Get GPS location and address
      try {
        await getLocationWithAddress();
        // The useEffect hook above will handle the result
      } catch (error) {
        console.error("Error getting GPS location with address:", error);
        // The hook will set its own error state, which can be displayed to the user
      }
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get GPS button text and icon
  const getGPSButtonContent = () => {
    if (gpsLoading) {
      return (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span className="ml-2">Getting location...</span>
        </>
      );
    }
    
    if (gpsLocation) {
      return (
        <>
          <span>📍</span>
          <span className="ml-2">Clear GPS</span>
        </>
      );
    }
    
    return (
      <>
        <span>📍</span>
        <span className="ml-2">Use GPS</span>
      </>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        />
        
        {showGPSButton && (
          <button
            type="button"
            onClick={handleGPSClick}
            disabled={disabled || gpsLoading || !isSupported}
            className={`px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              disabled || gpsLoading || !isSupported ? 'opacity-50 cursor-not-allowed' : ''
            } ${gpsLocation ? 'bg-green-600 hover:bg-green-700' : ''}`}
            title={
              !isSupported 
                ? 'GPS not supported in this browser' 
                : gpsLocation 
                  ? 'Clear GPS location' 
                  : 'Get current location'
            }
          >
            {getGPSButtonContent()}
          </button>
        )}
      </div>

      {/* GPS Error Message */}
      {gpsError && (
        <div className="mt-1 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            {gpsError}
          </div>
        </div>
      )}

      {/* GPS Success Message */}
      {gpsLocation && !gpsError && (
        <div className="mt-1 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-2">
          <div className="flex items-center">
            <span className="mr-2">✅</span>
            Location obtained: {gpsAddress || `${gpsLocation.latitude.toFixed(6)}, ${gpsLocation.longitude.toFixed(6)}`}
          </div>
        </div>
      )}

      {/* Autocomplete Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.name}-${index}`}
              type="button"
              onClick={() => handleSuggestionSelect(suggestion)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                index === selectedIndex ? 'bg-blue-50 text-blue-900' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {suggestion.english || suggestion.name}
                  </div>
                  {suggestion.english && suggestion.name !== suggestion.english && (
                    <div className="text-sm text-gray-500">
                      {suggestion.name}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400 capitalize">
                  {suggestion.type}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Permission Status Info */}
      {permissionStatus === 'denied' && (
        <div className="mt-1 text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-md p-2">
          <div className="flex items-center">
            <span className="mr-2">🔒</span>
            Location access denied. Please enable location permissions in your browser settings.
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationInput; 