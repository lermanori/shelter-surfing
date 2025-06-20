import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ShelterForm from '../components/ShelterForm';

const ShelterEditPage = () => {
  const { shelterId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [shelter, setShelter] = useState(null);

  useEffect(() => {
    fetchShelter();
  }, [shelterId]);

  const fetchShelter = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/shelters/${shelterId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shelter');
      }

      const data = await response.json();
      const shelterData = data.shelter;
      
      setShelter(shelterData);
    } catch (error) {
      setError('Failed to load shelter details');
      console.error('Error fetching shelter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/shelters/${shelterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity),
          availableFrom: formData.availableFrom ? new Date(formData.availableFrom).toISOString() : null,
          availableTo: formData.availableTo ? new Date(formData.availableTo).toISOString() : null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update shelter');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shelter details...</p>
        </div>
      </div>
    );
  }

  if (!shelter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Shelter not found</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Edit Shelter</h1>
            <p className="mt-1 text-sm text-gray-600">
              Update your shelter offering details
            </p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <ShelterForm
              initialData={shelter}
              onSubmit={handleSubmit}
              isEditing={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShelterEditPage; 