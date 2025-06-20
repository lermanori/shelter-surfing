import express from 'express';
import { 
  getMatches, 
  getMatchesForRequest, 
  getRequestsForShelter,
  getHostMatches
} from '../controllers/matchingController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

// GET /api/matches - Get all matches for current user's requests (SEEKER)
router.get('/', verifyToken, getMatches);

// GET /api/matches/host - Get matching requests for host's shelters (HOST)
router.get('/host', verifyToken, getHostMatches);

// GET /api/matches/request/:requestId - Get matches for a specific request
router.get('/request/:requestId', verifyToken, getMatchesForRequest);

// GET /api/matches/shelter/:shelterId - Get requests that match a specific shelter
router.get('/shelter/:shelterId', verifyToken, getRequestsForShelter);

export default router; 