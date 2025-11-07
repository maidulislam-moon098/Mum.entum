import { Router } from 'express';
import { chatWithAssistant } from '../controllers/chatController.js';

const router = Router();

router.post('/', chatWithAssistant);

export default router;
