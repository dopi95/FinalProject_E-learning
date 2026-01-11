const express = require('express');
const router = express.Router();
const ChatHistory = require('../models/ChatHistory');
const auth = require('../middleware/auth');

// Get all chat sessions for a user
router.get('/', auth, async (req, res) => {
  try {
    const chatSessions = await ChatHistory.find({ 
      userId: req.user.id,
      isActive: true 
    })
    .select('sessionId title lastActivity createdAt messages')
    .sort({ lastActivity: -1 });

    // Add message count and preview
    const sessionsWithPreview = chatSessions.map(session => ({
      ...session.toObject(),
      messageCount: session.messages.length,
      lastMessage: session.messages.length > 0 ? 
        session.messages[session.messages.length - 1].text.substring(0, 50) + '...' : 
        'No messages'
    }));

    res.json(sessionsWithPreview);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get specific chat session
router.get('/:sessionId', auth, async (req, res) => {
  try {
    const chatSession = await ChatHistory.findOne({
      sessionId: req.params.sessionId,
      userId: req.user.id,
      isActive: true
    });

    if (!chatSession) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    res.json(chatSession);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new chat session
router.post('/', auth, async (req, res) => {
  try {
    const { sessionId, title } = req.body;
    
    const newChatSession = new ChatHistory({
      userId: req.user.id,
      sessionId: sessionId || `chat_${Date.now()}`,
      title: title || 'New Chat',
      messages: []
    });

    await newChatSession.save();
    res.status(201).json(newChatSession);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add message to chat session
router.post('/:sessionId/messages', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    let chatSession = await ChatHistory.findOne({
      sessionId: req.params.sessionId,
      userId: req.user.id,
      isActive: true
    });

    if (!chatSession) {
      // Create new session if it doesn't exist
      chatSession = new ChatHistory({
        userId: req.user.id,
        sessionId: req.params.sessionId,
        title: message.text.substring(0, 30) + '...',
        messages: []
      });
    }

    chatSession.messages.push(message);
    
    // Update title based on first user message if it's still default
    if (chatSession.title === 'New Chat' && message.sender === 'user') {
      chatSession.title = message.text.substring(0, 30) + (message.text.length > 30 ? '...' : '');
    }

    await chatSession.save();
    res.json(chatSession);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update chat session title
router.put('/:sessionId/title', auth, async (req, res) => {
  try {
    const { title } = req.body;
    
    const chatSession = await ChatHistory.findOneAndUpdate(
      {
        sessionId: req.params.sessionId,
        userId: req.user.id,
        isActive: true
      },
      { title },
      { new: true }
    );

    if (!chatSession) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    res.json(chatSession);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete specific chat session
router.delete('/:sessionId', auth, async (req, res) => {
  try {
    const chatSession = await ChatHistory.findOneAndUpdate(
      {
        sessionId: req.params.sessionId,
        userId: req.user.id,
        isActive: true
      },
      { isActive: false },
      { new: true }
    );

    if (!chatSession) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    res.json({ message: 'Chat session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete all chat sessions for user
router.delete('/', auth, async (req, res) => {
  try {
    await ChatHistory.updateMany(
      { userId: req.user.id, isActive: true },
      { isActive: false }
    );

    res.json({ message: 'All chat sessions deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;