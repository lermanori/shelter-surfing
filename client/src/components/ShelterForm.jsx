import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationInput from './LocationInput';
import ImageUpload from './ImageUpload';
import { uploadShelterImage } from '../services/imageService';

const ShelterForm = ({ initialData, onSubmit, isEditing = false }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    locationInput: initialData?.locationInput || '',
    latitude: initialData?.latitude || null,
    longitude: initialData?.longitude || null,
    availableFrom: initialData?.availableFrom ? new Date(initialData.availableFrom).toISOString().split('T')[0] : '',
    availableTo: initialData?.availableTo ? new Date(initialData.availableTo).toISOString().split('T')[0] : '',
    capacity: initialData?.capacity || '',
    tags: initialData?.tags || [],
  });

  const handleLocationSelect = (location) => {
    if (location) {
      setFormData(prev => ({
        ...prev,
        locationInput: location.address || location.locationInput,
        latitude: location.latitude,
        longitude: location.longitude
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        locationInput: '',
        latitude: null,
        longitude: null
      }));
    }
  };

  const handleImageUpload = async (file, imageNum) => {
    try {
      if (!initialData?.id) {
        // Store the file to be uploaded after shelter creation
        setFormData(prev => ({
          ...prev,
          [`pendingImage${imageNum}`]: file
        }));
        return;
      }

      const { url } = await uploadShelterImage(initialData.id, file, imageNum);
      // Update local state
      setFormData(prev => ({
        ...prev,
        [`image${imageNum}`]: url
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await onSubmit(formData);

      // If this is a new shelter and we have pending images, upload them
      if (!isEditing && result?.id) {
        if (formData.pendingImage1) {
          await uploadShelterImage(result.id, formData.pendingImage1, 1);
        }
        if (formData.pendingImage2) {
          await uploadShelterImage(result.id, formData.pendingImage2, 2);
        }
      }

      navigate('/dashboard');
    } catch (err) {
      setError('Failed to save shelter');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const availableTags = [
    'pet-friendly',
    'wheelchair-accessible',
    'family-friendly',
    'quiet-area',
    'near-transport',
    'wifi-included',
    'private-bathroom',
    'kitchen-access'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Images */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <ImageUpload
            label="Shelter Image 1"
            currentImage={initialData?.image1}
            onImageSelect={(file) => handleImageUpload(file, 1)}
          />
        </div>
        <div>
          <ImageUpload
            label="Shelter Image 2"
            currentImage={initialData?.image2}
            onImageSelect={(file) => handleImageUpload(file, 2)}
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <LocationInput
          defaultValue={formData.locationInput}
          onLocationSelect={handleLocationSelect}
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Available From</label>
          <input
            type="date"
            value={formData.availableFrom}
            onChange={(e) => setFormData(prev => ({ ...prev, availableFrom: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Available To (Optional)</label>
          <input
            type="date"
            value={formData.availableTo}
            onChange={(e) => setFormData(prev => ({ ...prev, availableTo: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Capacity */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Capacity (number of people)</label>
        <input
          type="number"
          value={formData.capacity}
          onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
          min="1"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
        <div className="grid grid-cols-2 gap-2">
          {availableTags.map(tag => (
            <label key={tag} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.tags.includes(tag)}
                onChange={() => handleTagToggle(tag)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{tag}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {isLoading ? 'Saving...' : (isEditing ? 'Update Shelter' : 'Create Shelter')}
        </button>
      </div>
    </form>
  );
};

export default ShelterForm; 