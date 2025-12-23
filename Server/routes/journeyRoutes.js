import express from 'express';
import { getJourneyMapData } from '../controller/journeyController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All journey routes require authentication
router.use(authMiddleware);

// Get map markers for user's trips
router.get('/map/:userId', getJourneyMapData);
router.get('/map', getJourneyMapData);

export default router;
