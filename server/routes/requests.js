import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import {
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  getRequestsBySeeker
} from '../controllers/requestController.js';

const router = express.Router();

// Public routes
router.get('/', getAllRequests);
router.get('/:id', getRequestById);

// Protected routes (require authentication)
router.post('/', verifyToken, createRequest);
router.put('/:id', verifyToken, updateRequest);
router.delete('/:id', verifyToken, deleteRequest);
router.get('/seeker/my-requests', verifyToken, getRequestsBySeeker);

export default router; 