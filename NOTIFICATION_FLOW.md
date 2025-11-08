# 🔔 Notification System Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MUMENTUM NOTIFICATION SYSTEM                 │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │         │   Backend    │         │   Database   │
└──────────────┘         └──────────────┘         └──────────────┘
       │                        │                        │
       │  1. User enables       │                        │
       │     notifications      │                        │
       ├───────────────────────>│                        │
       │                        │  2. Save subscription  │
       │                        ├───────────────────────>│
       │                        │                        │
       │                        │  3. AI analyzes        │
       │                        │     user context       │
       │                        │<───────────────────────│
       │                        │                        │
       │                        │  4. Generate question  │
       │                        │     based on:          │
       │                        │     - Time of day      │
       │                        │     - Baby age         │
       │                        │     - Recent mood      │
       │                        │     - Last activity    │
       │                        │                        │
       │  5. Push notification  │                        │
       │<───────────────────────│                        │
       │                        │                        │
       │  6. User taps          │                        │
       │     notification       │                        │
       │                        │                        │
       │  7. Opens /assistant   │                        │
       │     with ?question=... │                        │
       │                        │                        │
       │  8. AI question        │                        │
       │     pre-loaded         │                        │
       │                        │                        │
       │  9. User responds      │                        │
       ├───────────────────────>│                        │
       │                        │  10. Store response    │
       │                        ├───────────────────────>│
       │                        │                        │
       │                        │  11. Update context    │
       │                        │      for future AI     │
       │                        │<───────────────────────│
       │                        │                        │
```

## Notification Generation Logic

```
┌─────────────────────────────────────────────────────────────┐
│              AI CONTEXT ANALYSIS                             │
└─────────────────────────────────────────────────────────────┘

Input:
  • Current time of day
  • User's baby age (months)
  • Recent chat messages
  • Last interaction timestamp
  • User's recent mood signals

        ↓

┌─────────────────────────────────────────────────────────────┐
│           QUESTION SELECTION ENGINE                          │
└─────────────────────────────────────────────────────────────┘

Conditions Checked (in priority order):

1. STRESS DETECTION (HIGH PRIORITY)
   if recentMood === 'stressed'
   → "I noticed you've been stressed..."

2. TIME-BASED PROMPTS (MEDIUM PRIORITY)
   if timeOfDay === 'morning'
   → "How did you and your baby sleep?"
   
   if timeOfDay === 'evening'
   → "How was your day?"

3. AGE-BASED PROMPTS (MEDIUM PRIORITY)
   if babyAge <= 3 months
   → "How is feeding going today?"

4. RE-ENGAGEMENT (HIGH PRIORITY)
   if lastActivity > 24 hours ago
   → "We haven't heard from you in a while..."

5. DEFAULT FALLBACK (LOW PRIORITY)
   → "How are you and your little one doing?"

        ↓

┌─────────────────────────────────────────────────────────────┐
│              NOTIFICATION COMPOSED                           │
└─────────────────────────────────────────────────────────────┘

Output:
  {
    title: "🌸 Mum.entum Check-in",
    body: "How did you and your baby sleep last night?",
    category: "sleep",
    priority: "medium",
    data: {
      url: "/assistant",
      promptId: "checkin_1699876543210",
      question: "How did you and your baby sleep...",
      requiresResponse: true
    }
  }

        ↓

┌─────────────────────────────────────────────────────────────┐
│                  PUSH TO USER                                │
└─────────────────────────────────────────────────────────────┘
```

## User Journey

```
┌────────────────────────────────────────────────────────────────┐
│                      USER JOURNEY                              │
└────────────────────────────────────────────────────────────────┘

Step 1: ONBOARDING
┌──────────────────────┐
│ User signs up        │
│ Completes onboarding │
│ Sees dashboard       │
└──────────────────────┘
          ↓
┌──────────────────────┐
│ Permission banner    │
│ appears              │
│ "Enable Notifications"│
└──────────────────────┘
          ↓
┌──────────────────────┐
│ User clicks "Enable" │
│ Browser prompts      │
│ User grants          │
└──────────────────────┘

Step 2: AI MONITORING
┌──────────────────────┐
│ AI tracks activity:  │
│ • Chat messages      │
│ • Mood entries       │
│ • Time patterns      │
│ • Care actions       │
└──────────────────────┘

Step 3: NOTIFICATION SENT
┌──────────────────────┐
│ 9:00 AM              │
│ Notification appears:│
│                      │
│ 🌸 Mum.entum        │
│ How did you and     │
│ your baby sleep?     │
└──────────────────────┘
          ↓
