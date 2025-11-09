import { supabase } from '../config/supabaseClient.js';
import * as aiService from '../services/aiService.js';

export const getArticles = async (req, res) => {
  try {
    const { user } = req;
    const { category, stage } = req.query;

    let query = supabase
      .from('insights_articles')
      .select('*')
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (stage) {
      query = query.eq('stage', stage);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching insights articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
};

export const generateArticles = async (req, res) => {
  try {
    const { user } = req;

    // Get user's pregnancy profile
    const { data: profile } = await supabase
      .from('pregnancy_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Determine user's stage (pregnancy vs postpartum)
    const stage = profile?.due_date ? 
      (new Date(profile.due_date) < new Date() ? 'postpartum' : 'pregnancy') : 
      'pregnancy';

    // Generate articles based on stage
    const categories = stage === 'postpartum' 
      ? ['breastfeeding', 'baby-care', 'recovery', 'sleep']
      : ['nutrition', 'mental-health', 'baby-care'];

    const generatedArticles = [];

    for (const category of categories) {
      const article = await aiService.generateInsightArticle(user.id, category, stage, profile);
      
      const { data, error } = await supabase
        .from('insights_articles')
        .insert({
          user_id: user.id,
          category,
          title: article.title,
          summary: article.summary,
          content: article.content,
          tags: article.tags || [],
          is_personalized: true,
          stage
        })
        .select()
        .single();

      if (!error && data) {
        generatedArticles.push(data);
      }
    }

    res.json({ success: true, articles: generatedArticles });
  } catch (error) {
    console.error('Error generating articles:', error);
    res.status(500).json({ error: 'Failed to generate articles' });
  }
};
