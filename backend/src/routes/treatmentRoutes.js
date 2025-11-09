import express from 'express';
import * as treatmentController from '../controllers/treatmentController.js';

const router = express.Router();

// Get all active recommendations for user
router.get('/', treatmentController.getRecommendations);

// Acknowledge a recommendation
router.post('/:id/acknowledge', treatmentController.acknowledgeRecommendation);

// Create a new recommendation (can be called by AI service)
router.post('/', treatmentController.createRecommendation);

export default router;
