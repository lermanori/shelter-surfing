import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import Button from '../components/Button';
import LocationInput from '../components/LocationInput';
import ImageUpload from '../components/ImageUpload';
import { uploadProfileImage } from '../services/imageService';
import SocialMediaInput from '../components/SocialMediaInput';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const profileSchema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  locationInput: yup.string().required('Location is required'),
  role: yup.string().oneOf(['HOST', 'SEEKER'], 'Please select a valid role').required('Role is required'),
}).required();

const socialFields = [
  { name: 'facebook', label: 'Facebook', icon: '📘', placeholder: 'Facebook profile URL' },
  { name: 'instagram', label: 'Instagram', icon: '📸', placeholder: 'Instagram profile URL' },
  { name: 'twitter', label: 'Twitter/X', icon: '🐦', placeholder: 'Twitter/X profile URL' },
  { name: 'linkedin', label: 'LinkedIn', icon: '💼', placeholder: 'LinkedIn profile URL' },
  { name: 'whatsapp', label: 'WhatsApp', icon: '💬', placeholder: 'WhatsApp number' },
  { name: 'telegram', label: 'Telegram', icon: '✈️', placeholder: 'Telegram username' },
  { name: 'website', label: 'Website', icon: '🌐', placeholder: 'Personal website URL' },
];

