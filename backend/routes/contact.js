const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');
const brevo = require('@getbrevo/brevo');

// Configure Brevo API
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

// Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    const contact = new Contact({
      name,
      email,
      subject,
      message
    });
    
    await contact.save();
    
    res.status(201).json({ 
      message: 'Contact message sent successfully',
      contact 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all contact messages (SuperAdmin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const contacts = await Contact.find()
      .populate('replies.repliedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ contacts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reply to contact message
router.post('/:id/reply', auth, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { replyMessage } = req.body;
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }
    
    // Update contact with reply
    contact.replies.push({
      message: replyMessage,
      repliedBy: req.user.id,
      repliedAt: new Date()
    });
    contact.status = 'replied';
    
    await contact.save();
    
    // Send email reply using Brevo
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: contact.email, name: contact.name }];
    sendSmtpEmail.sender = { email: process.env.BREVO_EMAIL, name: 'AAU E-Learning Team' };
    sendSmtpEmail.subject = `Re: ${contact.subject}`;
    sendSmtpEmail.htmlContent = `
      <h3>Thank you for contacting AAU E-Learning</h3>
      <p>Dear ${contact.name},</p>
      <p>We have received your message and here is our response:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <strong>Your Message:</strong><br>
        ${contact.message}
      </div>
      <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <strong>Our Response:</strong><br>
        ${replyMessage}
      </div>
      <p>Best regards,<br>AAU E-Learning Team</p>
    `;
    
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    res.json({ 
      message: 'Reply sent successfully',
      contact: await Contact.findById(req.params.id).populate('replies.repliedBy', 'name email')
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;