import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import Button from '../components/Button';
import LocationInput from '../components/LocationInput';

const RequestEditPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [request, setRequest] = useState(null);

  const [formData, setFormData] = useState({
    description: '',
    locationInput: '',
    latitude: null,
    longitude: null,
    date: '',
    numberOfPeople: '',
    status: 'PENDING'
  });

  useEffect(() => {
    fetchRequest();
  }, [requestId]);

  const fetchRequest = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/requests/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch request');
      }

      const data = await response.json();
      const requestData = data.request;
      
      setRequest(requestData);
      setFormData({
        description: requestData.description || '',
        locationInput: requestData.locationInput || '',
        latitude: requestData.latitude || null,
        longitude: requestData.longitude || null,
        date: requestData.date ? requestData.date.split('T')[0] : '',
        numberOfPeople: requestData.numberOfPeople?.toString() || '',
        status: requestData.status || 'PENDING'
      });
    } catch (error) {
      setError('Failed to load request details');
      console.error('Error fetching request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (locationData) => {
    setFormData(prev => ({
      ...prev,
      locationInput: locationData.input,
      latitude: locationData.latitude,
      longitude: locationData.longitude
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          numberOfPeople: parseInt(formData.numberOfPeople),
          date: new Date(formData.date).toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update request');
      }

      navigate('/dashboard', { 
        state: { message: 'Request updated successfully!' }
      });
    } catch (error) {
      setError(error.message);
      console.error('Error updating request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Request not found</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Edit Request</h1>
            <p className="mt-1 text-sm text-gray-600">
              Update your shelter request details
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your situation and any specific needs..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={4}
                required
              />
            </div>

            <LocationInput
              label="Preferred Location"
              value={formData.locationInput}
              onChange={handleLocationChange}
              placeholder="Enter preferred location or use GPS"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Date Needed"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />

              <InputField
                label="Number of People"
                type="number"
                value={formData.numberOfPeople}
                onChange={(e) => handleInputChange('numberOfPeople', e.target.value)}
                placeholder="1"
                min="1"
                max="20"
                required
              />
            </div>

            <SelectField
              label="Status"
              value={formData.status}
              onChange={(value) => handleInputChange('status', value)}
              options={[
                { value: 'PENDING', label: 'Pending' },
                { value: 'COMPLETED', label: 'Completed' }
              ]}
              required
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="flex-1"
              >
                Update Request
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestEditPage; 