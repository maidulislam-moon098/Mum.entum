import { supabaseAdmin } from '../config/supabaseClient.js';

/**
 * Update user profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { userId, updates } = req.body;

    if (!userId || !updates) {
      return res.status(400).json({ error: 'userId and updates are required' });
    }

    // Allowed fields to update
    const allowedFields = [
      'preferred_name',
      'baby_nickname',
      'due_date',
      'current_week',
      'age',
      'country',
      'diet_style',
      'food_preferences',
      'activity_level',
      'emotional_state',
      'allergies',
      'medical_conditions',
      'medications',
      'has_doctor',
      'next_appointment',
      'blood_group',
      'notes'
    ];

    // Filter updates to only allowed fields
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    filteredUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('pregnancy_profiles')
      .update(filteredUpdates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, profile: data });
  } catch (error) {
    console.error('Update profile error:', error);
    next(error);
  }
};
