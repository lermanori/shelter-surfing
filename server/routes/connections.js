import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import {
  sendConnectionRequest,
  getConnectionRequests,
  approveConnection,
  rejectConnection,
  getUserConnections,
  checkConnection,
  getAllConnectionStatuses
} from '../controllers/connectionController.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Send connection request
router.post('/', sendConnectionRequest);

// Get connection requests received by current user
router.get('/requests', getConnectionRequests);

// Get user's approved connections
router.get('/my-connections', getUserConnections);

// Check connection status with another user
router.get('/check/:userId', checkConnection);

// Approve connection request
router.put('/:connectionId/approve', approveConnection);

// Reject connection request
router.put('/:connectionId/reject', rejectConnection);

// Get all connection statuses for the current user
router.get('/status', getAllConnectionStatuses);

export default router; 