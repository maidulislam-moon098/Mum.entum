import { OpenAI } from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY
});

const MODEL = 'llama-3.3-70b-versatile';

/**
 * Generate smart action items based on health/mood context
 */
export const generateActionItems = async (profile, context) => {
  try {
    if (!context || (!context.health_signals?.length && !context.mood_signals?.length)) {
      return [];
    }

    const week = profile.current_week || profile.weeks_pregnant || 20;
    const healthIssues = context.health_signals?.join(', ') || '';
    const moodIssues = context.mood_signals?.join(', ') || '';
    
    const prompt = `User in week ${week} pregnancy reported today:
    Health: ${healthIssues}
    Mood: ${moodIssues}
    
    Generate 2-4 specific, actionable checklist items they can do TODAY to help with these issues.
    Make each item:
    - Specific and measurable ("Take 200mg magnesium supplement" not "Take supplements")
    - Realistic for a pregnant person
    - Directly helpful for their symptoms
    - Friendly and supportive tone
    
    Format as JSON array:
    [
      {
        "title": "specific action item with friendly tone",
        "category": "health" or "wellness" or "nutrition"
      }
    ]`;
    
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a supportive pregnancy companion. Generate helpful, specific action items. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 500
    });

    const response = completion.choices[0].message.content.trim();
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error('Action items generation error:', error);
    return [];
  }
};

/**
 * Analyze chat message for health and mood signals
 */
export const analyzeContext = async (userMessage, profileSummary) => {
  try {
    const prompt = `Analyze this message from a pregnant person: "${userMessage}"
    
    Detect if they mention:
    1. Physical symptoms (dizziness, nausea, pain, fatigue, headache, etc.)
    2. Emotional state (depression, anxiety, stress, happiness, etc.)
    3. Dietary concerns or cravings
    4. Activity/movement issues
    
    Respond with JSON only:
    {
      "healthSignals": ["symptom1", "symptom2"],
      "moodSignals": ["emotion1", "emotion2"],
      "needsAdaptation": true/false,
      "adaptationType": "nutrition" or "lifestyle" or "both" or "none",
      "severity": "low" or "moderate" or "high"
    }`;
    
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a medical context analyzer. Return only valid JSON, no other text.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 300
    });

    const response = completion.choices[0].message.content.trim();
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      healthSignals: [],
      moodSignals: [],
      needsAdaptation: false,
      adaptationType: 'none',
      severity: 'low'
    };
  } catch (error) {
    console.error('Context analysis error:', error);
    return {
      healthSignals: [],
      moodSignals: [],
      needsAdaptation: false,
      adaptationType: 'none',
      severity: 'low'
    };
  }
};

/**
 * Generate daily meal plan (breakfast, lunch, dinner)
 */
export const generateDailyMealPlan = async (profile, context = null) => {
  try {
    const week = profile.current_week || profile.weeks_pregnant || 20;
    const country = profile.country || 'general';
    const diet = profile.diet_style || 'balanced';
    const allergies = profile.allergies || 'none';
    
    let adaptationNote = '';
    if (context && context.health_signals && context.health_signals.length > 0) {
      adaptationNote = `\n\nIMPORTANT: User reported these symptoms today: ${context.health_signals.join(', ')}. 
      Adjust meals to help with these symptoms.`;
    }
    if (context && context.mood_signals && context.mood_signals.length > 0) {
      adaptationNote += `\nMood signals: ${context.mood_signals.join(', ')}. Consider mood-boosting foods.`;
    }
    
    const prompt = `Generate TODAY's meal plan for week ${week} pregnancy in ${country}.
    Diet: ${diet}
    Allergies: ${allergies}${adaptationNote}
    
    Create 3 meals (breakfast, lunch, dinner) with:
    - Dish name using local/regional cuisine
    - Brief benefit (one sentence)
    - Specific to pregnancy week and dietary needs
    
    Format as JSON array:
    [
      {
        "meal": "breakfast",
        "dish": "dish name",
        "benefit": "why it helps today"
      },
      {
        "meal": "lunch",
        "dish": "dish name",
        "benefit": "why it helps today"
      },
      {
        "meal": "dinner",
        "dish": "dish name",
        "benefit": "why it helps today"
      }
    ]`;
    
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a prenatal nutrition expert. Generate culturally appropriate, practical meal suggestions. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 600
    });

    const response = completion.choices[0].message.content.trim();
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error('Meal plan generation error:', error);
    return [];
  }
};

