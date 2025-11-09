import express from 'express';
import * as insightsController from '../controllers/insightsController.js';

const router = express.Router();

// Get articles (with optional category filter)
router.get('/', insightsController.getArticles);

// Generate personalized articles using AI
router.post('/generate', insightsController.generateArticles);

export default router;
