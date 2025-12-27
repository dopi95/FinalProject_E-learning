const axios = require('axios');

class EmailService {
  constructor() {
    this.apiKey = process.env.BREVO_API_KEY;
    this.baseURL = 'https://api.brevo.com/v3';
  }

  async sendEmail(to, subject, htmlContent) {
    try {
      console.log('Sending email to:', to);
      const response = await axios.post(
        `${this.baseURL}/smtp/email`,
        {
          sender: {
            name: 'AAU E-Learning',
            email: process.env.BREVO_EMAIL
          },
          to: [{ email: to }],
          subject,
          htmlContent
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': this.apiKey
          }
        }
      );
      console.log('Email sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Email sending error:', error.response?.data || error.message);
      // Don't throw error to prevent registration failure
      return { success: false, error: error.message };
    }
  }

  async sendOTPEmail(email, otp, name) {
    const subject = 'Email Verification - AAU E-Learning';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to AAU E-Learning!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering with AAU E-Learning. Please verify your email address using the OTP below:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't create this account, please ignore this email.</p>
        <p>Best regards,<br>AAU E-Learning Team</p>
      </div>
    `;
    return await this.sendEmail(email, subject, htmlContent);
  }

  async sendPasswordResetEmail(email, otp, name) {
    const subject = 'Password Reset - AAU E-Learning';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>You requested to reset your password. Use the OTP below to reset your password:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #dc3545; font-size: 32px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>AAU E-Learning Team</p>
      </div>
    `;
    return await this.sendEmail(email, subject, htmlContent);
  }
}

module.exports = new EmailService();