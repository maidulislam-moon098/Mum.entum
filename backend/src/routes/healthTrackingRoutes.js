import express from 'express';
import * as healthTrackingController from '../controllers/healthTrackingController.js';

const router = express.Router();

// Save or update daily health data
router.post('/', healthTrackingController.saveHealthData);

// Get latest health data (today's data)
router.get('/latest', healthTrackingController.getLatestHealthData);

// Get health history
router.get('/history', healthTrackingController.getHealthHistory);

export default router;
