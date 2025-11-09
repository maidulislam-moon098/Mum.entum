-- Add mood tracking to health_tracking table
-- Run this after the main schema if you need mood data in the Progress tab

-- Add mood column to health_tracking table
alter table if exists public.health_tracking
  add column if not exists mood text;

-- Add mood index for faster queries
create index if not exists idx_health_tracking_mood on public.health_tracking(mood);

-- Update existing dummy data to include mood (if you already ran the dummy data script)
-- This is optional - if you haven't run dummy data yet, you can skip this section
update public.health_tracking
set mood = case
  when random() < 0.25 then 'Happy'
  when random() < 0.5 then 'Calm'
  when random() < 0.75 then 'Tired'
  else 'Anxious'
end
where mood is null;