const ProfilePage = () => {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [locationData, setLocationData] = useState(null);
  const [socialLinks, setSocialLinks] = useState({
    facebook: user?.facebook || '',
    instagram: user?.instagram || '',
    twitter: user?.twitter || '',
    linkedin: user?.linkedin || '',
    whatsapp: user?.whatsapp || '',
    telegram: user?.telegram || '',
    website: user?.website || '',
  });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    locationInput: user?.locationInput || '',
    role: user?.role || 'SEEKER',
    latitude: user?.latitude || null,
    longitude: user?.longitude || null,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      locationInput: user?.locationInput || '',
      role: user?.role || 'SEEKER'
    }
  });

  const selectedRole = watch('role');

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        locationInput: user.locationInput || '',
        role: user.role
      });
      setSocialLinks({
        facebook: user?.facebook || '',
        instagram: user?.instagram || '',
        twitter: user?.twitter || '',
        linkedin: user?.linkedin || '',
        whatsapp: user?.whatsapp || '',
        telegram: user?.telegram || '',
        website: user?.website || '',
      });
    }
  }, [user, reset]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLocationSelect = (locationInfo) => {
    setLocationData(locationInfo);
    if (locationInfo) {
      setValue('locationInput', locationInfo.locationInput);
      // If we have GPS coordinates from the location info, store them
      if (locationInfo.source === 'gps' && locationInfo.latitude && locationInfo.longitude) {
        setLocationData({
          latitude: locationInfo.latitude,
          longitude: locationInfo.longitude,
          locationInput: locationInfo.locationInput
        });
      }
    }
  };

  const handleImageUpload = async (file, imageNum) => {
    try {
      const { url } = await uploadProfileImage(file, imageNum);
      // Update local state and context with complete user object
      const updatedUser = {
        ...user,
        [`profileImage${imageNum}`]: url
      };
      updateUser(updatedUser);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
    }
  };

  const handleUpdateProfile = async (formData) => {
    setIsLoading(true);
    setError('');

    try {
      // Prepare location data for backend
      const profileData = {
        name: formData.name,
        email: formData.email,
        locationInput: formData.locationInput,
        role: formData.role,
        ...socialLinks
      };

      // If we have GPS coordinates, include them
      if (locationData?.latitude && locationData?.longitude) {
        profileData.latitude = locationData.latitude;
        profileData.longitude = locationData.longitude;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update the user context with new data
      if (data.user) {
        updateUser(data.user);
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset({
      name: user.name,
      email: user.email,
      locationInput: user.locationInput || '',
      role: user.role
    });
    setSocialLinks({
      facebook: user?.facebook || '',
      instagram: user?.instagram || '',
      twitter: user?.twitter || '',
      linkedin: user?.linkedin || '',
      whatsapp: user?.whatsapp || '',
      telegram: user?.telegram || '',
      website: user?.website || '',
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
    setLocationData(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Wait for user data to be fully loaded
  if (!user.name || !user.email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                Manage your account information and preferences
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base self-start sm:self-auto"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          {/* Profile Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                {(user?.profileImage1 || user?.profileImage2) ? (
                  <div className="flex space-x-2">
                    {user?.profileImage1 && (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden">
                        <img
                          src={user.profileImage1}
                          alt="Profile 1"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {user?.profileImage2 && (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden">
                        <img
                          src={user.profileImage2}
                          alt="Profile 2"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xl sm:text-2xl font-bold text-blue-600">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{user?.name}</h2>
                  <p className="text-sm sm:text-base text-gray-600 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                  user?.role === 'HOST' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user?.role}
                </span>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-4 sm:p-6">
            {isEditing ? (
              <form onSubmit={handleSubmit(handleUpdateProfile)} className="space-y-6">
                {/* Profile Images */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Images</h3>
                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    <ImageUpload
                      label="Profile Image 1"
                      currentImage={user?.profileImage1}
                      onImageSelect={(file) => handleImageUpload(file, 1)}
                    />
                    <ImageUpload
                      label="Profile Image 2"
                      currentImage={user?.profileImage2}
                      onImageSelect={(file) => handleImageUpload(file, 2)}
                    />
                  </div>
                </div>

                <InputField
                  label="Full Name"
                  name="name"
                  type="text"
                  {...register('name')}
                  error={errors.name?.message}
                  disabled={isLoading}
                  required
                />
                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  {...register('email')}
                  error={errors.email?.message}
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
                    placeholder="Enter your location or use GPS to get your current location"
                    disabled={isLoading}
                    required
                  />
                  {errors.locationInput && (
                    <p className="mt-1 text-sm text-red-600">{errors.locationInput.message}</p>
                  )}
                </div>

                <SelectField
                  label="Account Type"
                  name="role"
                  value={watch('role')}
                  onChange={e => setValue('role', e.target.value)}
                  options={[
                    { value: 'SEEKER', label: 'Seeker (I need shelter)' },
                    { value: 'HOST', label: 'Host (I can offer shelter)' }
                  ]}
                  error={errors.role?.message}
                  disabled={isLoading}
                  required
                />
                
                {/* Social Media Links */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media Links</h3>
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-4">
                    {socialFields.map(field => (
                      <SocialMediaInput
                        key={field.name}
                        label={field.label}
                        name={field.name}
                        value={socialLinks[field.name]}
                        onChange={(name, value) => setSocialLinks(prev => ({ ...prev, [name]: value }))}
                        placeholder={field.placeholder}
                        icon={field.icon}
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={isLoading}
                    variant="primary"
                    className="w-full sm:w-auto"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Profile Images Display */}
                {(user?.profileImage1 || user?.profileImage2) && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Images</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {user?.profileImage1 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Profile Image 1</label>
                          <img
                            src={user.profileImage1}
                            alt="Profile 1"
                            className="w-full max-w-32 h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      {user?.profileImage2 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-2">Profile Image 2</label>
                          <img
                            src={user.profileImage2}
                            alt="Profile 2"
                            className="w-full max-w-32 h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Account Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                      <p className="text-gray-900 break-words">{user?.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                      <p className="text-gray-900 break-all">{user?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                      <p className="text-gray-900 break-words">{user?.locationInput || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Account Type</label>
                      <p className="text-gray-900">{user?.role}</p>
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Member Since</label>
                      <p className="text-gray-900">{formatDate(user?.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                      <p className="text-gray-900">{formatDate(user?.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Role-specific Information */}
                {user?.role === 'HOST' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Host Information</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <p className="text-blue-800">
                        As a host, you can offer temporary shelter to people in need. 
                        You'll be able to create shelter listings and manage requests from seekers.
                      </p>
                    </div>
                  </div>
                )}

                {user?.role === 'SEEKER' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Seeker Information</h3>
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <p className="text-green-800">
                        As a seeker, you can browse available shelters and submit requests for help 
                        when you need temporary accommodation.
                      </p>
                    </div>
                  </div>
                )}

                {/* Social Media Links */}
                {(user?.facebook || user?.instagram || user?.twitter || user?.linkedin || user?.whatsapp || user?.telegram || user?.website) && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media</h3>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-start sm:items-center">
                      {user?.facebook && (
                        <a href={user.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline text-sm sm:text-base">
                          <span role="img" aria-label="Facebook">📘</span> Facebook
                        </a>
                      )}
                      {user?.instagram && (
                        <a href={user.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-pink-500 hover:underline text-sm sm:text-base">
                          <span role="img" aria-label="Instagram">📸</span> Instagram
                        </a>
                      )}
                      {user?.twitter && (
                        <a href={user.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-400 hover:underline text-sm sm:text-base">
                          <span role="img" aria-label="Twitter">🐦</span> Twitter/X
                        </a>
                      )}
                      {user?.linkedin && (
                        <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-700 hover:underline text-sm sm:text-base">
                          <span role="img" aria-label="LinkedIn">💼</span> LinkedIn
                        </a>
                      )}
                      {user?.whatsapp && (
                        <a href={`https://wa.me/${user.whatsapp.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-green-600 hover:underline text-sm sm:text-base">
                          <span role="img" aria-label="WhatsApp">💬</span> WhatsApp
                        </a>
                      )}
                      {user?.telegram && (
                        <a href={`https://t.me/${user.telegram.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline text-sm sm:text-base">
                          <span role="img" aria-label="Telegram">✈️</span> Telegram
                        </a>
                      )}
                      {user?.website && (
                        <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-700 hover:underline text-sm sm:text-base">
                          <span role="img" aria-label="Website">🌐</span> Website
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 