import express from 'express';
import { register, login, getCurrentUser } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me - Get current user (protected route)
router.get('/me', verifyToken, getCurrentUser);

export default router; 