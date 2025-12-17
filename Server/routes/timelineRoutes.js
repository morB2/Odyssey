import express from 'express';
import { getTimeline, getTimelineMapData, getOnThisDayTrips } from '../controller/timelineController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All timeline routes require authentication
router.use(authMiddleware);

// Get user's timeline (trips, stats, grouped data)
router.get('/:userId', getTimeline);
router.get('/', getTimeline);

// Get map markers for user's trips
router.get('/map/:userId', getTimelineMapData);
router.get('/map', getTimelineMapData);

// Get trips from this day in past years
router.get('/onthisday', getOnThisDayTrips);

export default router;
