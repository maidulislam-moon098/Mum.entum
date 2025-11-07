import { supabaseAdmin } from '../config/supabaseClient.js';

const mapQuestion = (question) => ({
  id: question.id,
  slug: question.slug,
  prompt: question.prompt,
  helpText: question.help_text,
  responseType: question.response_type,
  responseOptions: question.response_options,
  isRequired: question.is_required,
  allowAnswerLater: question.allow_answer_later,
  sequence: question.sequence,
  section: question.section,
  dependsOnSlug: question.depends_on_slug,
  dependsOnValues: question.depends_on_values
});

const toArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const normaliseString = (value) =>
  typeof value === 'string' ? value.trim() : value;

const parseNumber = (value) => {
  const numeric = Number(value);
  return Number.isNaN(numeric) ? null : numeric;
};

const parseBooleanFromPhrase = (value) => {
  if (typeof value !== 'string') return null;
  const lowered = value.toLowerCase();
  if (lowered.startsWith('yes')) return true;
  if (lowered.startsWith('no') || lowered.includes('not yet')) return false;
  return null;
};

const containsWord = (value, keyword) =>
  typeof value === 'string' && value.toLowerCase().includes(keyword);

const buildProfileUpdates = (slug, response) => {
  if (response === undefined || response === null) {
    return {};
  }

  const trimmed = normaliseString(response);

  switch (slug) {
    case 'mama-name':
      return { preferred_name: trimmed || null };
    case 'mama-age':
      return { age: parseNumber(response) };
    case 'mama-region':
      return { country: trimmed || null };
    case 'pregnancy-status': {
      const status = trimmed || null;
      const updates = { pregnancy_status: status };
      if (!containsWord(status, 'pregnan')) {
        updates.weeks_pregnant = null;
        updates.current_week = null;
      }
      if (!containsWord(status, 'plan')) {
        updates.planning_window = null;
      }
      return updates;
    }
    case 'pregnancy-weeks': {
      const weeks = parseNumber(response);
      return weeks !== null
        ? { weeks_pregnant: weeks, current_week: weeks }
        : {};
    }
    case 'first-pregnancy':
      return { is_first_pregnancy: parseBooleanFromPhrase(response) };
    case 'pregnancy-complications':
      return { complications: trimmed || null };
    case 'conception-window':
      return { planning_window: trimmed || null };
    case 'medical-conditions': {
      const selections = toArray(response)
        .map((entry) => (typeof entry === 'string' ? entry.trim() : entry))
        .filter(Boolean);

      if (selections.some((entry) => String(entry).toLowerCase() === 'none')) {
        return { medical_conditions: ['None'] };
      }

      const cleaned = selections
        .map((entry) => {
          if (typeof entry !== 'string') return entry;
          if (entry.toLowerCase().startsWith('custom:')) {
            return entry.slice(7).trim();
          }
          if (entry.toLowerCase().startsWith('other:')) {
            return entry.slice(6).trim();
          }
          return entry;
        })
        .filter(Boolean);

      const unique = Array.from(new Set(cleaned));

      return { medical_conditions: unique.length ? unique : null };
    }
    case 'current-meds':
      return { medications: trimmed || null };
    case 'allergies':
      return { allergies: trimmed || null };
    case 'diet-style':
      return { diet_style: trimmed || null };
    case 'food-preferences':
      return { food_preferences: trimmed || null };
    case 'activity-level':
      return { activity_level: trimmed || null };
    case 'substance-use':
      return { substance_use: trimmed || null };
    case 'emotional-checkin':
      return { emotional_state: trimmed || null };
    case 'has-doctor': {
      const hasDoctor = parseBooleanFromPhrase(response);
      const updates = { has_doctor: hasDoctor };
      if (hasDoctor === false) {
        updates.next_appointment = null;
      }
      return updates;
    }
    case 'next-appointment':
      return { next_appointment: trimmed || null };
    case 'emergency-contact':
      return {
        emergency_contact: trimmed ? { raw: trimmed } : null
      };
    case 'blood-group':
      return { blood_group: trimmed || null };
    default:
      return {};
  }
};

