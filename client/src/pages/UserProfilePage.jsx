import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      setError('Failed to load user profile');
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'User not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-700"
          >
            ← Go Back
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name}'s Profile</h1>
              <p className="mt-2 text-gray-600">
                {user.role === 'HOST' ? 'Shelter Host' : 'Shelter Seeker'}
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Go Back
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            {/* Profile Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                {/* Profile Images */}
                <div className="flex space-x-4">
                  {user.profileImage1 && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden">
                      <img
                        src={user.profileImage1}
                        alt={`${user.name} - Profile 1`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {user.profileImage2 && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden">
                      <img
                        src={user.profileImage2}
                        alt={`${user.name} - Profile 2`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {!user.profileImage1 && !user.profileImage2 && (
                    <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                  <p className="text-gray-600">{user.email}</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                    user.role === 'HOST' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-6 space-y-6">
              {/* Account Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                    <p className="text-gray-900">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                    <p className="text-gray-900">{user.locationInput || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Member Since</label>
                    <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                    <p className="text-gray-900">{formatDate(user.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Role-specific Information */}
              {user.role === 'HOST' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Host Information</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-blue-800">
                      This user is a shelter host who can offer temporary accommodation to people in need.
                    </p>
                  </div>
                </div>
              )}

              {user.role === 'SEEKER' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Seeker Information</h3>
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <p className="text-green-800">
                      This user is a shelter seeker who may need temporary accommodation.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage; 