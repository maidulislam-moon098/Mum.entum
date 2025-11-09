-- Update existing dummy health tracking data to include mood
-- Run this AFTER you've run the main dummy data script

-- Update health tracking entries with mood data
-- Replace 'YOUR_USER_ID_HERE' with the actual UUID from: SELECT id FROM auth.users WHERE email = 'mansurun@example.com';

update public.health_tracking
set mood = case (date - (select min(date) from public.health_tracking where user_id = 'YOUR_USER_ID_HERE'))::integer % 4
  when 0 then 'Happy'
  when 1 then 'Calm'
  when 2 then 'Tired'
  else 'Anxious'
end
where user_id = 'YOUR_USER_ID_HERE';

-- Or if you want more realistic mood patterns, use this instead:
update public.health_tracking
set mood = case
  when extract(dow from date) in (0, 6) then 'Happy'  -- Weekends
  when blood_pressure_systolic > 120 then 'Anxious'   -- High BP days
  when 'Nausea' = any(symptoms) then 'Tired'          -- Symptom days
  when 'Swelling' = any(symptoms) then 'Tired'
  else 'Calm'                                          -- Normal days
end
where user_id = 'YOUR_USER_ID_HERE';
