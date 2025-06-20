import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import Button from '../components/Button';
import LocationInput from '../components/LocationInput';

const today = new Date();
today.setHours(0, 0, 0, 0);

const requestSchema = yup.object({
  locationInput: yup.string().required('Location is required'),
  date: yup.date()
    .min(today, 'Date must be today or in the future')
    .required('Date is required'),
  numberOfPeople: yup.number().min(1, 'Must be at least 1 person').max(10, 'Cannot exceed 10 people').required('Number of people is required'),
  description: yup.string().min(10, 'Description must be at least 10 characters').required('Description is required'),
}).required();

const RequestFormPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationData, setLocationData] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(requestSchema),
    defaultValues: {
      numberOfPeople: 1,
      date: new Date().toISOString().split('T')[0]
    }
  });

  const handleLocationSelect = (locationInfo) => {
    setLocationData(locationInfo);
    if (locationInfo) {
      setValue('locationInput', locationInfo.locationInput);
    }
  };

  const handleSubmitRequest = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      // Prepare location data for backend
      const requestData = {
        ...data,
        date: new Date(data.date).toISOString()
      };

      // If we have GPS coordinates, include them
      if (locationData?.latitude && locationData?.longitude) {
        requestData.latitude = locationData.latitude;
        requestData.longitude = locationData.longitude;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create request');
      }

      // Redirect to dashboard with success message
      navigate('/dashboard', { 
        state: { message: 'Shelter request submitted successfully!' }
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== 'SEEKER') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            Only seekers can submit shelter requests. Please update your profile to become a seeker.
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Update Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Request Shelter</h1>
          <p className="mt-2 text-gray-600">
            Submit a request for temporary shelter assistance
          </p>
        </div>

        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-6">
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(handleSubmitRequest)} className="space-y-6">
                <InputField
                  label="Description"
                  name="description"
                  type="textarea"
                  placeholder="Describe your situation and what you need..."
                  {...register('description')}
                  error={errors.description?.message}
                  disabled={isLoading}
                  required
                />
                
                {/* Location Input with GPS and Israeli locations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <LocationInput
                    value={watch('locationInput')}
                    onChange={(value) => setValue('locationInput', value)}
                    onLocationSelect={handleLocationSelect}
                    placeholder="Enter your current location or use GPS to get your location"
                    disabled={isLoading}
                    required
                  />
                  {errors.locationInput && (
                    <p className="mt-1 text-sm text-red-600">{errors.locationInput.message}</p>
                  )}
                </div>

                <InputField
                  label="Date Needed"
                  name="date"
                  type="date"
                  {...register('date')}
                  error={errors.date?.message}
                  disabled={isLoading}
                  required
                />
                <SelectField
                  label="Number of People"
                  name="numberOfPeople"
                  value={watch('numberOfPeople')}
                  onChange={e => setValue('numberOfPeople', parseInt(e.target.value))}
                  options={[
                    { value: 1, label: '1 person' },
                    { value: 2, label: '2 people' },
                    { value: 3, label: '3 people' },
                    { value: 4, label: '4 people' },
                    { value: 5, label: '5 people' },
                    { value: 6, label: '6 people' },
                    { value: 7, label: '7 people' },
                    { value: 8, label: '8 people' },
                    { value: 9, label: '9 people' },
                    { value: 10, label: '10 people' }
                  ]}
                  error={errors.numberOfPeople?.message}
                  disabled={isLoading}
                  required
                />
                
                {/* Important Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Important Information</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Your request will be visible to hosts in your area</li>
                    <li>• Hosts may contact you directly to offer assistance</li>
                    <li>• Please be honest about your situation and needs</li>
                    <li>• You can update or cancel your request at any time</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={isLoading}
                    variant="primary"
                  >
                    Submit Request
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestFormPage; 