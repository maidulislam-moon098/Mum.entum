import {
  savePushSubscription,
  removePushSubscription,
  sendPushNotification,
  generateCheckInNotification,
  getUserNotifications,
  markNotificationAsRead,
  scheduleSmartCheckIns
} from '../services/notificationService.js';

/**
 * Subscribe to push notifications
 */
export async function subscribe(req, res) {
  try {
    const { subscription } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!subscription) {
      return res.status(400).json({ error: 'Subscription data required' });
    }

    await savePushSubscription(userId, subscription);

    res.json({ 
      success: true, 
      message: 'Successfully subscribed to notifications' 
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Failed to subscribe to notifications' });
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribe(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await removePushSubscription(userId);

    res.json({ 
      success: true, 
      message: 'Successfully unsubscribed from notifications' 
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe from notifications' });
  }
}

/**
 * Send a test notification
 */
export async function sendTestNotification(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const notification = {
      title: '🌸 Mum.entum',
      body: 'Test notification - you\'re all set up!',
      category: 'test',
      priority: 'low',
      data: {
        url: '/dashboard',
        test: true
      }
    };

    await sendPushNotification(userId, notification);

    res.json({ 
      success: true, 
      message: 'Test notification sent' 
    });
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
}

/**
 * Get notification history
 */
export async function getNotifications(req, res) {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit) || 20;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const notifications = await getUserNotifications(userId, limit);

    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(req, res) {
  try {
    const { notificationId } = req.params;

    if (!notificationId) {
      return res.status(400).json({ error: 'Notification ID required' });
    }

    await markNotificationAsRead(notificationId);

    res.json({ 
      success: true, 
      message: 'Notification marked as read' 
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
}

/**
 * Get VAPID public key for client
 */
export async function getVapidPublicKey(req, res) {
  try {
    const publicKey = process.env.VAPID_PUBLIC_KEY;

    if (!publicKey) {
      return res.status(500).json({ error: 'VAPID keys not configured' });
    }

    res.json({ publicKey });
  } catch (error) {
    console.error('Get VAPID key error:', error);
    res.status(500).json({ error: 'Failed to get VAPID public key' });
  }
}

/**
 * Trigger smart check-in (can be called by cron job or manually)
 */
export async function triggerCheckIn(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await scheduleSmartCheckIns(userId);

    res.json({ 
      success: true, 
      message: 'Check-in notification sent' 
    });
  } catch (error) {
    console.error('Trigger check-in error:', error);
    res.status(500).json({ error: 'Failed to trigger check-in' });
  }
}