/**
 * Generate lifestyle suggestions adapted to current context
 */
export const generateAdaptedLifestyle = async (profile, context = null) => {
  try {
    const week = profile.current_week || profile.weeks_pregnant || 20;
    const activity = profile.activity_level || 'moderate';
    
    let adaptationNote = '';
    if (context && context.health_signals && context.health_signals.length > 0) {
      adaptationNote = `\n\nUser reported: ${context.health_signals.join(', ')}. 
      Adapt activities to be safe and helpful for these symptoms.`;
    }
    if (context && context.mood_signals && context.mood_signals.length > 0) {
      adaptationNote += `\nMood: ${context.mood_signals.join(', ')}. Include mood-supportive activities.`;
    }
    
    const prompt = `Generate 2-3 lifestyle tips for TODAY for week ${week} pregnancy.
    Activity level: ${activity}${adaptationNote}
    
    Cover movement, rest, and emotional wellbeing.
    Keep each tip practical and brief (one sentence).
    
    Format as JSON array:
    [
      {
        "category": "Movement" or "Rest" or "Wellbeing",
        "tip": "specific actionable suggestion"
      }
    ]`;
    
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a pregnancy wellness coach. Give safe, practical lifestyle tips. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 400
    });

    const response = completion.choices[0].message.content.trim();
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error('Lifestyle generation error:', error);
    return [];
  }
};

/**
 * Generate AI chat response based on conversation history and user profile
 */
export const generateChatResponse = async (messages, profileSummary) => {
  try {
    const systemPrompt = buildSystemPrompt(profileSummary);
    
    const chatCompletion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const rawResponse = chatCompletion.choices[0].message.content;
    
    // Strip <think>...</think> tags from the response
    const cleanedResponse = rawResponse.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    
    return cleanedResponse;
  } catch (error) {
    console.error('AI chat error:', error);
    throw new Error('Unable to generate AI response. Please try again.');
  }
};

/**
 * Generate personalized nutrition suggestions based on profile
 */
export const generateNutritionSuggestions = async (profile) => {
  try {
    const prompt = buildNutritionPrompt(profile);
    
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a compassionate prenatal nutrition expert. Provide evidence-based, culturally sensitive nutrition advice.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 600
    });

    return parseNutritionResponse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Nutrition AI error:', error);
    return null;
  }
};

/**
 * Generate lifestyle suggestions based on activity level and emotional state
 */
export const generateLifestyleSuggestions = async (profile) => {
  try {
    const prompt = buildLifestylePrompt(profile);
    
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a gentle pregnancy wellness coach. Provide supportive, safe lifestyle and movement guidance.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 600
    });

    return parseLifestyleResponse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Lifestyle AI error:', error);
    return null;
  }
};

/**
 * Generate mood-based check-in questions
 */
export const generateMoodQuestions = async (emotionalState, currentWeek) => {
  try {
    const prompt = `The user is in week ${currentWeek} of pregnancy and recently described their emotional state as "${emotionalState}". 
    Generate 2-3 gentle, supportive check-in questions that help them reflect on their wellbeing. 
    Focus on validated mental health practices for pregnancy. Keep questions warm and non-judgmental.
    Format as a JSON array of strings.`;
    
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a compassionate mental health professional specializing in maternal wellness.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    return parseMoodQuestions(completion.choices[0].message.content);
  } catch (error) {
    console.error('Mood questions AI error:', error);
    return [];
  }
};

/**
 * Generate personalized notification based on profile context
 */
export const generateNotification = async (context, profile) => {
  try {
    const prompt = `Based on this context: "${context}"
    User profile: Week ${profile.current_week || profile.weeks_pregnant}, ${profile.country || 'location not specified'}, 
    Diet: ${profile.diet_style || 'not specified'}, Activity: ${profile.activity_level || 'not specified'}
    
    Generate a short, actionable notification (max 100 characters) that feels personal and helpful.`;
    
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a helpful pregnancy assistant. Create concise, actionable notifications.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Notification AI error:', error);
    return null;
  }
};

// Helper functions

