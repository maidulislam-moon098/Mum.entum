import express from 'express';
import {
  subscribe,
  unsubscribe,
  sendTestNotification,
  getNotifications,
  markAsRead,
  getVapidPublicKey,
  triggerCheckIn
} from '../controllers/notificationController.js';

const router = express.Router();

// Get VAPID public key
router.get('/vapid-public-key', getVapidPublicKey);

// Subscribe to push notifications
router.post('/subscribe', subscribe);

// Unsubscribe from push notifications
router.post('/unsubscribe', unsubscribe);

// Send test notification
router.post('/test', sendTestNotification);

// Get notification history
router.get('/history', getNotifications);

// Mark notification as read
router.patch('/:notificationId/read', markAsRead);

// Trigger smart check-in
router.post('/check-in', triggerCheckIn);

export default router;
