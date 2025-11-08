import OpenAI from 'openai';

const buildPrompt = (messages, profileSummary) => {
  const intro = profileSummary
    ? `The following information describes the user's pregnancy profile: ${JSON.stringify(profileSummary)}.`
    : 'No additional profile information was provided.';

  return [
    {
      role: 'system',
      content:
  'You are Mum.entum, a warm and evidence-informed companion for expecting mothers. Provide empathetic guidance, avoid medical diagnosis, and encourage users to consult healthcare professionals.'
    },
    { role: 'system', content: intro },
    ...messages
  ];
};

import { generateChatResponse, analyzeContext, generateActionItems } from '../services/aiService.js';
import { supabaseAdmin } from '../config/supabaseClient.js';

export const chat = async (req, res, next) => {
  try {
    const { messages, profileSummary, userId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Get the user's last message
    const userMessage = messages[messages.length - 1]?.content || '';

    // Generate AI response
    const reply = await generateChatResponse(messages, profileSummary);

    // Analyze context in the background (don't block response)
    if (userId && userMessage) {
      analyzeAndStoreContext(userId, userMessage, profileSummary).catch(err => {
        console.error('Background context analysis failed:', err);
      });
    }

    res.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: error.message || 'Unable to process your message. Please try again.' 
    });
  }
};

/**
 * Analyze user message and store daily context
 */
async function analyzeAndStoreContext(userId, userMessage, profileSummary) {
  try {
    const analysis = await analyzeContext(userMessage, profileSummary);
    
    // Only store if there are meaningful signals
    if (analysis.healthSignals.length === 0 && analysis.moodSignals.length === 0) {
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    // Get or create today's context
    const { data: existing } = await supabaseAdmin
      .from('daily_context')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    const healthSignals = existing 
      ? [...new Set([...existing.health_signals, ...analysis.healthSignals])]
      : analysis.healthSignals;
    const moodSignals = existing
      ? [...new Set([...existing.mood_signals, ...analysis.moodSignals])]
      : analysis.moodSignals;
    
    const adaptationFlags = {
      ...existing?.adaptation_flags,
      needsAdaptation: analysis.needsAdaptation || existing?.adaptation_flags?.needsAdaptation,
      adaptationType: analysis.adaptationType !== 'none' ? analysis.adaptationType : existing?.adaptation_flags?.adaptationType,
      severity: analysis.severity
    };

    if (existing) {
      await supabaseAdmin
        .from('daily_context')
        .update({
          health_signals: healthSignals,
          mood_signals: moodSignals,
          last_chat_summary: userMessage,
          adaptation_flags: adaptationFlags
        })
        .eq('id', existing.id);
    } else {
      await supabaseAdmin
        .from('daily_context')
        .insert({
          user_id: userId,
          date: today,
          health_signals: healthSignals,
          mood_signals: moodSignals,
          last_chat_summary: userMessage,
          adaptation_flags: adaptationFlags
        });
    }

    // Generate AI-powered action items for the detected issues
    if (analysis.needsAdaptation && profileSummary) {
      const actionItems = await generateActionItems(profileSummary, {
        health_signals: healthSignals,
        mood_signals: moodSignals
      });

      // Insert action items into database
      if (actionItems.length > 0) {
        const itemsToInsert = actionItems.map(item => ({
          user_id: userId,
          title: item.title,
          is_completed: false,
          category: item.category,
          created_at: new Date().toISOString()
        }));

        await supabaseAdmin
          .from('action_items')
          .insert(itemsToInsert);
      }
    }
  } catch (error) {
    console.error('Failed to analyze and store context:', error);
  }
}
