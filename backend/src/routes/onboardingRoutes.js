import { Router } from 'express';
import {
  getQuestionTemplate,
  getNextQuestion,
  submitAnswer,
  skipQuestion
} from '../controllers/onboardingController.js';

const router = Router();

router.get('/questions', getQuestionTemplate);
router.get('/next', getNextQuestion);
router.post('/respond', submitAnswer);
router.post('/skip', skipQuestion);

export default router;
