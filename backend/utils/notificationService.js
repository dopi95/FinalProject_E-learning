const Notification = require('../models/Notification');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');

class NotificationService {
  // Send notification when schedule is created by program office
  static async notifyScheduleCreated(schedule, createdBy) {
    try {
      const course = schedule.course;
      
      // Get all enrolled students
      const enrollments = await Enrollment.find({ 
        course: course._id, 
        status: 'active' 
      }).populate('user', '_id');
      
      // Get course instructor
      const instructor = await User.findById(course.instructor);
      
      // Prepare recipients (students + instructor)
      const recipients = [];
      
      // Add students
      enrollments.forEach(enrollment => {
        recipients.push({
          user: enrollment.user._id,
          read: false
        });
      });
      
      // Add instructor
      if (instructor) {
        recipients.push({
          user: instructor._id,
          read: false
        });
      }
      
      if (recipients.length > 0) {
        await Notification.create({
          title: 'New Schedule Created',
          message: `A new schedule has been created for "${course.title}" by the Program Office.`,
          sender: createdBy,
          recipients,
          targetRole: 'all',
          type: 'info',
          course: course._id
        });
      }
    } catch (error) {
      console.error('Error sending schedule creation notification:', error);
    }
  }

  // Send notification when schedule is updated by program office
  static async notifyScheduleUpdated(schedule, updatedBy) {
    try {
      const course = schedule.course;
      
      // Get all enrolled students
      const enrollments = await Enrollment.find({ 
        course: course._id, 
        status: 'active' 
      }).populate('user', '_id');
      
      // Get course instructor
      const instructor = await User.findById(course.instructor);
      
      // Prepare recipients (students + instructor)
      const recipients = [];
      
      // Add students
      enrollments.forEach(enrollment => {
        recipients.push({
          user: enrollment.user._id,
          read: false
        });
      });
      
      // Add instructor
      if (instructor) {
        recipients.push({
          user: instructor._id,
          read: false
        });
      }
      
      if (recipients.length > 0) {
        await Notification.create({
          title: 'Schedule Updated',
          message: `The schedule for "${course.title}" has been updated by the Program Office.`,
          sender: updatedBy,
          recipients,
          targetRole: 'all',
          type: 'warning',
          course: course._id
        });
      }
    } catch (error) {
      console.error('Error sending schedule update notification:', error);
    }
  }

  // Send notification when instructor updates schedule (session links)
  static async notifyInstructorScheduleUpdate(schedule, instructor) {
    try {
      const course = schedule.course;
      
      // Get all enrolled students
      const enrollments = await Enrollment.find({ 
        course: course._id, 
        status: 'active' 
      }).populate('user', '_id');
      
      // Prepare recipients (only students)
      const recipients = enrollments.map(enrollment => ({
        user: enrollment.user._id,
        read: false
      }));
      
      if (recipients.length > 0) {
        await Notification.create({
          title: 'Session Link Updated',
          message: `The instructor has updated session information for "${course.title}".`,
          sender: instructor,
          recipients,
          targetRole: 'student',
          type: 'info',
          course: course._id
        });
      }
    } catch (error) {
      console.error('Error sending instructor schedule update notification:', error);
    }
  }

  // Send notification when schedule update request is approved
  static async notifyScheduleUpdateApproved(updateRequest, approvedBy) {
    try {
      const course = updateRequest.course;
      
      // Notify the instructor who requested the update
      await Notification.create({
        title: 'Schedule Update Approved',
        message: `Your schedule update request for "${course.title}" has been approved by the Program Office.`,
        sender: approvedBy,
        recipients: [{
          user: updateRequest.requestedBy,
          read: false
        }],
        targetRole: 'instructor',
        type: 'success',
        course: course._id
      });

      // Notify all enrolled students about the schedule change
      const enrollments = await Enrollment.find({ 
        course: course._id, 
        status: 'active' 
      }).populate('user', '_id');
      
      const studentRecipients = enrollments.map(enrollment => ({
        user: enrollment.user._id,
        read: false
      }));
      
      if (studentRecipients.length > 0) {
        await Notification.create({
          title: 'Schedule Changed',
          message: `The schedule for "${course.title}" has been updated and approved.`,
          sender: approvedBy,
          recipients: studentRecipients,
          targetRole: 'student',
          type: 'warning',
          course: course._id
        });
      }
    } catch (error) {
      console.error('Error sending schedule update approval notification:', error);
    }
  }

  // Send notification when schedule update request is rejected
  static async notifyScheduleUpdateRejected(updateRequest, rejectedBy, reason) {
    try {
      const course = updateRequest.course;
      
      // Notify the instructor who requested the update
      await Notification.create({
        title: 'Schedule Update Rejected',
        message: `Your schedule update request for "${course.title}" has been rejected by the Program Office. Reason: ${reason}`,
        sender: rejectedBy,
        recipients: [{
          user: updateRequest.requestedBy,
          read: false
        }],
        targetRole: 'instructor',
        type: 'error',
        course: course._id
      });
    } catch (error) {
      console.error('Error sending schedule update rejection notification:', error);
    }
  }
}

module.exports = NotificationService;