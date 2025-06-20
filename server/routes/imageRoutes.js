import express from 'express';
import multer from 'multer';
import { uploadImage, deleteImage } from '../config/cloudinary.js';
import { verifyToken } from '../middlewares/auth.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload profile image
router.post('/profile/:imageNum', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { imageNum } = req.params; // 1 or 2
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Upload to Cloudinary
    const { url } = await uploadImage(req.file, 'shelter-surfing/profiles');

    // Update user profile in database
    const updateData = {};
    updateData[`profileImage${imageNum}`] = url;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    res.json({ url });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Upload shelter image
router.post('/shelter/:shelterId/:imageNum', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { shelterId, imageNum } = req.params; // imageNum is 1 or 2
    const userId = req.user.id;

    // Verify shelter ownership
    const shelter = await prisma.shelter.findUnique({
      where: { id: shelterId }
    });

    if (!shelter || shelter.hostId !== userId) {
      return res.status(403).json({ error: 'Not authorized to modify this shelter' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Upload to Cloudinary
    const { url } = await uploadImage(req.file, 'shelter-surfing/shelters');

    // Update shelter in database
    const updateData = {};
    updateData[`image${imageNum}`] = url;

    await prisma.shelter.update({
      where: { id: shelterId },
      data: updateData
    });

    res.json({ url });
  } catch (error) {
    console.error('Error uploading shelter image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router; 