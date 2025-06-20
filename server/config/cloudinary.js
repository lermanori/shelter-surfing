import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const uploadImage = async (file, folder = 'shelter-surfing') => {
  try {
    // Convert the file buffer to base64
    const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    
    // Upload to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder,
      resource_type: 'auto',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' }, // Limit max dimensions
        { quality: 'auto:good' } // Automatic quality optimization
      ]
    });

    return {
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
};

const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete image');
  }
};

export { uploadImage, deleteImage }; 