function buildSystemPrompt(profileSummary) {
  if (!profileSummary) {
    return `You are a warm, supportive companion for someone going through pregnancy. Talk naturally like a caring friend who happens to know about pregnancy. Keep your responses SHORT (2-4 sentences max).
    
    Important rules:
    - Be conversational and calm, not overly enthusiastic
    - Answer what they ask - don't give unsolicited pregnancy advice
    - You can talk about anything - life, feelings, random topics, not just pregnancy
    - Only mention pregnancy stuff if they bring it up
    - No bullet points, no "###" headings, no emojis unless natural
    - Sound human, not like a medical guide
    - DON'T ask questions at the end unless the conversation naturally needs it
    - Just respond and be supportive - no need to keep probing`;
  }

  const week = profileSummary.current_week || profileSummary.weeks_pregnant || 'unknown';
  const country = profileSummary.country || 'their region';
  const diet = profileSummary.diet_style || 'balanced';
  
  return `You are a warm, supportive companion for someone in week ${week} of pregnancy in ${country}. Talk naturally like a caring friend who happens to know about pregnancy. Keep your responses SHORT (2-4 sentences max).
  
  Important rules:
  - Be conversational and calm, not overly enthusiastic or clinical
  - Answer what they ask - don't give unsolicited pregnancy advice
  - You can talk about anything - life, feelings, random topics, not just pregnancy
  - Only mention pregnancy-specific stuff if they bring it up or it's relevant
  - No bullet points, no "###" headings, no excessive emojis
  - Sound human and relatable, not like a medical textbook
  - Keep it brief and natural
  - DON'T ask questions at the end of every message - just answer and be supportive
  - Only ask a question if the conversation genuinely needs clarification`;
}

function buildNutritionPrompt(profile) {
  const week = profile.current_week || profile.weeks_pregnant || 20;
  const country = profile.country || 'their region';
  const diet = profile.diet_style || 'balanced';
  const allergies = profile.allergies || 'none';
  const conditions = profile.medical_conditions || [];
  
  return `Generate 3 specific nutrition tips for a person in week ${week} of pregnancy in ${country}.
  Diet style: ${diet}
  Allergies: ${allergies}
  Medical conditions: ${Array.isArray(conditions) ? conditions.join(', ') : conditions}
  
  For each tip, provide:
  1. A category (e.g., "Iron-rich foods", "Hydration", "Folate boost")
  2. A brief title
  3. A 2-3 sentence practical suggestion using locally available foods
  
  Format as JSON array with objects: [{ "category": "", "title": "", "summary": "" }]`;
}

function buildLifestylePrompt(profile) {
  const week = profile.current_week || profile.weeks_pregnant || 20;
  const activity = profile.activity_level || 'moderate';
  const emotional = profile.emotional_state || 'balanced';
  
  return `Generate 3 lifestyle wellness tips for week ${week} of pregnancy.
  Current activity level: ${activity}
  Emotional state: ${emotional}
  
  Cover: movement/exercise, rest/sleep, and emotional wellbeing.
  For each tip, provide:
  1. A category
  2. A brief title
  3. A 2-3 sentence gentle, actionable suggestion
  
  Format as JSON array with objects: [{ "category": "", "title": "", "summary": "" }]`;
}

function parseNutritionResponse(content) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error('Failed to parse nutrition response:', error);
    return [];
  }
}

function parseLifestyleResponse(content) {
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error('Failed to parse lifestyle response:', error);
    return [];
  }
}

function parseMoodQuestions(content) {
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error('Failed to parse mood questions:', error);
    return [];
  }
}

/**
 * Generate mood emoji and summary for dashboard
 */