const upsertProfile = async (userId, updates) => {
  if (!updates || Object.keys(updates).length === 0) {
    return;
  }

  await supabaseAdmin
    .from('pregnancy_profiles')
    .upsert(
      {
        user_id: userId,
        updated_at: new Date().toISOString(),
        ...updates
      },
      { onConflict: 'user_id' }
    );
};

export const getQuestionTemplate = async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('onboarding_questions')
      .select('*')
      .order('sequence', { ascending: true });

    if (error) throw error;

    res.json({ questions: data.map(mapQuestion) });
  } catch (error) {
    next(error);
  }
};

export const getNextQuestion = async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId query parameter is required' });
    }

    const [{ data: questions, error: questionError }, { data: responses, error: responseError }] = await Promise.all([
      supabaseAdmin
        .from('onboarding_questions')
        .select('*')
        .order('sequence', { ascending: true }),
      supabaseAdmin
        .from('onboarding_responses')
        .select('question_id, status, response_payload')
        .eq('user_id', userId)
    ]);

    if (questionError) throw questionError;
    if (responseError) throw responseError;

    const slugById = new Map((questions || []).map((question) => [question.id, question.slug]));
    const responseBySlug = new Map(
      (responses || [])
        .map((row) => {
          const slug = slugById.get(row.question_id);
          if (!slug) return null;
          return [slug, row];
        })
        .filter(Boolean)
    );

    const dependencySatisfied = (question) => {
      if (!question.depends_on_slug) return true;
      const dependency = responseBySlug.get(question.depends_on_slug);
      if (!dependency || dependency.status !== 'answered') return false;

      const allowedValues = question.depends_on_values || [];
      if (allowedValues.length === 0) return true;

      const value = dependency.response_payload;
      if (Array.isArray(value)) {
        return value.some((item) => allowedValues.includes(String(item)));
      }

      if (value === null || value === undefined) return false;
      return allowedValues.includes(String(value));
    };

    const nextQuestion = (questions || []).find((question) => {
      if (!dependencySatisfied(question)) {
        return false;
      }

      const response = responseBySlug.get(question.slug);
      if (!response) return true;
      if (question.is_required && response.status === 'skipped') return true;
      return false;
    });

    if (!nextQuestion) {
      return res.json({ question: null, completed: true });
    }

    res.json({ question: mapQuestion(nextQuestion), completed: false });
  } catch (error) {
    next(error);
  }
};

export const submitAnswer = async (req, res, next) => {
  try {
    const { userId, questionId, response } = req.body;

    if (!userId || !questionId) {
      return res.status(400).json({ error: 'userId and questionId are required' });
    }

    const { data: question, error: questionError } = await supabaseAdmin
      .from('onboarding_questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (questionError) throw questionError;

    if (question.is_required && (response === null || response === undefined || response === '')) {
      return res.status(400).json({ error: 'Response required for this question' });
    }

    const payload = {
      user_id: userId,
      question_id: questionId,
      response_payload: response,
      status: 'answered'
    };

    const { error } = await supabaseAdmin
      .from('onboarding_responses')
      .upsert(payload, { onConflict: 'user_id,question_id' });

    if (error) throw error;

    const profileUpdates = buildProfileUpdates(question.slug, response);
    await upsertProfile(userId, profileUpdates);

    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const skipQuestion = async (req, res, next) => {
  try {
    const { userId, questionId } = req.body;

    if (!userId || !questionId) {
      return res.status(400).json({ error: 'userId and questionId are required' });
    }

    const { data: question, error: questionError } = await supabaseAdmin
      .from('onboarding_questions')
      .select('is_required')
      .eq('id', questionId)
      .single();

    if (questionError) throw questionError;

    if (question.is_required) {
      return res.status(400).json({ error: 'Cannot skip mandatory question' });
    }

    const { error } = await supabaseAdmin
      .from('onboarding_responses')
      .upsert(
        { user_id: userId, question_id: questionId, response_payload: null, status: 'skipped' },
        { onConflict: 'user_id,question_id' }
      );

    if (error) throw error;

    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
};
