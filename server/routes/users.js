import express from 'express';
import { 
  updateProfile, 
  updateUserById,
  getProfile, 
  listUsers, 
  getUserById 
} from '../controllers/userController.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// GET /api/users/profile - Get current user profile
router.get('/profile', verifyToken, getProfile);

// PUT /api/users/profile - Update current user profile
router.put('/profile', verifyToken, updateProfile);

// PUT /api/users/:id - Update specific user (admin or self)
router.put('/:id', verifyToken, updateUserById);

// GET /api/users - List all users (admin only)
router.get('/', verifyToken, requireRole('ADMIN'), listUsers);

// GET /api/users/:id - Get user by ID (public profile view)
router.get('/:id', verifyToken, getUserById);

export default router; 