┌──────────────────────┐
│ User is:             │
│ • Making breakfast   │
│ • Feeding baby       │
│ • Phone nearby       │
└──────────────────────┘
          ↓
┌──────────────────────┐
│ User taps            │
│ notification         │
└──────────────────────┘

Step 4: SEAMLESS ENGAGEMENT
┌──────────────────────┐
│ Browser opens to     │
│ /assistant page      │
└──────────────────────┘
          ↓
┌──────────────────────┐
│ Chat interface shows:│
│                      │
│ AI: How did you and  │
│     your baby sleep  │
│     last night?      │
│                      │
│ [User can type]      │
└──────────────────────┘
          ↓
┌──────────────────────┐
│ User responds:       │
│ "Not great, baby     │
│  woke up 4 times"    │
└──────────────────────┘
          ↓
┌──────────────────────┐
│ AI responds with:    │
│ • Empathy            │
│ • Gentle advice      │
│ • Sleep tips         │
│ • Follow-up actions  │
└──────────────────────┘
          ↓
┌──────────────────────┐
│ AI updates context:  │
│ • Sleep challenge    │
│ • May suggest:       │
│   - Sleep tracking   │
│   - Doctor visit     │
│   - Support resources│
└──────────────────────┘
```

## Scheduled Check-ins

```
┌─────────────────────────────────────────────────────────────┐
│                   DAILY SCHEDULE                             │
└─────────────────────────────────────────────────────────────┘

09:00 AM  →  Morning Check-in
              "How did you sleep?"
              
14:00 PM  →  Afternoon Check-in
              "How is your day going?"
              
20:00 PM  →  Evening Reflection
              "Any challenges today?"

SUNDAY
10:00 AM  →  Weekly Wellness
              "Week 24 - how are you feeling?"

┌─────────────────────────────────────────────────────────────┐
│                  SMART SKIP LOGIC                            │
└─────────────────────────────────────────────────────────────┘

Before sending notification:

if user.wasActiveInLast(2.hours)
  → Skip (don't disturb active users)
  
if user.dismissedSimilarRecently()
  → Skip (respect preferences)
  
if user.inQuietHours()
  → Skip (future feature)
  
else
  → Send notification
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE TABLES                           │
└─────────────────────────────────────────────────────────────┘

push_subscriptions
  ├─ user_id (FK)
  ├─ subscription (JSONB)
  └─ updated_at

notifications
  ├─ id (PK)
  ├─ user_id (FK)
  ├─ title
  ├─ body
  ├─ category
  ├─ priority
  ├─ data (JSONB)
  ├─ sent_at
  ├─ read (boolean)
  └─ read_at

chat_messages
  ├─ id (PK)
  ├─ user_id (FK)
  ├─ role (user/assistant)
  ├─ content
  └─ created_at

baby_profiles
  ├─ id (PK)
  ├─ user_id (FK)
  ├─ name
  ├─ birth_date
  └─ age_months
```

## Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│              SYSTEM INTEGRATION MAP                          │
└─────────────────────────────────────────────────────────────┘

Dashboard
  └─ Shows NotificationPermissionBanner
     └─ Calls NotificationContext.requestPermission()
        └─ Registers Service Worker
           └─ Subscribes to Push
              └─ Sends subscription to backend
                 └─ Saved in database

Assistant
  └─ Receives URL params (?question=...)
     └─ Pre-loads question in ChatWidget
        └─ User responds
           └─ Stored in chat_messages
              └─ AI analyzes for context
                 └─ Used for future notifications

Backend Scheduler
  └─ Cron jobs trigger
     └─ Fetches active subscriptions
        └─ Calls scheduleSmartCheckIns()
           └─ Analyzes user context
              └─ Generates question
                 └─ Sends push notification
                    └─ Saves to notifications table
```

---

## Key Technologies

- **Web Push API**: Browser push notifications
- **Service Workers**: Background processing
- **VAPID**: Secure push authentication
- **Node-Cron**: Scheduled tasks
- **Supabase**: Database & auth
- **React Context**: State management
- **OpenAI**: AI question generation (future)

---

## Success Metrics to Track

1. **Permission Grant Rate**: % of users who enable notifications
2. **Notification Engagement**: % of notifications clicked
3. **Response Rate**: % of check-ins that get responses
4. **Time to Response**: How quickly users respond
5. **User Retention**: Correlation with notification engagement
6. **Optimal Send Times**: When users engage most
7. **Question Effectiveness**: Which prompts work best

---

This visual guide should help you understand the complete notification flow! 🎉
