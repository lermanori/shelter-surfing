import { useState } from 'react';

const ImageUpload = ({ 
  onImageSelect, 
  currentImage, 
  label = 'Upload Image',
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(currentImage);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset states
    setError('');
    setIsLoading(true);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      setIsLoading(false);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      setIsLoading(false);
      return;
    }

    try {
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Create FormData
      const formData = new FormData();
      formData.append('image', file);

      // Call the parent's onImageSelect function
      await onImageSelect(file);
    } catch (err) {
      setError('Failed to upload image');
      console.error('Image upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {/* Image Preview */}
      {preview && (
        <div className="relative w-32 h-32 mb-4">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg"
          />
          <button
            onClick={() => {
              setPreview('');
              onImageSelect(null);
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isLoading}
          />
        </label>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Uploading...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default ImageUpload; 