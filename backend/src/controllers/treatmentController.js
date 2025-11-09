import { supabase } from '../config/supabaseClient.js';

export const getRecommendations = async (req, res) => {
  try {
    const { user } = req;

    const { data, error } = await supabase
      .from('treatment_recommendations')
      .select('*')
      .eq('user_id', user.id)
      .eq('acknowledged', false)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching treatment recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
};

export const acknowledgeRecommendation = async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('treatment_recommendations')
      .update({ acknowledged: true })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error acknowledging recommendation:', error);
    res.status(500).json({ error: 'Failed to acknowledge recommendation' });
  }
};

export const createRecommendation = async (req, res) => {
  try {
    const { user } = req;
    const {
      title,
      description,
      risk_level,
      category,
      recommended_actions,
      expires_at
    } = req.body;

    const { data, error } = await supabase
      .from('treatment_recommendations')
      .insert({
        user_id: user.id,
        title,
        description,
        risk_level,
        category,
        recommended_actions,
        expires_at
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error creating treatment recommendation:', error);
    res.status(500).json({ error: 'Failed to create recommendation' });
  }
};
