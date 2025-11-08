import express from 'express';
import { toggleActionItem, deleteActionItem } from '../controllers/actionItemsController.js';

const router = express.Router();

router.post('/toggle', toggleActionItem);
router.post('/delete', deleteActionItem);

export default router;
