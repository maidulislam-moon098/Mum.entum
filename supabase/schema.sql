-- Mum.entum database schema
-- Run inside your Supabase SQL editor

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'onboarding_response_type') then
    create type onboarding_response_type as enum ('text', 'single_select', 'multi_select', 'scale');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'onboarding_response_status') then
    create type onboarding_response_status as enum ('answered', 'skipped');
  end if;
end $$;

create table if not exists public.onboarding_questions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  section text not null default 'General',
  prompt text not null,
  help_text text,
  response_type onboarding_response_type not null default 'text',
  response_options text[],
  is_required boolean not null default false,
  allow_answer_later boolean not null default true,
  depends_on_slug text,
  depends_on_values text[],
  sequence integer not null unique,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table if exists public.onboarding_questions
  add column if not exists depends_on_slug text,
  add column if not exists depends_on_values text[];

create table if not exists public.onboarding_responses (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.onboarding_questions(id) on delete cascade,
  response_payload jsonb,
  status onboarding_response_status not null default 'answered',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  primary key (user_id, question_id)
);

create table if not exists public.pregnancy_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferred_name text,
  baby_nickname text,
  due_date date,
  current_week integer,
  primary_provider text,
  preferred_focus text,
  age integer,
  country text,
  pregnancy_status text,
  planning_window text,
  weeks_pregnant integer,
  is_first_pregnancy boolean,
  complications text,
  medical_conditions text[],
  medications text[],
  allergies text[],
  diet_style text,
  food_preferences text,
  activity_level text,
  substance_use text,
  emotional_state text,
  has_doctor boolean,
  next_appointment date,
  emergency_contact jsonb,
  blood_group text,
  folic_acid text,
  due_date_known text,
  notes text,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table if exists public.pregnancy_profiles
  add column if not exists age integer,
  add column if not exists country text,
  add column if not exists pregnancy_status text,
  add column if not exists planning_window text,
  add column if not exists weeks_pregnant integer,
  add column if not exists is_first_pregnancy boolean,
  add column if not exists complications text,
  add column if not exists medical_conditions text[],
  add column if not exists medications text[],
  add column if not exists allergies text[],
  add column if not exists diet_style text,
  add column if not exists food_preferences text,
  add column if not exists activity_level text,
  add column if not exists substance_use text,
  add column if not exists emotional_state text,
  add column if not exists has_doctor boolean,
  add column if not exists next_appointment date,
  add column if not exists emergency_contact jsonb,
  add column if not exists blood_group text,
  add column if not exists folic_acid text,
  add column if not exists due_date_known text;

create table if not exists public.baby_health_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week integer not null,
  headline text not null,
  description text,
  focus_points text[],
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.care_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text default 'Wellness',
  title text not null,
  summary text not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.action_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  is_completed boolean not null default false,
  category text default 'general',
  due_on date,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table if exists public.action_items
  add column if not exists category text default 'general';

create table if not exists public.important_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  severity text default 'info',
  created_at timestamptz not null default timezone('utc'::text, now()),
  acknowledged boolean not null default false
);

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

-- Chat messages for AI conversation history
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_chat_messages_user_id on public.chat_messages(user_id);
create index if not exists idx_chat_messages_created_at on public.chat_messages(created_at desc);

-- Push notification subscriptions
create table if not exists public.push_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  subscription jsonb not null,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Notification history
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  category text,
  priority text default 'medium',
  data jsonb,
  sent_at timestamptz not null default timezone('utc'::text, now()),
  read boolean not null default false,
  read_at timestamptz
);

create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_sent_at on public.notifications(sent_at desc);
create index if not exists idx_notifications_read on public.notifications(read);

-- Baby profiles for postpartum support
create table if not exists public.baby_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  birth_date date,
  age_months integer,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_baby_profiles_user_id on public.baby_profiles(user_id);

-- Daily health tracking (blood pressure, weight, symptoms)
create table if not exists public.health_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  weight_kg decimal(5,2),
  symptoms text[],
  symptom_notes text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique(user_id, date)
);

create index if not exists idx_health_tracking_user_id on public.health_tracking(user_id);
create index if not exists idx_health_tracking_date on public.health_tracking(date desc);

-- Treatment recommendations from AI
create table if not exists public.treatment_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  risk_level text not null default 'low',
  category text not null,
  recommended_actions text[],
  sent_via_notification boolean not null default false,
  acknowledged boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  expires_at timestamptz
);

create index if not exists idx_treatment_recommendations_user_id on public.treatment_recommendations(user_id);
create index if not exists idx_treatment_recommendations_created_at on public.treatment_recommendations(created_at desc);
create index if not exists idx_treatment_recommendations_risk_level on public.treatment_recommendations(risk_level);

