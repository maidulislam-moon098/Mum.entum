import { supabaseAdmin } from '../config/supabaseClient.js';
import { 
  generateNutritionSuggestions, 
  generateLifestyleSuggestions,
  generateDailyMealPlan,
  generateAdaptedLifestyle,
  generateMoodSummary
} from '../services/aiService.js';

const regionPlaybook = {
  india: {
    staples: 'mung dal khichdi, idli with sambar, warm millet rotis',
    produce: 'seasonal mango, papaya, spinach, and curry leaves',
    hydration: 'coconut water and jeera-infused warm water'
  },
  usa: {
    staples: 'steel-cut oats, baked salmon, and quinoa bowls',
    produce: 'berries, leafy greens, and sweet potatoes',
    hydration: 'citrus-infused water and herbal teas'
  },
  uk: {
    staples: 'porridge with seeds, lentil shepherd’s pie, and hearty soups',
    produce: 'root vegetables, leafy greens, and apples',
    hydration: 'warm lemon water and berry infusions'
  },
  singapore: {
    staples: 'brown rice congee, steamed fish, and tofu stir-fries',
    produce: 'bok choy, papaya, and dragon fruit',
    hydration: 'warm barley water and chrysanthemum tea'
  }
};

const parseList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(/[,\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const hasCompletedOnboarding = async (userId) => {
  const [{ data: questions, error: questionsError }, { data: responses, error: responsesError }] = await Promise.all([
    supabaseAdmin
      .from('onboarding_questions')
      .select('id, slug, is_required, depends_on_slug, depends_on_values'),
    supabaseAdmin
      .from('onboarding_responses')
      .select('question_id, status, response_payload')
      .eq('user_id', userId)
  ]);

  if (questionsError) throw questionsError;
  if (responsesError) throw responsesError;

  const questionList = questions || [];
  const responseList = responses || [];

  if (!questionList.some((question) => question.is_required)) {
    return true;
  }

  const questionBySlug = new Map(questionList.map((question) => [question.slug, question]));
  const responseByQuestionId = new Map(responseList.map((response) => [response.question_id, response]));

  const dependencySatisfied = (question) => {
    if (!question.depends_on_slug) return true;
    const dependencyQuestion = questionBySlug.get(question.depends_on_slug);
    if (!dependencyQuestion) return true;
    const dependencyResponse = responseByQuestionId.get(dependencyQuestion.id);
    if (!dependencyResponse || dependencyResponse.status !== 'answered') return false;

    const allowedValuesRaw = question.depends_on_values;
    const allowedValues = Array.isArray(allowedValuesRaw)
      ? allowedValuesRaw
      : allowedValuesRaw
      ? [allowedValuesRaw]
      : [];
    if (!allowedValues || allowedValues.length === 0) return true;

    const rawValue = dependencyResponse.response_payload;
    if (Array.isArray(rawValue)) {
      return rawValue.some((value) => allowedValues.includes(String(value)));
    }

    if (rawValue === null || rawValue === undefined) {
      return false;
    }

    return allowedValues.includes(String(rawValue));
  };

  return questionList
    .filter((question) => question.is_required)
    .filter(dependencySatisfied)
    .every((question) => {
      const response = responseByQuestionId.get(question.id);
      return response && response.status === 'answered';
    });
};

const determineRegionKey = (rawRegion) => {
  if (!rawRegion) return 'default';
  const normalised = rawRegion.toLowerCase();
  const match = Object.keys(regionPlaybook).find((key) => normalised.includes(key));
  return match || 'default';
};

const extractCustomConditions = (conditions) =>
  parseList(conditions)
    .map((entry) => entry.replace(/^custom:\s*/i, '').trim())
    .filter((entry) => entry && entry.toLowerCase() !== 'none');

const buildNutritionSuggestions = (profile) => {
  if (!profile) return [];

  const regionKey = determineRegionKey(profile.country);
  const regionSummary = regionPlaybook[regionKey] || {
    staples: 'whole grains, gently spiced legumes, and seasonal produce from your region',
    produce: 'local fruits and leafy greens rich in folate and iron',
    hydration: 'warm water infusions and electrolyte-friendly drinks'
  };

  const allergies = parseList(profile.allergies);
  const medicalConditions = extractCustomConditions(profile.medical_conditions);

  const allergyLine = allergies.length
    ? `We will steer clear of ${allergies.join(', ')} when suggesting recipes and swap them for gentle alternatives.`
    : 'No allergies were noted, so we will lean into the full palette of nourishing foods in your region.';

  const conditionLine = medicalConditions.length
    ? `Because you mentioned ${medicalConditions.join(', ')}, our AI prioritises options that support those conditions and avoids known triggers.`
    : 'Share any health conditions and we will fine-tune micronutrient support instantly.';

  return [
    {
      id: 'nutrition-region-highlights',
      category: 'Regional focus',
      title: `Comforting staples for ${profile.country || 'your region'}`,
      summary: `Our AI leans into ${regionSummary.staples} so meals feel familiar and balanced. We pair them with ${regionSummary.produce} to cover iron, calcium, and folate needs.`
    },
    {
      id: 'nutrition-allergy-guard',
      category: 'Allergy aware',
      title: 'Safe swaps personalised for you',
      summary: allergyLine
    },
    {
      id: 'nutrition-hydration',
      category: 'Hydration & boosters',
      title: 'Gentle hydration reminders',
      summary: `${regionSummary.hydration} keep fluids up without upsetting your tummy. ${conditionLine}`
    }
  ];
};

const buildLifestyleSuggestions = (profile) => {
  if (!profile) return [];

  const activity = profile.activity_level || 'a pace that works for you';
  const emotional = profile.emotional_state || 'how you are feeling today';
  const weeks = profile.current_week || profile.weeks_pregnant;
  const hasDoctor = profile.has_doctor;
  const nextAppointment = profile.next_appointment ? new Date(profile.next_appointment) : null;

  const appointmentLine = hasDoctor
    ? nextAppointment
      ? `Your next appointment is on ${nextAppointment.toLocaleDateString()}. We will surface checklists and question prompts a few days before.`
      : 'Keep logging upcoming appointments so we can surface preparation checklists in time.'
    : 'You noted that you are still finding a doctor—our resources tab gathers provider directories tailored to your region.';

  return [
    {
      id: 'lifestyle-movement',
      category: 'Movement',
      title: 'Movement that matches your energy',
      summary: `Since you described your activity level as ${activity}, we recommend short bursts of pelvic-friendly stretches and guided breathing. We keep impact aligned with week ${weeks || 'current'} so it feels safe.`
    },
    {
      id: 'lifestyle-emotions',
      category: 'Mind-body',
      title: 'Emotional wellbeing nudges',
      summary: `Your latest emotional check-in was "${emotional}". Expect calming rituals, journaling prompts, and partner support ideas tuned to that feeling.`
    },
    {
      id: 'lifestyle-appointments',
      category: 'Care circle',
      title: 'Care team coordination',
      summary: appointmentLine
    }
  ];
};

const buildFallbackNotifications = (profile) => {
  if (!profile) {
    return [
      {
        id: 'notification-welcome',
        title: 'Welcome to Mum.entum',
        message: 'Share a few onboarding details so we can craft timely nudges just for you.',
        severity: 'info',
        created_at: new Date().toISOString()
      }
    ];
  }

  const notifications = [];

  const hydrationNote = {
    id: 'notification-hydration',
    title: 'Hydration check-in',
    message: 'Keep a refillable bottle nearby—staying hydrated supports amniotic fluid levels and digestion.',
    severity: 'info',
    created_at: new Date().toISOString()
  };

  notifications.push(hydrationNote);

  if (profile.next_appointment) {
    notifications.push({
      id: 'notification-appointment',
      title: 'Appointment prep',
      message: `Start jotting questions for your upcoming visit on ${new Date(profile.next_appointment).toLocaleDateString()}.`,
      severity: 'important',
      created_at: new Date().toISOString()
    });
  }

  const conditionLabels = extractCustomConditions(profile.medical_conditions);
  if (conditionLabels.length > 0) {
    notifications.push({
      id: 'notification-condition',
      title: 'Condition-aware insight',
      message: `Because you noted ${conditionLabels.join(', ')}, we will prioritise check-ins that keep symptoms in check.`,
      severity: 'info',
      created_at: new Date().toISOString()
    });
  }

  return notifications;
};

const buildWeeklyMetrics = (profile) => {
  if (!profile) return [];
  const currentWeek = Number(profile.current_week || profile.weeks_pregnant);
  if (!currentWeek) return [];

  const regionKey = determineRegionKey(profile.country);
  const regionSummary = regionPlaybook[regionKey] || {
    staples: 'whole grains and pulses',
    produce: 'seasonal fruits and leafy greens',
    hydration: 'warm herbal infusions'
  };

  const primaryProduce = regionSummary.produce.split(',')[0]?.trim() || 'seasonal produce';
  const movementCue = profile.activity_level
    ? `${profile.activity_level.toLowerCase()} movement`
    : 'gentle stretches';
  const upcomingWeek = Math.min(currentWeek + 1, 40);

  return [
    {
      week: currentWeek,
      headline: `Week ${currentWeek}: nourish with familiarity`,
      description: `Lean into ${regionSummary.staples} and ${primaryProduce} to keep energy steady with your ${profile.diet_style || 'balanced'} approach.`,
      focus_points: [
        `Add ${primaryProduce} to one meal today and pair it with a protein-rich side.`,
        `Schedule a ${movementCue} break alongside a hydration reminder.`
      ]
    },
    {
      week: upcomingWeek,
      headline: `Looking ahead to week ${upcomingWeek}`,
      description: 'Capture questions, mood notes, and body signals so the upcoming week feels grounded.',
      focus_points: [
        profile.next_appointment
          ? `Prep notes for your ${new Date(profile.next_appointment).toLocaleDateString()} appointment.`
          : 'List two questions you want to discuss with your care team.',
        profile.emotional_state
          ? `Match your "${profile.emotional_state}" check-in with a partner or journal conversation.`
          : 'Log a short emotional check-in to unlock mood-based support.'
      ]
    }
  ];
};

const buildActionItems = (profile) => {
  if (!profile) return [];
  const items = [];
  const regionLabel = profile.country || 'your area';
  const conditionLabels = extractCustomConditions(profile.medical_conditions);

  if (!profile.has_doctor) {
    items.push({
      id: 'action-find-provider',
      title: `Shortlist prenatal providers in ${regionLabel}`,
      is_completed: false,
      due_on: null
    });
  }

  if (profile.next_appointment) {
    items.push({
      id: 'action-appointment-prep',
      title: 'Prepare questions and documents for your upcoming visit',
      is_completed: false,
      due_on: profile.next_appointment
    });
  }

  if (conditionLabels.length > 0) {
    items.push({
      id: 'action-condition-journal',
      title: `Log symptom notes related to ${conditionLabels.join(', ')}`,
      is_completed: false,
      due_on: null
    });
  }

  if (!items.length) {
    items.push({
      id: 'action-gratitude',
      title: 'Add one gratitude or mood entry for today',
      is_completed: false,
      due_on: null
    });
  }

  items.push({
    id: 'action-hydration',
    title: 'Check in on hydration—aim for steady sips through the day',
    is_completed: false,
    due_on: null
  });

  return items;
};

export const getDashboard = async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId query parameter is required' });
    }

    const onboardingComplete = await hasCompletedOnboarding(userId);
    if (!onboardingComplete) {
      return res.json({ onboardingRequired: true });
    }

    const [profileResult, metricsResult, actionsResult, notificationsResult] = await Promise.all([
      supabaseAdmin
        .from('pregnancy_profiles')
        .select('*')
        .eq('user_id', userId)
        .single(),
      supabaseAdmin
        .from('baby_health_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('week', { ascending: true }),
      supabaseAdmin
        .from('action_items')
        .select('*')
        .eq('user_id', userId)
        .order('due_on', { ascending: true }),
      supabaseAdmin
        .from('important_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    if (profileResult.error && profileResult.status !== 406) {
      throw profileResult.error;
    }

    const profile = profileResult.data || null;
    const metrics = (metricsResult.data || []).length ? metricsResult.data : buildWeeklyMetrics(profile);
    const actionItems = (actionsResult.data || []).length ? actionsResult.data : buildActionItems(profile);
    const notifications = (notificationsResult.data || []).length
      ? notificationsResult.data
      : buildFallbackNotifications(profile);

    // Get today's context to adapt suggestions
    const today = new Date().toISOString().split('T')[0];
    const { data: dailyContext } = await supabaseAdmin
      .from('daily_context')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    const contextForAI = dailyContext ? {
      health_signals: dailyContext.health_signals || [],
      mood_signals: dailyContext.mood_signals || [],
      adaptation_flags: dailyContext.adaptation_flags || {}
    } : null;

    // Generate AI-powered daily meal plan and lifestyle suggestions
    let nutritionSuggestions = [];
    let lifestyleSuggestions = [];
    let moodSummary = null;
    
    if (profile) {
      try {
        const [mealPlan, lifestyleTips, mood] = await Promise.all([
          generateDailyMealPlan(profile, contextForAI),
          generateAdaptedLifestyle(profile, contextForAI),
          generateMoodSummary(profile, contextForAI)
        ]);
        
        moodSummary = mood;
        
        nutritionSuggestions = mealPlan && mealPlan.length > 0 
          ? mealPlan.map(meal => ({
              category: meal.meal.charAt(0).toUpperCase() + meal.meal.slice(1),
              title: meal.dish,
              summary: meal.benefit
            }))
          : buildNutritionSuggestions(profile);
          
        lifestyleSuggestions = lifestyleTips && lifestyleTips.length > 0
          ? lifestyleTips.map(tip => ({
              category: tip.category,
              title: tip.category,
              summary: tip.tip
            }))
          : buildLifestyleSuggestions(profile);
      } catch (aiError) {
        console.error('AI generation failed, using fallback:', aiError);
        nutritionSuggestions = buildNutritionSuggestions(profile);
        lifestyleSuggestions = buildLifestyleSuggestions(profile);
        moodSummary = {
          emoji: '🌸',
          summary: 'Your pregnancy journey is unfolding beautifully. Keep nurturing yourself and baby.',
          needsAttention: false
        };
      }
    } else {
      nutritionSuggestions = buildNutritionSuggestions(profile);
      lifestyleSuggestions = buildLifestyleSuggestions(profile);
      moodSummary = {
        emoji: '✨',
        summary: 'Complete onboarding to unlock your personalized journey insights.',
        needsAttention: false
      };
    }

    const responsePayload = {
      profileSummary: profile,
      weeklyMetrics: metrics,
      careInsights: [],
      actionItems,
      importantNotifications: notifications,
      nutritionSuggestions,
      lifestyleSuggestions,
      moodSummary
    };

    res.json(responsePayload);
  } catch (error) {
    next(error);
  }
};
