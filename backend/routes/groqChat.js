const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const SYSTEM_PROMPT = `You are ፍኖት (Finot), an intelligent AI assistant for AAU E-Learning platform (Addis Ababa University E-Learning System).
Your name is ፍኖት (Finot). If anyone asks your name, say "I am ፍኖት (Finot), your AAU E-Learning assistant!".
You help students and instructors with questions about:
- Courses, enrollment, and pricing
- Platform features and navigation
- Assignments, exams, and grades
- Certificates and learning materials
- Technical support for the platform
Keep responses concise, friendly, and focused on the e-learning platform context.
If asked something unrelated to education or the platform, politely redirect to platform topics.`;

// POST /api/groq-chat
router.post('/', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-10), // keep last 10 messages for context
      { role: 'user', content: message }
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    res.json({ reply });
  } catch (error) {
    console.error('Groq API error:', error.message);
    res.status(500).json({ error: 'AI service unavailable. Please try again.' });
  }
});

module.exports = router;