-- Insights articles for postpartum support
create table if not exists public.insights_articles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  category text not null,
  title text not null,
  summary text not null,
  content text not null,
  tags text[],
  is_personalized boolean not null default false,
  stage text not null default 'pregnancy',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_insights_articles_user_id on public.insights_articles(user_id);
create index if not exists idx_insights_articles_category on public.insights_articles(category);
create index if not exists idx_insights_articles_stage on public.insights_articles(stage);
create index if not exists idx_insights_articles_created_at on public.insights_articles(created_at desc);

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

create or replace function public.touch_onboarding_responses()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create trigger trg_touch_onboarding_responses
before update on public.onboarding_responses
for each row execute procedure public.touch_onboarding_responses();

-- Seed onboarding questions
insert into public.onboarding_questions (slug, section, prompt, help_text, response_type, response_options, is_required, allow_answer_later, depends_on_slug, depends_on_values, sequence)
values
  ('mama-name', 'Basic Personal Information', 'What is your name?', 'We will use this to greet you in every note.', 'text', null, true, false, null, null, 1),
  ('mama-age', 'Basic Personal Information', 'What is your age?', 'Age helps us align guidance and risk checks.', 'text', null, true, true, null, null, 2),
  ('mama-region', 'Basic Personal Information', 'What country or region are you from?', 'We adapt cultural and medical guidance to your location.', 'text', null, true, true, null, null, 3),
  ('pregnancy-status', 'Pregnancy Status', 'Are you currently pregnant or planning to get pregnant soon?', 'Choose what fits right now so timing stays on point.', 'single_select', '{No I want to be,Yes I am}', true, false, null, null, 4),
  ('pregnancy-feeling', 'Pregnancy Status', 'How are you feeling?', 'Let us know how you are doing right now.', 'single_select', '{Excited and happy,A bit nervous,Overwhelmed,Tired but hopeful}', true, false, 'pregnancy-status', '{Yes I am}', 5),
  ('folic-acid', 'Pregnancy Status', 'Are you taking folic acid?', 'Folic acid is important for your baby''s development.', 'single_select', '{Yes,No}', true, false, 'pregnancy-status', '{Yes I am}', 6),
  ('due-date-known', 'Pregnancy Status', 'Do you know your due date?', 'This helps us provide week-by-week guidance.', 'single_select', '{Yes,No calculate it for me}', true, false, 'pregnancy-status', '{Yes I am}', 7),
  ('pregnancy-weeks', 'Pregnancy Status', 'How many weeks pregnant are you?', 'We will sync week-by-week updates to this number.', 'text', null, true, false, 'pregnancy-status', '{Yes I am}', 8),
  ('first-pregnancy', 'Pregnancy Status', 'Is this your first pregnancy?', 'This lets us tailor support for first-time or experienced mums.', 'single_select', '{Yes,No}', true, false, 'pregnancy-status', '{Yes I am}', 9),
  ('pregnancy-complications', 'Pregnancy Status', 'Have you had any complications in this or previous pregnancies?', 'Share anything your care team is watching closely.', 'text', null, false, true, 'pregnancy-status', '{Yes I am}', 10),
  ('conception-window', 'Pregnancy Status', 'When are you hoping to conceive?', 'We will time prep tips around your window.', 'text', null, true, false, 'pregnancy-status', '{No I want to be}', 11),
  ('medical-conditions', 'Medical Background', 'Do you have any pre-existing medical conditions?', 'Think diabetes, hypertension, thyroid or anything else important.', 'multi_select', '{None,Diabetes,Hypertension,Thyroid,PCOS,Autoimmune condition,Other}', false, true, null, null, 12),
  ('current-meds', 'Medical Background', 'Are you currently taking any medications or supplements?', 'Include prenatal vitamins, prescriptions or herbal support.', 'text', null, false, true, null, null, 13),
  ('allergies', 'Medical Background', 'Do you have any allergies (food or medicine)?', 'We will keep alerts safe for your sensitivities.', 'text', null, false, true, null, null, 14),
  ('diet-style', 'Lifestyle & Nutrition', 'What kind of diet do you follow?', 'Helps us share recipes and nutrition reminders you will love.', 'single_select', '{Vegetarian,Non-vegetarian,Other}', true, true, null, null, 15),
  ('food-preferences', 'Lifestyle & Nutrition', 'Do you have any food restrictions or preferences?', 'Tell us about cultural staples, cravings or aversions.', 'text', null, false, true, null, null, 16),
  ('activity-level', 'Lifestyle & Nutrition', 'How active are you during the week?', 'We will match movement tips to your pace.', 'single_select', '{Low,Moderate,High}', true, true, null, null, 17),
  ('substance-use', 'Lifestyle & Nutrition', 'Do you smoke or drink alcohol?', 'No judgement—knowing this keeps our nudges supportive.', 'single_select', '{Never,Occasionally,Yes}', false, true, null, null, 18),
  ('emotional-checkin', 'Mental Health', 'How are you feeling emotionally these days?', 'We will tune mental health support to your emotional check-in.', 'single_select', '{Happy,Stressed,Tired,Anxious}', true, true, null, null, 19),
  ('has-doctor', 'Doctor & Appointment Info', 'Do you currently have a gynecologist or doctor you see regularly?', 'We can prompt appointment prep or questions to ask.', 'single_select', '{Yes,No}', true, false, null, null, 20),
  ('next-appointment', 'Doctor & Appointment Info', 'When is your next prenatal appointment (if any)?', 'Add a date so we can schedule gentle reminders.', 'text', null, false, true, 'has-doctor', '{Yes}', 21),
  ('emergency-contact', 'Emergency Info', 'Who should we contact in an emergency?', 'Name, relation and phone help us surface this quickly when needed.', 'text', null, false, true, null, null, 22),
  ('blood-group', 'Emergency Info', 'What''s your blood group?', 'Critical information to have on hand in urgent moments.', 'single_select', '{A+,A-,B+,B-,AB+,AB-,O+,O-,Unsure}', false, true, null, null, 23)
  on conflict (slug) do nothing;

