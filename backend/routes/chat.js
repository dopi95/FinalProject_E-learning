const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const User = require('../models/User');
const Course = require('../models/Course');
const auth = require('../middleware/auth');

// Get all chats for current user
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id,
      isActive: true
    })
    .populate('participants', 'name email role profileImage')
    .populate('messages.sender', 'name role')
    .sort({ lastMessage: -1 });

    const chatsWithUnread = chats.map(chat => {
      const otherParticipant = chat.participants.find(p => p._id.toString() !== req.user.id);
      const unreadCount = chat.messages.filter(msg => 
        msg.sender._id.toString() !== req.user.id && 
        !msg.readBy.some(read => read.user.toString() === req.user.id)
      ).length;

      return {
        ...chat.toObject(),
        otherParticipant,
        unreadCount,
        lastMessageText: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content : ''
      };
    });

    res.json(chatsWithUnread);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get or create chat with specific user (course-related only)
router.post('/start', auth, async (req, res) => {
  try {
    const { participantId } = req.body;
    
    if (participantId === req.user.id) {
      return res.status(400).json({ message: 'Cannot start chat with yourself' });
    }

    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.user.id);
    
    // Validate course relationship
    let hasRelationship = false;
    
    if (currentUser.role === 'student' && participant.role === 'instructor') {
      // Check if student is enrolled in instructor's course
      const course = await Course.findOne({
        instructor: participantId,
        students: req.user.id,
        isActive: true
      });
      hasRelationship = !!course;
    } else if (currentUser.role === 'instructor' && participant.role === 'student') {
      // Check if instructor teaches student's course
      const course = await Course.findOne({
        instructor: req.user.id,
        students: participantId,
        isActive: true
      });
      hasRelationship = !!course;
    }
    
    if (!hasRelationship) {
      return res.status(403).json({ message: 'Can only message users from your courses' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user.id, participantId] },
      isActive: true
    }).populate('participants', 'name email role profileImage');

    if (!chat) {
      chat = new Chat({
        participants: [req.user.id, participantId]
      });
      await chat.save();
      await chat.populate('participants', 'name email role profileImage');
    }

    const otherParticipant = chat.participants.find(p => p._id.toString() !== req.user.id);
    
    res.json({
      ...chat.toObject(),
      otherParticipant
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send message
router.post('/:chatId/messages', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }

    const newMessage = {
      sender: req.user.id,
      content: content.trim()
    };

    chat.messages.push(newMessage);
    chat.lastMessage = new Date();
    await chat.save();

    await chat.populate('messages.sender', 'name role');
    const addedMessage = chat.messages[chat.messages.length - 1];

    res.json(addedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark messages as read
router.put('/:chatId/read', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Mark unread messages as read
    chat.messages.forEach(message => {
      if (message.sender.toString() !== req.user.id && 
          !message.readBy.some(read => read.user.toString() === req.user.id)) {
        message.readBy.push({ user: req.user.id });
      }
    });

    await chat.save();
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get chat messages
router.get('/:chatId/messages', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('messages.sender', 'name role profileImage');
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(chat.messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get users to start chat with (course-related only)
router.get('/users', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    let users = [];
    
    if (currentUser.role === 'student') {
      // Students can only message instructors of their enrolled courses
      const enrolledCourses = await Course.find({
        students: req.user.id,
        isActive: true
      }).populate('instructor', 'name email role profileImage department specialization');
      
      users = enrolledCourses.map(course => course.instructor);
      // Remove duplicates if student is enrolled in multiple courses by same instructor
      users = users.filter((instructor, index, self) => 
        index === self.findIndex(i => i._id.toString() === instructor._id.toString())
      );
    } else if (currentUser.role === 'instructor') {
      // Instructors can only message students from their courses
      const taughtCourses = await Course.find({
        instructor: req.user.id,
        isActive: true
      }).populate('students', 'name email role profileImage department specialization');
      
      users = taughtCourses.flatMap(course => course.students);
      // Remove duplicates if student is enrolled in multiple courses by same instructor
      users = users.filter((student, index, self) => 
        index === self.findIndex(s => s._id.toString() === student._id.toString())
      );
    }

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete message
router.delete('/messages/:messageId', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      'messages._id': req.params.messageId,
      participants: req.user.id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const message = chat.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Remove the message completely
    chat.messages.pull(req.params.messageId);
    
    // Update lastMessage if this was the last message
    if (chat.messages.length > 0) {
      chat.lastMessage = chat.messages[chat.messages.length - 1].createdAt;
    } else {
      chat.lastMessage = chat.createdAt;
    }
    
    await chat.save();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update message
router.put('/messages/:messageId', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    const chat = await Chat.findOne({
      'messages._id': req.params.messageId,
      participants: req.user.id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const message = chat.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only allow sender to edit their own message
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Can only edit your own messages' });
    }

    message.content = content.trim();
    message.edited = true;
    message.editedAt = new Date();
    
    await chat.save();
    res.json({ message: 'Message updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get unread message count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id,
      isActive: true
    });

    let totalUnread = 0;
    chats.forEach(chat => {
      const unreadCount = chat.messages.filter(msg => 
        msg.sender.toString() !== req.user.id && 
        !msg.readBy.some(read => read.user.toString() === req.user.id)
      ).length;
      totalUnread += unreadCount;
    });

    res.json({ count: totalUnread });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete entire chat
router.delete('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete the entire chat document
    await Chat.findByIdAndDelete(req.params.chatId);
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;