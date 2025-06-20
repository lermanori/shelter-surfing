import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ShelterForm from '../components/ShelterForm';

const ShelterFormPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    try {
      const response = await fetch('http://localhost:3000/api/shelters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create shelter');
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  if (user?.role !== 'HOST') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            Only hosts can offer shelters. Please update your profile to become a host.
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
          <h1 className="text-3xl font-bold text-gray-900">Offer Shelter</h1>
          <p className="mt-2 text-gray-600">
            Help someone in need by offering temporary shelter
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

              <ShelterForm
                initialData={{}}
                onSubmit={handleSubmit}
                isEditing={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShelterFormPage; 