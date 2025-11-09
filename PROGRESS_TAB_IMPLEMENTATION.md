# Progress Tab Implementation - Calendar & Graphs

## Overview
The Progress tab now includes:
1. **Scrollable Daily Calendar** - Shows last 30 days with color-coded mood indicators
2. **Interactive Day Details** - Click any day to see detailed health metrics
3. **Blood Pressure Graph** - Line chart showing systolic BP trends over time
4. **Weight Trend Graph** - Line chart tracking weight changes
5. **Mood Pattern Graph** - Bar chart visualizing mood variations

## Database Changes Required

### Step 1: Add Mood Column to health_tracking Table
Run this SQL in your Supabase SQL Editor:

```sql
-- Add mood tracking to health_tracking table
alter table if exists public.health_tracking
  add column if not exists mood text;

-- Add mood index for faster queries
create index if not exists idx_health_tracking_mood on public.health_tracking(mood);
```

**File**: `/supabase/add_mood_tracking.sql`

### Step 2: Update Existing Dummy Data (Optional)
If you've already run the main dummy data script, run this to add mood data:

```sql
-- Replace 'YOUR_USER_ID_HERE' with actual UUID
update public.health_tracking
set mood = case
  when extract(dow from date) in (0, 6) then 'Happy'  -- Weekends
  when blood_pressure_systolic > 120 then 'Anxious'   -- High BP days
  when 'Nausea' = any(symptoms) then 'Tired'          -- Symptom days
  when 'Swelling' = any(symptoms) then 'Tired'
  else 'Calm'                                          -- Normal days
end
where user_id = 'YOUR_USER_ID_HERE';
```

**File**: `/supabase/update_dummy_data_with_mood.sql`

## Files Modified

### Frontend Changes

1. **Progress.jsx** (`/frontend/src/pages/Progress.jsx`)
   - Added Recharts library imports
   - Added state for `healthData` and `selectedDate`
   - New useEffect to fetch health tracking data
   - Scrollable calendar component with 30-day view
   - Color-coded mood indicators (Happy=teal, Calm=light teal, Tired=pink, Anxious=dark pink)
   - Click-to-view detailed day information
   - Three graphs: Blood Pressure, Weight, and Mood

2. **DailyHealthCheck.jsx** (`/frontend/src/components/DailyHealthCheck.jsx`)
   - Added `mood` field to state
   - Added mood selector with 4 options: Happy, Calm, Tired, Anxious
   - Mood appears first in the form (above blood pressure)
   - Teal-colored mood buttons

### Backend Changes

3. **healthTrackingController.js** (`/backend/src/controllers/healthTrackingController.js`)
   - Added `mood` field to saveHealthData function
   - Mood is now saved/retrieved with health tracking data

### Package Updates

4. **package.json** (`/frontend/package.json`)
   - Added `recharts` dependency for graphs

## How to Run

### 1. Database Setup
```bash
# In Supabase SQL Editor, run:
# 1. /supabase/add_mood_tracking.sql
# 2. /supabase/update_dummy_data_with_mood.sql (if you have existing data)
```

### 2. Get Your User ID
```sql
SELECT id FROM auth.users WHERE email = 'your-email@example.com';
```

### 3. Replace Placeholder in SQL Scripts
Replace `'YOUR_USER_ID_HERE'` with your actual UUID in the update script.

### 4. Start Servers (Already Running)
```bash
# Backend (port 5050)
cd backend && npm start

# Frontend (port 5175)
cd frontend && npm run dev
```

## Features

### Calendar Component
- **30-day scrollable view**: Horizontal scroll showing last 30 days
- **Color coding**: Each day colored by mood (Happy, Calm, Tired, Anxious)
- **Interactive**: Click any day with data to see details
- **Legend**: Shows what each color represents
- **Responsive**: Works on mobile and desktop

### Day Details Panel
Appears when you click a calendar day, showing:
- Full date (e.g., "Monday, November 10, 2025")
- Mood with color indicator
- Blood pressure reading (systolic/diastolic)
- Weight in kg
- List of symptoms (if any)

