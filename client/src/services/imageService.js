const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const uploadProfileImage = async (file, imageNum) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/api/images/profile/${imageNum}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

export const uploadShelterImage = async (shelterId, file, imageNum) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/api/images/shelter/${shelterId}/${imageNum}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading shelter image:', error);
    throw error;
  }
}; 