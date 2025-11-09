import { supabase } from '../config/supabaseClient.js';

export const saveHealthData = async (req, res) => {
  try {
    const { user } = req;
    const {
      blood_pressure_systolic,
      blood_pressure_diastolic,
      weight_kg,
      symptoms,
      symptom_notes,
      mood
    } = req.body;

    const today = new Date().toISOString().split('T')[0];

    // Upsert (insert or update) today's health data
    const { data, error } = await supabase
      .from('health_tracking')
      .upsert({
        user_id: user.id,
        date: today,
        blood_pressure_systolic,
        blood_pressure_diastolic,
        weight_kg,
        symptoms,
        symptom_notes,
        mood,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,date'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error saving health data:', error);
    res.status(500).json({ error: 'Failed to save health data' });
  }
};

export const getLatestHealthData = async (req, res) => {
  try {
    const { user } = req;
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('health_tracking')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching latest health data:', error);
    res.status(500).json({ error: 'Failed to fetch health data' });
  }
};

export const getHealthHistory = async (req, res) => {
  try {
    const { user } = req;
    const { days = 30 } = req.query;

    const { data, error } = await supabase
      .from('health_tracking')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(days);

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching health history:', error);
    res.status(500).json({ error: 'Failed to fetch health history' });
  }
};
