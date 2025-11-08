import { supabaseAdmin } from '../config/supabaseClient.js';

/**
 * Toggle action item completion status
 */
export const toggleActionItem = async (req, res, next) => {
  try {
    const { itemId, userId, isCompleted } = req.body;

    if (!itemId || !userId || typeof isCompleted !== 'boolean') {
      return res.status(400).json({ error: 'itemId, userId, and isCompleted are required' });
    }

    const { data, error } = await supabaseAdmin
      .from('action_items')
      .update({ is_completed: isCompleted })
      .eq('id', itemId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, item: data });
  } catch (error) {
    console.error('Toggle action item error:', error);
    next(error);
  }
};

/**
 * Delete an action item
 */
export const deleteActionItem = async (req, res, next) => {
  try {
    const { itemId, userId } = req.body;

    if (!itemId || !userId) {
      return res.status(400).json({ error: 'itemId and userId are required' });
    }

    const { error } = await supabaseAdmin
      .from('action_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Delete action item error:', error);
    next(error);
  }
};
