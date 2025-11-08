import webpush from 'web-push';
import { supabase } from '../config/supabaseClient.js';

// Generate VAPID keys once and store them securely
// Run: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:support@mumentum.app';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

/**
 * Generate AI-driven check-in notifications based on user context
 */
export async function generateCheckInNotification(userId, context = {}) {
  const { lastCheckIn, babyAge, recentMood, timeOfDay } = context;

  const prompts = [
    {
      condition: () => timeOfDay === 'morning',
      question: "Good morning! How did you and your baby sleep last night?",
      category: 'sleep',
      priority: 'medium'
    },
    {
      condition: () => timeOfDay === 'evening',
      question: "How was your day? Any challenges or wins you'd like to share?",
      category: 'daily_reflection',
      priority: 'medium'
    },
    {
      condition: () => recentMood === 'stressed',
      question: "I noticed you've been stressed. Would you like to talk about what's on your mind?",
      category: 'emotional_support',
      priority: 'high'
    },
    {
      condition: () => babyAge && babyAge <= 3,
      question: "How is feeding going today? Any questions or concerns?",
      category: 'feeding',
      priority: 'medium'
    },
    {
      condition: () => !lastCheckIn || Date.now() - lastCheckIn > 24 * 60 * 60 * 1000,
      question: "We haven't heard from you in a while. How are you doing?",
      category: 'wellness_check',
      priority: 'high'
    }
  ];

  // Find the most relevant prompt
  const relevantPrompt = prompts.find(p => p.condition()) || {
    question: "How are you and your little one doing today?",
    category: 'general',
    priority: 'low'
  };

  return {
    userId,
    title: '🌸 Mum.entum Check-in',
    body: relevantPrompt.question,
    category: relevantPrompt.category,
    priority: relevantPrompt.priority,
    data: {
      url: '/assistant',
      promptId: `checkin_${Date.now()}`,
      question: relevantPrompt.question,
      requiresResponse: true
    }
  };
}

/**
 * Save push subscription for a user
 */
export async function savePushSubscription(userId, subscription) {
  try {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        subscription: subscription,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving push subscription:', error);
    throw error;
  }
}

/**
 * Send push notification to a user
 */
export async function sendPushNotification(userId, notification) {
  try {
    // Get user's push subscription
    const { data: subscriptionData, error: subError } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', userId)
      .single();

    if (subError || !subscriptionData) {
      console.log('No push subscription found for user:', userId);
      return { success: false, reason: 'no_subscription' };
    }

    const subscription = subscriptionData.subscription;

    // Prepare notification payload
    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: notification.data,
      tag: notification.category,
      requireInteraction: notification.priority === 'high',
      vibrate: [200, 100, 200]
    });

    // Send push notification
    await webpush.sendNotification(subscription, payload);

    // Save notification to database
    await saveNotificationToDatabase(userId, notification);

    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    
    // If subscription is invalid, remove it
    if (error.statusCode === 410) {
      await removePushSubscription(userId);
    }
    
    throw error;
  }
}

/**
 * Save notification to database for tracking
 */
async function saveNotificationToDatabase(userId, notification) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: notification.title,
        body: notification.body,
        category: notification.category,
        priority: notification.priority,
        data: notification.data,
        sent_at: new Date().toISOString(),
        read: false
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving notification to database:', error);
  }
}

/**
 * Remove push subscription
 */
export async function removePushSubscription(userId) {
  try {
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error removing push subscription:', error);
    throw error;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Get user's notification history
 */
export async function getUserNotifications(userId, limit = 20) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
}

/**
 * Schedule smart check-ins based on user activity patterns
 */
export async function scheduleSmartCheckIns(userId) {
  try {
    // Get user profile and activity data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, baby_profiles(*)')
      .eq('id', userId)
      .single();

    if (!profile) return;

    // Get recent chat activity
    const { data: recentChats } = await supabase
      .from('chat_messages')
      .select('created_at, content')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Analyze context
    const now = new Date();
    const hour = now.getHours();
    const lastChatTime = recentChats?.[0]?.created_at 
      ? new Date(recentChats[0].created_at) 
      : null;
    
    const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const babyAge = profile.baby_profiles?.[0]?.age_months || null;
    const lastCheckIn = lastChatTime ? lastChatTime.getTime() : null;

    // Generate contextual notification
    const notification = await generateCheckInNotification(userId, {
      lastCheckIn,
      babyAge,
      timeOfDay
    });

    // Send the notification
    await sendPushNotification(userId, notification);

    return { success: true };
  } catch (error) {
    console.error('Error scheduling smart check-ins:', error);
    throw error;
  }
}
