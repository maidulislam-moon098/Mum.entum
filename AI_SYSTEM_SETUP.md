# 🤖 Mum.entum AI System - Complete Setup

## Overview
Your AI system now has **context-aware, adaptive intelligence** that monitors chat conversations and automatically adjusts nutrition and lifestyle recommendations.

## 🎯 How It Works

### 1. **Chat Monitoring**
- User chats with AI assistant ("I feel dizzy", "I'm feeling depressed")
- AI analyzes the message in the background
- Detects health signals (dizziness, nausea, fatigue, pain)
- Detects mood signals (depression, anxiety, stress, happiness)

### 2. **Context Storage**
- System stores detected signals in `daily_context` table
- Each day gets one record per user
- Signals accumulate throughout the day
- Flags set for adaptation needs

### 3. **Dashboard Adaptation**
- Dashboard loads user's profile
- Checks today's context (health/mood signals)
- AI generates meal plan (breakfast, lunch, dinner) adapted to signals
- AI generates lifestyle tips adapted to current state
- If user reported "dizzy" → meals help with dizziness
- If user reported "depressed" → mood-boosting foods and activities

### 4. **Daily Refresh**
- New day = fresh context
- Meal plans regenerate daily
- Always personalized to current state

---

## 📋 Setup Steps

### Step 1: Create the Database Table
Run this SQL in your **Supabase SQL Editor**:

```sql
-- Daily context tracking for AI-driven adaptations
create table if not exists public.daily_context (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  health_signals jsonb default '[]'::jsonb,
  mood_signals jsonb default '[]'::jsonb,
  last_chat_summary text,
  adaptation_flags jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique(user_id, date)
);

create or replace function public.touch_daily_context()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create trigger trg_touch_daily_context
before update on public.daily_context
for each row execute procedure public.touch_daily_context();
```

### Step 2: Restart Servers
The code is already updated. Just restart:

```bash
# Backend will auto-restart (nodemon)
# Frontend is already running
```

---

## 🧪 Testing the System

### Test 1: Chat Detection
1. Open **http://localhost:5173**
2. Go to **Mum.entum AI** tab
3. Say: "I'm feeling dizzy today"
4. AI responds with advice
5. **Background**: System detects "dizziness" and stores it

### Test 2: Dashboard Adaptation
1. Go to **Dashboard** tab
2. Refresh the page
3. Check **Nutrition** section
4. You should see meals adapted for dizziness (e.g., ginger-based dishes, hydration focus)
5. Check **Lifestyle** section
6. Tips should mention rest and avoiding sudden movements

### Test 3: Multiple Signals
1. Chat: "I feel dizzy and a bit anxious"
2. Dashboard nutrition adapts for both
3. Lifestyle tips cover rest + stress relief

### Test 4: Daily Reset
1. Next day, chat normally
2. Dashboard shows fresh, non-adapted suggestions
3. Old signals don't carry over

---

## 🔍 What Changed

### Backend Files Updated:
1. **`aiService.js`**
   - Added `analyzeContext()` - detects health/mood signals
   - Added `generateDailyMealPlan()` - creates breakfast/lunch/dinner
   - Added `generateAdaptedLifestyle()` - context-aware lifestyle tips

2. **`chatController.js`**
   - Analyzes every user message
   - Stores signals in `daily_context` table
   - Non-blocking (doesn't slow down chat)

3. **`dashboardController.js`**
   - Fetches today's context
   - Passes context to AI meal planner
   - Adapts suggestions dynamically

### Frontend Files Updated:
1. **`Assistant.jsx`** - Passes userId to ChatWidget
2. **`ChatWidget.jsx`** - Sends userId with chat messages

### Database:
- **New table**: `daily_context`
- Stores per-user, per-day signals
- Auto-updates timestamp

---

## 📊 Data Flow

```
User chats "I feel dizzy"
        ↓
AI analyzes message
        ↓
Detects: health_signals = ["dizziness"]
        ↓
Stores in daily_context table
        ↓
User opens Dashboard
        ↓
Dashboard fetches today's context
        ↓
AI generates adapted meal plan:
  - Breakfast: Ginger tea + toast (anti-nausea)
  - Lunch: Light rice porridge (easy to digest)
  - Dinner: Steamed veggies (gentle on stomach)
        ↓
Lifestyle: "Rest frequently, avoid sudden movements"
```

---

## 🎨 Example Scenarios

### Scenario 1: Physical Symptom
**Chat**: "My back hurts so much"  
**Detection**: `health_signals: ["back pain"]`  
**Nutrition**: Anti-inflammatory foods (turmeric, omega-3)  
**Lifestyle**: "Gentle prenatal yoga for back support"

### Scenario 2: Emotional State
**Chat**: "I've been feeling really anxious lately"  
**Detection**: `mood_signals: ["anxiety"]`  
**Nutrition**: Mood-boosting foods (nuts, dark chocolate, bananas)  
**Lifestyle**: "Try 5-minute breathing exercises before bed"

### Scenario 3: Mixed Signals
**Chat**: "I'm tired and nauseous, don't feel like eating"  
**Detection**: `health_signals: ["fatigue", "nausea"]`  
**Nutrition**: Light, energy-rich foods (crackers, banana smoothie)  
**Lifestyle**: "Take short naps, eat small portions throughout day"

---

## ✅ Success Indicators

After setup, you should see:
- ✅ Chat responds naturally (no formatting issues)
- ✅ Dashboard shows breakfast/lunch/dinner (not generic nutrition)
- ✅ Suggestions change based on chat conversations
- ✅ Fresh meal plans daily
- ✅ No errors in browser console or backend logs

---

## 🚀 Next Steps

1. **Run the SQL** in Supabase
2. **Test the system** with different chat messages
3. **Check dashboard** after chatting
4. **Verify adaptation** is working

The system is fully autonomous - it learns from conversations and adapts automatically! 🎉