-- Sample data helpers (callable after onboarding to personalise dashboard)
create or replace function public.initialise_dashboard(user_uuid uuid)
returns void as $$
begin
  insert into public.pregnancy_profiles (user_id, preferred_name, baby_nickname, due_date, current_week, primary_provider, preferred_focus, age, country, pregnancy_status, planning_window, weeks_pregnant, is_first_pregnancy, complications, medical_conditions, medications, allergies, diet_style, food_preferences, activity_level, substance_use, emotional_state, has_doctor, next_appointment, emergency_contact, blood_group, notes)
  values (user_uuid, 'Mama', 'Peach', current_date + interval '180 days', 20, 'Dr. Lee', 'Movement', 30, 'Singapore', 'Pregnant right now', null, 20, true, 'None noted', '{None}', 'Prenatal vitamin', null, 'Vegetarian', 'Craving citrus and light soups', 'Moderate and steady', 'No, never', 'Radiant and calm', true, current_date + interval '14 days', '{"name":"Avery","relation":"Partner","phone":"+65 8000"}'::jsonb, 'O+', 'Sample profile generated for demos')
  on conflict (user_id) do nothing;

  insert into public.baby_health_metrics (user_id, week, headline, description, focus_points)
  values
    (user_uuid, 20, 'Peach-sized wonder', 'Baby''s senses are tuning up and practicing swallowing.', '{Hydration focus, Gentle stretching}'),
    (user_uuid, 21, 'Hearing new sounds', 'Sound-sensitive stage, perfect for lullabies and partner chats.', '{Talk to baby, Mindful breathing}'),
    (user_uuid, 22, 'Sleep patterns emerging', 'Baby is developing sleep-wake cycles similar to newborn rhythms.', '{Consistent bedtime, Light evening snack}')
  on conflict do nothing;

  insert into public.care_insights (user_id, category, title, summary)
  values
    (user_uuid, 'Nutrition', 'Add a calcium-rich snack', 'Pair almonds with yoghurt to support bone growth.'),
    (user_uuid, 'Movement', '10-minute stretch break', 'Hip-opening stretches reduce lower back tightness.'),
    (user_uuid, 'Mindfulness', 'Breathing reminder', 'Try the 4-7-8 breathing pattern before sleep.')
  on conflict do nothing;

  insert into public.action_items (user_id, title, is_completed, due_on)
  values
    (user_uuid, 'Book next prenatal visit', false, current_date + interval '7 days'),
    (user_uuid, 'Schedule partner check-in', false, current_date + interval '3 days'),
    (user_uuid, 'Prep hydration reminders', false, null)
  on conflict do nothing;

  insert into public.important_notifications (user_id, title, message, severity)
  values
    (user_uuid, 'Hydration nudge', 'Aim for 8 glasses today—warm water with lemon can ease digestion.', 'info'),
    (user_uuid, 'Appointment prep', 'Review your questions list before the next visit on the calendar.', 'important'),
    (user_uuid, 'Movement reminder', 'Gentle hip circles can relieve lower back tension this week.', 'info')
  on conflict do nothing;
end;
$$ language plpgsql security definer;

grant execute on function public.initialise_dashboard(uuid) to authenticated;