export const generateMoodSummary = async (profile, context = null) => {
  try {
    const week = profile.current_week || profile.weeks_pregnant || 20;
    const name = profile.preferred_name || 'Mum';
    
    let healthContext = '';
    let moodContext = '';
    
    if (context?.health_signals?.length) {
      healthContext = `Recent symptoms: ${context.health_signals.join(', ')}`;
    }
    if (context?.mood_signals?.length) {
      moodContext = `Recent mood: ${context.mood_signals.join(', ')}`;
    }
    
    const prompt = `You are analyzing ${name}'s overall pregnancy journey in week ${week}.
    
    ${healthContext}
    ${moodContext}
    ${!healthContext && !moodContext ? 'No recent health or mood signals reported.' : ''}
    
    Consider:
    - Overall pregnancy stage (week ${week} of 40)
    - Recent patterns, not just today
    - General wellbeing across the journey
    
    Create a VERY SHORT (1-2 sentences max), warm, supportive summary that reflects their OVERALL situation and journey progress, not just today's mood.
    - Focus on the bigger picture of their pregnancy experience
    - If there are patterns of concern, gently acknowledge
    - If progressing well overall, celebrate that
    - Keep it calm, hopeful, and reassuring
    
    Pick ONE emoji that represents their OVERALL pregnancy journey state:
    - 😊 journey going smoothly overall
    - 😌 peaceful and balanced journey
    - 😓 experiencing ongoing challenges
    - 🤗 needing extra support through this phase
    - 💪 feeling strong and resilient
    - 😴 managing fatigue but doing well
    - 🌸 blooming beautifully
    - ✨ feeling magical and connected
    
    Return JSON only:
    {
      "emoji": "😊",
      "summary": "Your 1-2 sentence summary about overall journey here.",
      "needsAttention": true/false
    }`;
    
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a warm, supportive pregnancy companion analyzing overall journey progress. Focus on the big picture, not daily fluctuations. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    const response = completion.choices[0].message.content.trim();
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback
    return {
      emoji: '😊',
      summary: 'Your pregnancy journey is unfolding beautifully. Keep nurturing yourself and baby.',
      needsAttention: false
    };
  } catch (error) {
    console.error('Mood summary generation error:', error);
    return {
      emoji: '😊',
      summary: 'Your pregnancy journey is unfolding beautifully. Keep nurturing yourself and baby.',
      needsAttention: false
    };
  }
};

/**
 * Generate personalized insight articles for pregnancy and postpartum
 */
export const generateInsightArticle = async (userId, category, stage, profile) => {
  try {
    const week = profile?.current_week || profile?.weeks_pregnant || 20;
    const dietStyle = profile?.diet_style || 'balanced';
    const activityLevel = profile?.activity_level || 'moderate';

    let categoryContext = '';
    switch (category) {
      case 'breastfeeding':
        categoryContext = 'Breastfeeding tips, latch techniques, milk supply, common challenges and solutions';
        break;
      case 'baby-care':
        categoryContext = 'Baby care basics, diapering, bathing, sleep schedules, developmental milestones';
        break;
      case 'recovery':
        categoryContext = 'Postpartum recovery, physical healing, pelvic floor exercises, C-section care';
        break;
      case 'nutrition':
        categoryContext = `Pregnancy nutrition for ${dietStyle} diet, meal planning, key nutrients`;
        break;
      case 'mental-health':
        categoryContext = 'Mental wellness, stress management, postpartum mood, emotional support';
        break;
      case 'sleep':
        categoryContext = 'Sleep patterns, baby sleep training, maternal rest, sleep deprivation coping';
        break;
      default:
        categoryContext = 'General pregnancy and postpartum wellness';
    }

    const stageContext = stage === 'postpartum' 
      ? 'New mother caring for newborn baby'
      : `Pregnant at week ${week}`;

    const prompt = `Write a comprehensive, evidence-based article about ${categoryContext} for a ${stageContext}.

    User context:
    - Stage: ${stage}
    ${stage === 'pregnancy' ? `- Current week: ${week}` : ''}
    - Diet: ${dietStyle}
    - Activity level: ${activityLevel}

    Create an article that is:
    - Warm, supportive and encouraging
    - Evidence-based with practical tips
    - Personalized to their stage and preferences
    - 400-600 words
    - Includes specific actionable advice

    Format as JSON:
    {
      "title": "engaging article title",
      "summary": "2-3 sentence overview",
      "content": "full article content with paragraphs separated by newlines",
      "tags": ["tag1", "tag2", "tag3"]
    }`;

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are an expert maternal health educator. Write helpful, accurate, supportive articles. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) throw new Error('Empty AI response');

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Article generation error:', error);
    // Return fallback article
    return {
      title: `Understanding ${category.replace('-', ' ')}`,
      summary: `Essential guidance for ${stage === 'postpartum' ? 'new mothers' : 'pregnancy'}.`,
      content: `This is an important topic in your journey. We recommend consulting with your healthcare provider for personalized advice tailored to your specific situation.`,
      tags: [category, stage]
    };
  }
};

