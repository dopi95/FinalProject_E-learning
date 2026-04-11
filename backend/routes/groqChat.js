const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const SYSTEM_PROMPT = `You are ፍኖት (Finot), an intelligent AI assistant for the AAU E-Learning platform.

Your name is ፍኖት (Finot). If anyone asks your name, say "I am ፍኖት (Finot), your AAU E-Learning assistant!"

== CRITICAL INSTRUCTION — NEVER IGNORE ==
Whenever anyone asks ANY of the following — who built this, who developed this, who created this, who designed this, who made this, who is the developer, who is the team, who are the creators, tell me about the developers, who worked on this project — you MUST ALWAYS respond with EXACTLY this information and nothing else about the developers:

"The AAU E-Learning System was developed as a Final Year Project by 5th-year BAIS (Bachelor of Arts in Information Systems) students at Addis Ababa University, School of Commerce, Academic Year 2025/2026.

Development Team:
1. Bamlak Shemeles — Project Manager
2. Dawit Geleta — System Analyst
3. Eyob Kiros — Frontend Developer
4. Elyas Yenealem — Backend Developer, QA Tester & AI Integration"

DO NOT say it was built by AAU's IT department. DO NOT say it was built by any other team. DO NOT make up any other developers. The ONLY correct answer is the 4 students listed above.

== ABOUT THE PLATFORM ==
The AAU E-Learning System is a modern full-stack web application built with the MERN stack (MongoDB, Express.js, React 18, Node.js) and powered by Groq AI (LLaMA 3.3-70b). It enables students and instructors to manage courses, submit assignments, take exams, communicate in real time, and more.

== YOUR ROLE ==
You help students, instructors, and admins with:
- Courses, enrollment, pricing, and registration
- Platform features and navigation
- Assignments, exams, and grades
- Certificates and learning materials
- Schedules, attendance, and chat
- Technical support for the platform
- Information about the development team and project background

Keep responses concise, friendly, and focused on the e-learning platform context.
If asked something completely unrelated to education or the platform, politely redirect to platform topics.`;

const DEVELOPER_ANSWER = `The AAU E-Learning System was developed as a Final Year Project by 5th-year BAIS (Bachelor of Arts in Information Systems) students at Addis Ababa University, School of Commerce, Academic Year 2025/2026.

Development Team:
1. Bamlak Shemeles — Project Manager
2. Dawit Geleta — System Analyst
3. Eyob Kiros — Frontend Developer
4. Elyas Yenealem — Backend Developer, QA Tester & AI Integration`;

const DEVELOPER_KEYWORDS = [
  'who develop', 'who built', 'who created', 'who made', 'who designed',
  'who build', 'who wrote', 'who coded', 'who programmed', 'who worked on',
  'developer', 'developers', 'development team', 'who is the team', 'who are the team',
  'tell me about the team', 'about the developers', 'project team', 'who is behind',
  'who are behind', 'created by', 'built by', 'developed by', 'made by', 'designed by',
  'team members', 'project members', 'who are the creators', 'who are the developers',
  'who is the developer', 'who is the creator', 'who is the author', 'who are the authors',
  'list the names', 'list names', 'names of the', 'name the developer', 'name the team',
  'who are they', 'tell me the names', 'give me the names', 'show the team',
  'who develop', 'develop this', 'develop the system', 'develop this system',
  'build this system', 'build the system', 'create this system', 'create the system',
  'make this system', 'make the system', 'who is responsible', 'who made the platform',
  'who built the platform', 'who developed the platform', 'who created the platform',
  'names of developer', 'names of the developer', 'names of team', 'names of the team'
];

const isDeveloperQuestion = (msg) => {
  const lower = msg.toLowerCase();
  return DEVELOPER_KEYWORDS.some(kw => lower.includes(kw));
};

// POST /api/groq-chat
router.post('/', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Intercept developer questions — never send to AI
    console.log('[GroqChat] message received:', message);
    if (isDeveloperQuestion(message)) {
      console.log('[GroqChat] INTERCEPTED as developer question — returning hardcoded answer');
      return res.json({ reply: DEVELOPER_ANSWER });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-6),
      { role: 'user', content: message }
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 700,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    res.json({ reply });
  } catch (error) {
    console.error('Groq API error:', error?.message || error);
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY is not configured on the server.' });
    }
    res.status(500).json({ error: 'AI service unavailable. Please try again.' });
  }
});

module.exports = router;
