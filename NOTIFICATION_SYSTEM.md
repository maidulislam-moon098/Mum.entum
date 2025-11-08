# Notification System Setup Guide

## Overview

Mum.entum features a smart notification system that allows the AI to check in on users with contextual questions and prompts. When users tap on a notification, they're taken directly to the Assistant page with the AI's question pre-loaded.

## Features

- 🔔 **Push Notifications**: Browser-based push notifications using Web Push API
- 🤖 **AI-Driven Check-ins**: Smart notifications based on user context (time of day, baby age, recent mood, etc.)
- 💬 **Direct Engagement**: Clicking a notification opens the chat with the AI's question ready
- 📊 **Notification History**: Track all sent notifications in the database
- 🎯 **Contextual Prompts**: Different question types based on user patterns

## Setup Instructions

### 1. Generate VAPID Keys

VAPID keys are required for Web Push notifications. Generate them once:

```bash
cd backend
npx web-push generate-vapid-keys
```

You'll get output like:
```
Public Key: BKxyz...
Private Key: abc123...
```

### 2. Add Environment Variables

Add these to your `backend/.env` file:

```env
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:support@mumentum.app
```

### 3. Run Database Migration

The schema includes these new tables:
- `push_subscriptions` - Stores user push subscription data
- `notifications` - Notification history and read status
- `chat_messages` - Chat history for context analysis
- `baby_profiles` - Baby info for age-based prompts

Run the updated schema in your Supabase SQL editor.

### 4. Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 5. Test the System

1. **Start the servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Enable notifications**:
   - Log in to the dashboard
   - You'll see a banner asking to enable notifications
   - Click "Enable Notifications"
   - Allow browser permissions

3. **Send a test notification**:
   ```bash
   curl -X POST http://localhost:5000/api/notifications/test \
     -H "Content-Type: application/json"
   ```

## How It Works

### Flow Diagram

```
User Activity → AI Analysis → Notification Generated → Push Sent
                                                          ↓
User Taps Notification → Opens Assistant → Question Pre-loaded → User Responds
                                                                      ↓
                                                            AI Learns & Adapts
```

### Notification Types

1. **Morning Check-ins**: "How did you and your baby sleep last night?"
2. **Evening Reflections**: "How was your day? Any challenges or wins?"
3. **Stress Support**: "I noticed you've been stressed. Would you like to talk?"
4. **Feeding Questions**: "How is feeding going today?" (for babies 0-3 months)
5. **Wellness Check**: "We haven't heard from you in a while. How are you doing?"

### Context Analysis

The AI considers:
- **Time of day** - Different prompts for morning/evening
- **Baby age** - Age-appropriate questions
- **Recent mood** - Emotional support when needed
- **Last interaction** - Re-engagement prompts
- **User patterns** - Learned preferences over time

## API Endpoints

### `GET /api/notifications/vapid-public-key`
Get the VAPID public key for client-side subscription

### `POST /api/notifications/subscribe`
Subscribe to push notifications
```json
{
  "subscription": {
    "endpoint": "https://...",
    "keys": { ... }
  }
}
```

### `POST /api/notifications/unsubscribe`
Unsubscribe from push notifications

### `POST /api/notifications/test`
Send a test notification

### `GET /api/notifications/history`
Get notification history
- Query param: `limit` (default: 20)

### `PATCH /api/notifications/:notificationId/read`
Mark a notification as read

### `POST /api/notifications/check-in`
Manually trigger a smart check-in notification

## Scheduling Notifications

You can set up automated check-ins using a cron job or scheduler:

### Using Node-Cron (recommended)

Add to `backend/package.json`:
```json
"dependencies": {
  "node-cron": "^3.0.3"
}
```

Create `backend/src/scheduler.js`:
```javascript
import cron from 'node-cron';
import { supabase } from './config/supabaseClient.js';
import { scheduleSmartCheckIns } from './services/notificationService.js';

// Run every day at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Running morning check-ins...');
  
  // Get all active users
  const { data: users } = await supabase
    .from('pregnancy_profiles')
    .select('user_id');
  
  for (const user of users) {
    await scheduleSmartCheckIns(user.user_id);
  }
});

// Run every day at 8 PM
cron.schedule('0 20 * * *', async () => {
  console.log('Running evening check-ins...');
  // Same logic as above
});
```

Import in `server.js`:
```javascript
import './scheduler.js';
```

## Customization

### Adding New Question Types

Edit `backend/src/services/notificationService.js`:

```javascript
const prompts = [
  {
    condition: () => yourConditionHere,
    question: "Your question here?",
    category: 'your_category',
    priority: 'high' // low, medium, high
  },
  // ... existing prompts
];
```

### Adjusting Notification Frequency

Modify the condition checks in `generateCheckInNotification()` to change how often notifications are sent.

## Troubleshooting

### Notifications not appearing?

1. **Check browser permissions**: Ensure notifications are allowed in browser settings
2. **HTTPS required**: Push notifications require HTTPS (except localhost)
3. **Service worker**: Check if SW is registered in DevTools → Application → Service Workers
4. **VAPID keys**: Verify keys are correctly set in `.env`

### Service worker not loading?

1. Clear browser cache
2. Unregister old service workers in DevTools
3. Restart the dev server

### Can't subscribe to push?

1. Check console for errors
2. Verify VAPID public key endpoint is accessible
3. Ensure user is logged in

## Security Considerations

- VAPID keys should be kept secret (never commit to git)
- Use environment variables for all sensitive data
- Validate user authentication before sending notifications
- Implement rate limiting to prevent notification spam
- Follow browser notification best practices

## Future Enhancements

- [ ] Notification preferences (frequency, types)
- [ ] Quiet hours configuration
- [ ] Multi-device support
- [ ] Rich media notifications (images, actions)
- [ ] Notification analytics dashboard
- [ ] A/B testing for notification copy
- [ ] Smart send time optimization

## Resources

- [Web Push API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker Guide](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [web-push Library](https://github.com/web-push-libs/web-push)
- [VAPID Specification](https://datatracker.ietf.org/doc/html/rfc8292)
