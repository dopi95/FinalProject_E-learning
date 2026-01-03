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

  async sendNewsletter(emails, subject, content) {
    const results = [];
    for (const email of emails) {
      try {
        const result = await this.sendEmail(email, subject, content);
        results.push({ email, success: true, result });
      } catch (error) {
        results.push({ email, success: false, error: error.message });
      }
    }
    return results;
  }

  async sendNewCourseNotificationToStudents(email, courseName, instructorName) {
    const subject = 'New Course Available - AAU E-Learning';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Course Available!</h2>
        <p>Hello,</p>
        <p>We're excited to announce a new course has been added to AAU E-Learning:</p>
        <div style="background-color: #f4f4f4; padding: 20px; margin: 20px 0; border-left: 4px solid #007bff;">
          <h3 style="color: #007bff; margin: 0 0 10px 0;">${courseName}</h3>
          <p style="margin: 0; color: #666;">Instructor: ${instructorName}</p>
        </div>
        <p>Visit our platform to learn more and enroll in this exciting new course!</p>
        <p>Best regards,<br>AAU E-Learning Team</p>
      </div>
    `;
    return await this.sendEmail(email, subject, htmlContent);
  }

  async sendInstructorAssignmentEmail(email, courseName, instructorName) {
    const subject = 'Course Assignment - AAU E-Learning';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Course Assignment Notification</h2>
        <p>Hello ${instructorName},</p>
        <p>You have been assigned as the instructor for a new course:</p>
        <div style="background-color: #f4f4f4; padding: 20px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="color: #28a745; margin: 0 0 10px 0;">${courseName}</h3>
          <p style="margin: 0; color: #666;">You are now the assigned instructor for this course.</p>
        </div>
        <p>Please log in to your instructor dashboard to manage this course.</p>
        <p>Best regards,<br>AAU E-Learning Team</p>
      </div>
    `;
    return await this.sendEmail(email, subject, htmlContent);
  }

  async sendInstructorUnassignmentEmail(email, courseName, instructorName) {
    const subject = 'Course Unassignment - AAU E-Learning';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Course Unassignment Notification</h2>
        <p>Hello ${instructorName},</p>
        <p>You are no longer assigned as the instructor for the following course:</p>
        <div style="background-color: #f4f4f4; padding: 20px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <h3 style="color: #dc3545; margin: 0 0 10px 0;">${courseName}</h3>
          <p style="margin: 0; color: #666;">A new instructor has been assigned to this course.</p>
        </div>
        <p>Thank you for your previous contributions to this course.</p>
        <p>Best regards,<br>AAU E-Learning Team</p>
      </div>
    `;
    return await this.sendEmail(email, subject, htmlContent);
  }

  async sendEnrollmentConfirmationEmail(email, studentName, courseName, instructorName) {
    const subject = 'Course Enrollment Confirmation - AAU E-Learning';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Enrollment Confirmation</h2>
        <p>Hello ${studentName},</p>
        <p>Congratulations! You have successfully enrolled in:</p>
        <div style="background-color: #f4f4f4; padding: 20px; margin: 20px 0; border-left: 4px solid #007bff;">
          <h3 style="color: #007bff; margin: 0 0 10px 0;">${courseName}</h3>
          <p style="margin: 0; color: #666;">Instructor: ${instructorName}</p>
        </div>
        <p>You can now access your course materials and start learning!</p>
        <p>Best regards,<br>AAU E-Learning Team</p>
      </div>
    `;
    return await this.sendEmail(email, subject, htmlContent);
  }

  async sendReviewApprovedEmail(email, userName, reviewMessage) {
    const subject = 'Review Approved - AAU E-Learning';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Review Approved!</h2>
        <p>Hello ${userName},</p>
        <p>Great news! Your review has been approved and is now visible on our platform:</p>
        <div style="background-color: #f4f4f4; padding: 20px; margin: 20px 0; border-left: 4px solid #28a745;">
          <p style="margin: 0; color: #666; font-style: italic;">${reviewMessage}</p>
        </div>
        <p>Thank you for sharing your feedback with the AAU E-Learning community!</p>
        <p>Best regards,<br>AAU E-Learning Team</p>
      </div>
    `;
    return await this.sendEmail(email, subject, htmlContent);
  }

  async sendReviewRejectedEmail(email, userName, reviewMessage) {
    const subject = 'Review Update - AAU E-Learning';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Review Update</h2>
        <p>Hello ${userName},</p>
        <p>We've reviewed your submission, but unfortunately it doesn't meet our community guidelines:</p>
        <div style="background-color: #f4f4f4; padding: 20px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <p style="margin: 0; color: #666; font-style: italic;">${reviewMessage}</p>
        </div>
        <p>You're welcome to submit a new review that follows our guidelines.</p>
        <p>Best regards,<br>AAU E-Learning Team</p>
      </div>
    `;
    return await this.sendEmail(email, subject, htmlContent);
  }

  async sendReviewDeletedEmail(email, userName) {
    const subject = 'Review Removed - AAU E-Learning';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Review Removed</h2>
        <p>Hello ${userName},</p>
        <p>Your review has been removed from the AAU E-Learning platform.</p>
        <p>If you have any questions about this action, please contact our support team.</p>
        <p>Best regards,<br>AAU E-Learning Team</p>
      </div>
    `;
    return await this.sendEmail(email, subject, htmlContent);
  }
}

module.exports = new EmailService();