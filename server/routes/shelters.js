import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import {
  createShelter,
  getAllShelters,
  getShelterById,
  updateShelter,
  deleteShelter,
  getSheltersByHost
} from '../controllers/shelterController.js';

const router = express.Router();

// Public routes
router.get('/', getAllShelters);
router.get('/:id', getShelterById);

// Protected routes (require authentication)
router.post('/', verifyToken, createShelter);
router.put('/:id', verifyToken, updateShelter);
router.delete('/:id', verifyToken, deleteShelter);
router.get('/host/my-shelters', verifyToken, getSheltersByHost);

export default router; 