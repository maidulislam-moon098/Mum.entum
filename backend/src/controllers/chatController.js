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

export const chatWithAssistant = async (req, res, next) => {
  try {
    const { messages = [], profileSummary = null } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        reply:
          'Hi! I am Mum.entum. I can offer general wellness tips once the care team enables the AI service. Meanwhile, explore your dashboard for personalized insights.'
      });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: buildPrompt(messages, profileSummary),
      max_tokens: 400,
      temperature: 0.5
    });

    const reply = response.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(502).json({ error: 'No chat response generated' });
    }

    res.json({ reply });
  } catch (error) {
    next(error);
  }
};
