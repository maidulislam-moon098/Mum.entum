import cron from 'node-cron';
import { supabase } from '../config/supabaseClient.js';
import { scheduleSmartCheckIns, sendPushNotification } from '../services/notificationService.js';

/**
 * Automated notification scheduler
 * Sends smart check-ins at optimal times throughout the day
 */

// Morning check-in at 9:00 AM every day
cron.schedule('0 9 * * *', async () => {
  console.log('🌅 Running morning check-ins...');
  await sendCheckInsToActiveUsers('morning');
});

// Afternoon check-in at 2:00 PM every day
cron.schedule('0 14 * * *', async () => {
  console.log('☀️ Running afternoon check-ins...');
  await sendCheckInsToActiveUsers('afternoon');
});

// Evening check-in at 8:00 PM every day
cron.schedule('0 20 * * *', async () => {
  console.log('🌙 Running evening check-ins...');
  await sendCheckInsToActiveUsers('evening');
});

// Weekly wellness check every Sunday at 10:00 AM
cron.schedule('0 10 * * 0', async () => {
  console.log('💗 Running weekly wellness check...');
  await sendWeeklyWellnessCheck();
});

/**
 * Send check-ins to active users
 */
async function sendCheckInsToActiveUsers(timeOfDay) {
  try {
    // Get users who have push subscriptions
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('user_id');

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return;
    }

    console.log(`Found ${subscriptions.length} users with push subscriptions`);

    // Send check-ins to each user
    for (const { user_id } of subscriptions) {
      try {
        // Don't send if user was recently active (within last 2 hours)
        const shouldSkip = await wasRecentlyActive(user_id, 2);
        
        if (shouldSkip) {
          console.log(`Skipping user ${user_id} - recently active`);
          continue;
        }

        await scheduleSmartCheckIns(user_id);
        console.log(`✅ Sent check-in to user ${user_id}`);
        
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.error(`Error sending check-in to user ${user_id}:`, err);
      }
    }

    console.log('✅ Completed check-in batch');
  } catch (error) {
    console.error('Error in sendCheckInsToActiveUsers:', error);
  }
}

/**
 * Check if user was recently active
 */
async function wasRecentlyActive(userId, hoursThreshold = 2) {
  try {
    const { data } = await supabase
      .from('chat_messages')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!data) return false;

    const lastActivityTime = new Date(data.created_at);
    const now = new Date();
    const hoursSinceActivity = (now - lastActivityTime) / (1000 * 60 * 60);

    return hoursSinceActivity < hoursThreshold;
  } catch (error) {
    return false;
  }
}

/**
 * Send weekly wellness check to all users
 */
async function sendWeeklyWellnessCheck() {
  try {
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('user_id');

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return;
    }

    for (const { user_id } of subscriptions) {
      try {
        // Get user's weekly progress
        const { data: profile } = await supabase
          .from('pregnancy_profiles')
          .select('current_week, preferred_name')
          .eq('user_id', user_id)
          .single();

        const weekMessage = profile?.current_week 
          ? `Week ${profile.current_week} - how are you feeling?`
          : 'How has your week been?';

        // Send wellness notification
        const notification = {
          title: '💗 Weekly Check-in',
          body: weekMessage,
          category: 'weekly_wellness',
          priority: 'medium',
          data: {
            url: '/assistant',
            promptId: `weekly_${Date.now()}`,
            question: weekMessage,
            requiresResponse: true
          }
        };

        await sendPushNotification(user_id, notification);
        console.log(`✅ Sent weekly check-in to user ${user_id}`);
        
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.error(`Error sending weekly check-in to user ${user_id}:`, err);
      }
    }

    console.log('✅ Completed weekly wellness check batch');
  } catch (error) {
    console.error('Error in sendWeeklyWellnessCheck:', error);
  }
}

console.log('📅 Notification scheduler initialized');
console.log('⏰ Scheduled jobs:');
console.log('  - Morning check-ins: 9:00 AM daily');
console.log('  - Afternoon check-ins: 2:00 PM daily');
console.log('  - Evening check-ins: 8:00 PM daily');
console.log('  - Weekly wellness: 10:00 AM Sundays');

export { sendCheckInsToActiveUsers, sendWeeklyWellnessCheck };