### Blood Pressure Graph
- **Type**: Line chart
- **Data**: Systolic blood pressure over time
- **Color**: Pink (#f084ae)
- **Features**: Hover tooltips, grid lines, responsive

### Weight Graph
- **Type**: Line chart
- **Data**: Weight in kg over time
- **Color**: Teal (#4fb3a6)
- **Features**: Auto-scaling Y-axis, smooth curves

### Mood Graph
- **Type**: Bar chart
- **Data**: Mood patterns (Happy=4, Calm=3, Tired=2, Anxious=1)
- **Color**: Pink bars
- **Features**: Custom Y-axis labels showing mood names

## Mood Options
- **Happy** 😊 - Feeling great
- **Calm** 😌 - Peaceful and relaxed
- **Tired** 😴 - Low energy
- **Anxious** 😰 - Worried or stressed

## Data Flow

1. **User Input**: DailyHealthCheck component (Dashboard)
   - User selects mood, enters BP, weight, symptoms
   - Saves to `health_tracking` table

2. **Data Storage**: Supabase health_tracking table
   - One row per user per day
   - Includes: date, mood, BP, weight, symptoms

3. **Data Display**: Progress tab
   - Fetches last 30 days on page load
   - Transforms data for charts
   - Displays in calendar and graphs

## Styling Details

### Calendar Colors
```javascript
const moodColors = {
  'Happy': '#4fb3a6',    // Teal
  'Calm': '#81C5BC',     // Light teal
  'Tired': '#F8BCD3',    // Light pink
  'Anxious': '#f084ae'   // Dark pink
};
```

### Calendar Scrollbar
- Thin scrollbar
- Pink (#f084ae) thumb
- Light pink track

### Graph Styling
- White background cards
- 24px border radius
- Pink/teal accent colors
- Soft shadows (rgba(240, 132, 174, 0.1))

## API Endpoints Used

```javascript
// Get all health tracking data
GET /api/health-tracking?userId={userId}
Response: Array of health tracking entries

// Get today's data
GET /api/health-tracking/latest
Response: Single health tracking entry or null

// Save/update health data
POST /api/health-tracking
Body: { mood, blood_pressure_systolic, blood_pressure_diastolic, weight_kg, symptoms, symptom_notes }
Response: { success: true, data: {...} }
```

## Testing Checklist

- [ ] Run `add_mood_tracking.sql` in Supabase
- [ ] Update dummy data with mood values
- [ ] Navigate to Progress tab
- [ ] See scrollable calendar with colored days
- [ ] Click a calendar day to see details
- [ ] See three graphs (BP, Weight, Mood) below calendar
- [ ] Go to Dashboard
- [ ] Fill out Daily Health Check with mood
- [ ] Save and return to Progress tab
- [ ] Verify new data appears in calendar and graphs

## Future Enhancements

Possible additions:
- Date range selector (last 7/30/90 days)
- Export data as CSV
- Comparison view (this week vs last week)
- Symptom frequency analysis
- Notifications for unusual patterns
- Downloadable reports for doctor visits
- Add notes to specific days
- Photo uploads for tracking visual changes

## Troubleshooting

### Calendar shows no data
- Check if health tracking entries exist in database
- Verify user_id matches logged-in user
- Check browser console for API errors

### Graphs not showing
- Verify `recharts` package is installed
- Check if chartData array has entries
- Look for console errors

### Mood not saving
- Verify `mood` column exists in database
- Check backend controller includes mood in save function
- Verify frontend sends mood in request body

## Dependencies

```json
{
  "recharts": "^2.x.x"  // Charting library
}
```

## Color Palette Reference

```css
/* Primary Colors */
--pink: #F084AE;
--teal: #4FB3A6;

/* Mood Colors */
--mood-happy: #4FB3A6;
--mood-calm: #81C5BC;
--mood-tired: #F8BCD3;
--mood-anxious: #F084AE;

/* Graph Colors */
--graph-bp: #f084ae;
--graph-weight: #4fb3a6;
--graph-mood: #f084ae;
```
