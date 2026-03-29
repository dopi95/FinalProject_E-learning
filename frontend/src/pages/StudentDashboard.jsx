import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, Award, Calendar, TrendingUp, LogOut, User, CreditCard, FileText, Video, Download, Bell, BellRing, BellOff, Clock, CheckCircle, GraduationCap, Home, Camera, X, Eye, EyeOff, Star, Globe, Heart, Settings, MapPin, MessageCircle, Upload } from 'lucide-react';
import { profileAPI, enrollmentAPI, paymentAPI, subscriptionAPI, notificationAPI, assignmentAPI, attendanceAPI } from '../services/api';
import PopupNotification from '../components/PopupNotification';
import CourseMaterials from '../components/CourseMaterials';
import ChatInterface from '../components/ChatInterface';
import { getUserData, updateUserData, clearUserData } from '../utils/userUtils';
import StudentExams from '../components/StudentExams';
import { useTranslation } from 'react-i18next';

const StudentDashboard = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [showCoursesSubmenu, setShowCoursesSubmenu] = useState(false);
  const [showCourseResourcesSubmenu, setShowCourseResourcesSubmenu] = useState(false);
  const [grades, setGrades] = useState([]);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [showGradeDetail, setShowGradeDetail] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSubscribeMenu, setShowSubscribeMenu] = useState(false);
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  // Admin notifications state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showTodayAnnouncement, setShowTodayAnnouncement] = useState(false);
  const [todayClasses, setTodayClasses] = useState([]);
  const [timeUpdate, setTimeUpdate] = useState(0);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinModalData, setJoinModalData] = useState(null);

  // Assignment state
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showAssignmentDetail, setShowAssignmentDetail] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [activeAssignmentTab, setActiveAssignmentTab] = useState('pending');

  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification state
  const [notification, setNotification] = useState({
    isVisible: false,
    type: 'success',
    title: '',
    message: ''
  });

  const showNotification = (type, title, message) => {
    setNotification({
      isVisible: true,
      type,
      title,
      message
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setLoading(true);
        const response = await profileAPI.uploadImage(file);
        const updatedUser = response.data.user;
        
        setProfileImage(response.data.profileImage);
        setUser(updatedUser);
        setProfileForm(updatedUser);
        setShowImageOptions(false);
        
        // Update stored user data
        updateUserData(updatedUser);
        
        showNotification('success', 'Success!', 'Profile image updated successfully');
      } catch (error) {
        console.error('Image upload error:', error);
        showNotification('error', 'Upload Failed', error.response?.data?.message || 'Failed to upload image');
      } finally {
        setLoading(false);
      }
    }
  };

  const removeImage = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.removeImage();
      const updatedUser = response.data.user;
      
      setProfileImage(null);
      setUser(updatedUser);
      setProfileForm(updatedUser);
      setShowImageOptions(false);
      
      // Update stored user data
      updateUserData(updatedUser);
      
      showNotification('success', 'Success!', 'Profile image removed successfully');
    } catch (error) {
      console.error('Remove image error:', error);
      showNotification('error', 'Remove Failed', error.response?.data?.message || 'Failed to remove image');
    } finally {
      setLoading(false);
    }
  };

  // Play notification sound
  // Handle file download
  const handleDownloadFile = async (fileUrl, fileName) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status}`);
      }
      
      // Get the raw array buffer to preserve file integrity
      const arrayBuffer = await response.arrayBuffer();
      
      if (arrayBuffer.byteLength === 0) {
        throw new Error('File is empty');
      }
      
      // Get content type from response headers
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      
      // Create blob with proper content type from array buffer
      const blob = new Blob([arrayBuffer], { type: contentType });
      
      // Force download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification('success', 'Downloaded', `${fileName} downloaded successfully`);
    } catch (error) {
      console.error('Download error:', error);
      showNotification('error', 'Download Failed', error.message || 'Failed to download file');
    } finally {
      setLoading(false);
    }
  };

  // Handle assignment file download
  const handleDownloadAssignmentFile = async (assignmentId, fileName) => {
    try {
      setLoading(true);
      
      // Get file info from backend
      const response = await assignmentAPI.downloadAssignment(assignmentId);
      const fileData = response.data.file;
      
      // Use the working download pattern
      const token = localStorage.getItem('token');
      const downloadResponse = await fetch(fileData.url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!downloadResponse.ok) {
        throw new Error(`Failed to download file: ${downloadResponse.status}`);
      }
      
      // Get the raw array buffer to preserve file integrity
      const arrayBuffer = await downloadResponse.arrayBuffer();
      
      if (arrayBuffer.byteLength === 0) {
        throw new Error('File is empty');
      }
      
      // Get content type from response headers or file data
      const contentType = downloadResponse.headers.get('content-type') || fileData.fileType || 'application/octet-stream';
      
      // Create blob with proper content type from array buffer
      const blob = new Blob([arrayBuffer], { type: contentType });
      
      // Force download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification('success', 'Downloaded', `${fileName} downloaded successfully`);
    } catch (error) {
      console.error('Download error:', error);
      showNotification('error', 'Download Failed', error.message || 'Failed to download file');
    } finally {
      setLoading(false);
    }
  };

  // Handle submission file download
  const handleDownloadSubmissionFile = async (assignmentId, fileName) => {
    try {
      setLoading(true);
      
      // Get file info from backend
      const response = await assignmentAPI.downloadStudentSubmission(assignmentId);
      const fileData = response.data.file;
      
      // Use the working download pattern
      const token = localStorage.getItem('token');
      const downloadResponse = await fetch(fileData.url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!downloadResponse.ok) {
        throw new Error(`Failed to download file: ${downloadResponse.status}`);
      }
      
      // Get the raw array buffer to preserve file integrity
      const arrayBuffer = await downloadResponse.arrayBuffer();
      
      if (arrayBuffer.byteLength === 0) {
        throw new Error('File is empty');
      }
      
      // Get content type from response headers or file data
      const contentType = downloadResponse.headers.get('content-type') || fileData.fileType || 'application/octet-stream';
      
      // Create blob with proper content type from array buffer
      const blob = new Blob([arrayBuffer], { type: contentType });
      
      // Force download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification('success', 'Downloaded', `${fileName} downloaded successfully`);
    } catch (error) {
      console.error('Download error:', error);
      showNotification('error', 'Download Failed', error.message || 'Failed to download file');
    } finally {
      setLoading(false);
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Check if AudioContext is allowed
      if (audioContext.state === 'suspended') {
        return; // Don't play sound if not allowed
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a pleasant notification sound (two-tone chime)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.15);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.3);
      
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      // Silently fail if audio is not supported or blocked
      console.log('Audio notification blocked by browser');
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const response = await notificationAPI.getMyNotifications();
      const newNotifications = response.data.notifications;
      const newUnreadCount = response.data.unreadCount;
      
      // Check if there are new notifications since last fetch
      const hasNewNotifications = newUnreadCount > (notifications.filter(n => !n.read).length);
      
      setNotifications(newNotifications);
      setHasNewNotifications(newUnreadCount > 0);
      
      // Play notification sound if there are new notifications
      if (hasNewNotifications && newUnreadCount > 0) {
        playNotificationSound();
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Mark notification as read error:', error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setHasNewNotifications(false);
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Delete notification error:', error);
    }
  };

  const playSound = (type) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'subscribe') {
      oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
    } else {
      oscillator.frequency.setValueAtTime(784, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(523, audioContext.currentTime + 0.2);
    }
    
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const toggleSubscription = async () => {
    try {
      setLoading(true);
      if (isSubscribed) {
        await subscriptionAPI.unsubscribe(user.email);
        setIsSubscribed(false);
        playSound('unsubscribe');
        showToast('Unsubscribed successfully!', 'orange');
      } else {
        await subscriptionAPI.subscribe(user.email);
        setIsSubscribed(true);
        playSound('subscribe');
        showToast('Subscribed successfully!', 'green');
      }
      setShowSubscribeMenu(false);
    } catch (error) {
      console.error('Subscription error:', error);
      showToast(error.response?.data?.message || 'Something went wrong', 'red');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, color) => {
    const toast = document.createElement('div');
    toast.className = `fixed top-24 right-4 z-50 px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 transform translate-x-full`;
    
    // Set background color based on the color parameter
    if (color === 'green') {
      toast.style.backgroundColor = '#10b981'; // green-500
    } else if (color === 'red' || color === 'orange') {
      toast.style.backgroundColor = '#ef4444'; // red-500
    } else {
      toast.style.backgroundColor = '#3b82f6'; // blue-500
    }
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
  };

  const fetchPayments = async () => {
    try {
      setPaymentsLoading(true);
      const response = await paymentAPI.getMyPayments();
      setPayments(response.data.data);
    } catch (error) {
      console.error('Fetch payments error:', error);
      showNotification('error', 'Error', 'Failed to fetch payments');
    } finally {
      setPaymentsLoading(false);
    }
  };

  const handleViewReceipt = async (paymentId) => {
    try {
      const response = await paymentAPI.getReceipt(paymentId);
      const payment = response.data.data;
      
      const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Payment Receipt - ${payment.receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: white; }
            .receipt { max-width: 800px; margin: 0 auto; background: white; position: relative; }
            .diagonal-stamp { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 80px; font-weight: bold; color: rgba(34, 197, 94, 0.3); pointer-events: none; z-index: 10; }
            .payment-stamp { position: absolute; top: 20px; right: 20px; z-index: 20; text-align: center; }
            .payment-stamp img { width: 40px; height: 40px; object-fit: contain; margin-bottom: 5px; }
            .payment-stamp p { font-size: 12px; font-weight: bold; color: #374151; text-transform: uppercase; margin: 0; }
            .header { border-bottom: 2px solid #000; padding: 40px; text-align: center; }
            .header img { height: 64px; width: auto; margin-bottom: 16px; }
            .header h1 { font-size: 24px; font-weight: bold; color: #000; margin: 0 0 4px 0; }
            .header p { color: #374151; margin: 0 0 16px 0; }
            .receipt-no { text-align: right; font-size: 14px; color: #6b7280; }
            .body { padding: 40px; }
            .section { margin-bottom: 40px; }
            .section h3 { font-size: 18px; font-weight: bold; color: #000; margin-bottom: 16px; border-bottom: 1px solid #d1d5db; padding-bottom: 8px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .info-row span:first-child { color: #6b7280; }
            .info-row span:last-child { color: #000; font-weight: 500; }
            .course-details { background: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 40px; }
            .course-header { display: flex; justify-content: space-between; align-items: flex-start; }
            .course-info h4 { font-size: 18px; font-weight: bold; color: #000; margin: 0 0 8px 0; }
            .course-info p { color: #6b7280; margin: 0 0 8px 0; }
            .course-price { text-align: right; }
            .course-price .amount { font-size: 24px; font-weight: bold; color: #000; }
            .course-price .type { font-size: 14px; color: #6b7280; }
            .summary { background: #f9fafb; padding: 24px; border-radius: 8px; }
            .summary-row { display: flex; justify-content: space-between; margin-bottom: 16px; }
            .summary-row.total { border-top: 1px solid #d1d5db; padding-top: 16px; font-weight: bold; }
            .summary-row.total .amount { font-size: 24px; }
            .footer { border-top: 1px solid #d1d5db; padding-top: 40px; margin-top: 40px; text-align: center; font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="diagonal-stamp">PAID</div>
            
            <div class="payment-stamp">
              <img src="${window.location.origin}/assets/images/${payment.paymentMethod === 'telebirr' ? 'telebirrlogo.png' : 'cbe.png'}" alt="${payment.paymentMethod}">
              <p>${payment.paymentMethod === 'telebirr' ? 'Telebirr' : 'CBE'}</p>
            </div>
            
            <div class="header">
              <img src="${window.location.origin}/assets/images/aaulogo.png" alt="AAU Logo">
              <h1>AAU E-Learning</h1>
              <p>Addis Ababa University</p>
              <div class="receipt-no">Receipt No: ${payment.receiptNumber}</div>
            </div>
            
            <div class="body">
              <div class="info-grid">
                <div class="section">
                  <h3>Student Information</h3>
                  <div class="info-row">
                    <span>Name:</span>
                    <span>${payment.user.name}</span>
                  </div>
                  <div class="info-row">
                    <span>Email:</span>
                    <span>${payment.user.email}</span>
                  </div>
                  <div class="info-row">
                    <span>Student ID:</span>
                    <span>${payment.user.studentId || payment.user.systemId || payment.user._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div class="info-row">
                    <span>Gender:</span>
                    <span>${payment.user.gender ? payment.user.gender.charAt(0).toUpperCase() + payment.user.gender.slice(1) : 'Not specified'}</span>
                  </div>
                </div>
                
                <div class="section">
                  <h3>Payment Information</h3>
                  <div class="info-row">
                    <span>Date:</span>
                    <span>${new Date(payment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div class="info-row">
                    <span>Method:</span>
                    <span>${payment.paymentMethod === 'telebirr' ? 'Telebirr' : payment.paymentMethod === 'cbe' ? 'CBE' : payment.paymentMethod}</span>
                  </div>
                  <div class="info-row">
                    <span>Transaction ID:</span>
                    <span>${payment.transactionId}</span>
                  </div>
                </div>
              </div>
              
              <div class="section">
                <h3>Course Details</h3>
                <div class="course-details">
                  <div class="course-header">
                    <div class="course-info">
                      <h4>${payment.isBulk ? 'Courses Details' : 'Course Details'}</h4>
                      ${payment.isBulk ? 
                        payment.courses.map(course => `
                          <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                              <div>
                                <h5 style="font-size: 16px; font-weight: bold; color: #000; margin: 0 0 8px 0;">${course.title}</h5>
                                <p style="color: #6b7280; margin: 0 0 8px 0;">Instructor: ${course.instructor?.name || 'Instructor'}</p>
                              </div>
                              <div style="text-align: right;">
                                <div style="font-size: 20px; font-weight: bold; color: #000;">${course.price} ETB</div>
                              </div>
                            </div>
                          </div>
                        `).join('') :
                        `<div style="display: flex; justify-content: space-between; align-items: flex-start;">
                          <div>
                            <h5 style="font-size: 18px; font-weight: bold; color: #000; margin: 0 0 8px 0;">${payment.course.title}</h5>
                            <p style="color: #6b7280; margin: 0 0 8px 0;">Instructor: ${payment.course.instructor?.name || 'Instructor'}</p>
                            <p style="font-size: 14px; color: #6b7280;">Certificate of Completion Included</p>
                          </div>
                          <div style="text-align: right;">
                            <div style="font-size: 24px; font-weight: bold; color: #000;">${payment.amount} ETB</div>
                            <div style="font-size: 14px; color: #6b7280;">One-time payment</div>
                          </div>
                        </div>`
                      }
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="summary">
                <div class="summary-row">
                  <span>Subtotal:</span>
                  <span>${payment.amount} ETB</span>
                </div>
                <div class="summary-row">
                  <span>Tax:</span>
                  <span>0.00 ETB</span>
                </div>
                <div class="summary-row total">
                  <span style="font-size: 20px;">Total Paid:</span>
                  <span class="amount">${payment.amount} ETB</span>
                </div>
              </div>
              
              <div class="footer">
                <p>Thank you for choosing AAU E-Learning Platform!</p>
                <p>For support, contact us at support@aau-elearning.edu.et</p>
                <p style="margin-top: 16px; font-size: 12px;">This is an official receipt generated on ${new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      
      const blob = new Blob([receiptHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error('View receipt error:', error);
      showNotification('error', 'Error', 'Failed to load receipt');
    }
  };

  const handleDownloadReceipt = async (paymentId) => {
    try {
      const response = await paymentAPI.getReceipt(paymentId);
      const payment = response.data.data;
      
      // Create a temporary element for html2pdf
      const receiptElement = document.createElement('div');
      receiptElement.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background: white; position: relative;">
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 80px; font-weight: bold; color: rgba(34, 197, 94, 0.3); pointer-events: none; z-index: 10;">PAID</div>
          
          <div style="position: absolute; top: 20px; right: 20px; z-index: 20; text-align: center;">
            <img src="/assets/images/${payment.paymentMethod === 'telebirr' ? 'telebirrlogo.png' : 'cbe.png'}" alt="${payment.paymentMethod}" style="width: 40px; height: 40px; object-fit: contain; margin-bottom: 5px;">
            <p style="font-size: 12px; font-weight: bold; color: #374151; text-transform: uppercase; margin: 0;">
              ${payment.paymentMethod === 'telebirr' ? 'Telebirr' : 'CBE'}
            </p>
          </div>
          
          <div style="border-bottom: 2px solid #000; padding: 40px; text-align: center;">
            <img src="/assets/images/aaulogo.png" alt="AAU Logo" style="height: 64px; width: auto; margin-bottom: 16px;">
            <h1 style="font-size: 24px; font-weight: bold; color: #000; margin: 0 0 4px 0;">AAU E-Learning</h1>
            <p style="color: #374151; margin: 0 0 16px 0;">Addis Ababa University</p>
            <div style="text-align: right; font-size: 14px; color: #6b7280;">Receipt No: ${payment.receiptNumber}</div>
          </div>
          
          <div style="padding: 40px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
              <div>
                <h3 style="font-size: 18px; font-weight: bold; color: #000; margin-bottom: 16px; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">Student Information</h3>
                <div style="margin-bottom: 8px; display: flex; justify-content: space-between;"><span style="color: #6b7280;">Name:</span><span style="color: #000; font-weight: 500;">${payment.user.name}</span></div>
                <div style="margin-bottom: 8px; display: flex; justify-content: space-between;"><span style="color: #6b7280;">Email:</span><span style="color: #000; font-weight: 500;">${payment.user.email}</span></div>
                <div style="margin-bottom: 8px; display: flex; justify-content: space-between;"><span style="color: #6b7280;">Student ID:</span><span style="color: #000; font-weight: 500;">${payment.user.studentId || payment.user.systemId || payment.user._id.slice(-8).toUpperCase()}</span></div>
                <div style="margin-bottom: 8px; display: flex; justify-content: space-between;"><span style="color: #6b7280;">Gender:</span><span style="color: #000; font-weight: 500;">${payment.user.gender ? payment.user.gender.charAt(0).toUpperCase() + payment.user.gender.slice(1) : 'Not specified'}</span></div>
              </div>
              
              <div>
                <h3 style="font-size: 18px; font-weight: bold; color: #000; margin-bottom: 16px; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">Payment Information</h3>
                <div style="margin-bottom: 8px; display: flex; justify-content: space-between;"><span style="color: #6b7280;">Date:</span><span style="color: #000; font-weight: 500;">${new Date(payment.createdAt).toLocaleDateString()}</span></div>
                <div style="margin-bottom: 8px; display: flex; justify-content: space-between;"><span style="color: #6b7280;">Method:</span><span style="color: #000; font-weight: 500;">${payment.paymentMethod === 'telebirr' ? 'Telebirr' : payment.paymentMethod === 'cbe' ? 'CBE' : payment.paymentMethod}</span></div>
                <div style="margin-bottom: 8px; display: flex; justify-content: space-between;"><span style="color: #6b7280;">Transaction ID:</span><span style="color: #000; font-weight: 500;">${payment.transactionId}</span></div>
              </div>
            </div>
            
            <div style="margin-bottom: 40px;">
              <h3 style="font-size: 18px; font-weight: bold; color: #000; margin-bottom: 16px; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">${payment.isBulk ? 'Courses Details' : 'Course Details'}</h3>
              <div style="background: #f9fafb; padding: 24px; border-radius: 8px;">
                ${payment.isBulk ? 
                  payment.courses.map(course => `
                    <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb;">
                      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                          <h4 style="font-size: 18px; font-weight: bold; color: #000; margin: 0 0 8px 0;">${course.title}</h4>
                          <p style="color: #6b7280; margin: 0 0 8px 0;">Instructor: ${course.instructor?.name || 'Instructor'}</p>
                        </div>
                        <div style="text-align: right;">
                          <div style="font-size: 20px; font-weight: bold; color: #000;">${course.price} ETB</div>
                        </div>
                      </div>
                    </div>
                  `).join('') :
                  `<div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                      <h4 style="font-size: 18px; font-weight: bold; color: #000; margin: 0 0 8px 0;">${payment.course.title}</h4>
                      <p style="color: #6b7280; margin: 0 0 8px 0;">Instructor: ${payment.course.instructor?.name || 'Instructor'}</p>
                      <p style="font-size: 14px; color: #6b7280; margin: 0;">Certificate of Completion Included</p>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 24px; font-weight: bold; color: #000;">${payment.amount} ETB</div>
                      <div style="font-size: 14px; color: #6b7280;">One-time payment</div>
                    </div>
                  </div>`
                }
              </div>
            </div>
            
            <div style="background: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 40px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 16px;"><span>Subtotal:</span><span>${payment.amount} ETB</span></div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 16px;"><span>Tax:</span><span>0.00 ETB</span></div>
              <div style="border-top: 1px solid #d1d5db; padding-top: 16px; display: flex; justify-content: space-between; font-weight: bold;">
                <span style="font-size: 20px;">Total Paid:</span>
                <span style="font-size: 24px;">${payment.amount} ETB</span>
              </div>
            </div>
            
            <div style="border-top: 1px solid #d1d5db; padding-top: 40px; text-align: center; font-size: 14px; color: #6b7280;">
              <p>Thank you for choosing AAU E-Learning Platform!</p>
              <p>For support, contact us at support@aau-elearning.edu.et</p>
              <p style="margin-top: 16px; font-size: 12px;">This is an official receipt generated on ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(receiptElement);
      
      // Use html2pdf to generate PDF
      const opt = {
        margin: 0.5,
        filename: `receipt-${payment.receiptNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf().set(opt).from(receiptElement).save();
      
      document.body.removeChild(receiptElement);
      
      showNotification('success', 'Downloaded', 'Receipt downloaded as PDF');
    } catch (error) {
      console.error('Download receipt error:', error);
      showNotification('error', 'Error', 'Failed to download receipt');
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await enrollmentAPI.getMyCourses();
      const activeCourses = response.data.courses || [];
      setEnrolledCourses(activeCourses);
    } catch (error) {
      console.error('Fetch enrolled courses error:', error);
      setEnrolledCourses([]);
      showNotification('error', 'Error', 'Failed to fetch enrolled courses');
    } finally {
      setCoursesLoading(false);
    }
  };

  // Helper function to format due date with time remaining
  const formatDueDate = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due - now;
    
    if (diffMs <= 0) {
      return {
        text: `Due: ${due.toLocaleString()} (OVERDUE)`,
        isOverdue: true,
        timeLeft: null
      };
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    let timeLeftText = '';
    if (diffDays > 0) {
      timeLeftText = `${diffDays}d ${diffHours % 24}h left`;
    } else if (diffHours > 0) {
      timeLeftText = `${diffHours}h ${diffMinutes}m left`;
    } else {
      timeLeftText = `${diffMinutes}m left`;
    }
    
    return {
      text: `Due: ${due.toLocaleString()} (${timeLeftText})`,
      isOverdue: false,
      timeLeft: timeLeftText
    };
  };

  const fetchAssignments = async () => {
    try {
      setAssignmentsLoading(true);
      const response = await assignmentAPI.getStudentAssignments();
      const assignments = response.data.assignments || [];
      
      // Remove direct Cloudinary URLs to prevent browser access
      const sanitizedAssignments = assignments.map(assignment => ({
        ...assignment,
        file: assignment.file ? {
          ...assignment.file,
          fileUrl: null // Remove direct URL
        } : null,
        submission: assignment.submission ? {
          ...assignment.submission,
          file: assignment.submission.file ? {
            ...assignment.submission.file,
            fileUrl: null // Remove direct URL
          } : null
        } : null
      }));
      
      setAssignments(sanitizedAssignments);
    } catch (error) {
      console.error('Fetch assignments error:', error);
      setAssignments([]);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!submissionFile) {
      showNotification('error', 'Error', 'Please select a file to submit');
      return;
    }

    try {
      setLoading(true);
      await assignmentAPI.submitAssignment(selectedAssignment._id, submissionFile);
      showNotification('success', 'Success', 'Assignment submitted successfully');
      setShowSubmissionModal(false);
      setSubmissionFile(null);
      setSelectedAssignment(null);
      fetchAssignments();
    } catch (error) {
      console.error('Submit assignment error:', error);
      showNotification('error', 'Error', error.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    try {
      setGradesLoading(true);
      const mockGrades = [
        {
          _id: '1',
          course: {
            _id: 'course1',
            title: 'Advanced Mathematics',
            instructor: { name: 'Dr. John Smith' }
          },
          enrollmentDate: '2024-01-15',
          gradeLetter: 'A',
          assessments: [
            { name: 'Quiz 1', mark: 95 },
            { name: 'Midterm Exam', mark: 88 },
            { name: 'Assignment 1', mark: 92 }
          ]
        }
      ];
      setGrades(mockGrades);
    } catch (error) {
      console.error('Fetch grades error:', error);
      showNotification('error', 'Error', 'Failed to fetch grades');
    } finally {
      setGradesLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const { chatAPI } = await import('../services/api');
      const response = await chatAPI.getUnreadCount();
      setUnreadCount(response?.data?.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    }
  };

  // Function to update unread count when chat is viewed
  const updateUnreadCount = (chatId) => {
    // Decrease unread count when a chat is viewed
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Helper function to format time with AM/PM
  const formatTimeWithAMPM = (timeString) => {
    if (!timeString) return timeString;
    
    // Handle different time formats
    const time = timeString.toString().trim();
    
    // If already has AM/PM, return as is
    if (time.toLowerCase().includes('am') || time.toLowerCase().includes('pm')) {
      return time;
    }
    
    // Parse time in HH:MM format
    const [hours, minutes] = time.split(':').map(num => parseInt(num));
    
    if (isNaN(hours) || isNaN(minutes)) {
      return timeString; // Return original if parsing fails
    }
    
    // Convert to 12-hour format with AM/PM
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${displayHours}:${displayMinutes} ${period}`;
  };



  useEffect(() => {
    // Check for tab parameter in URL
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
    
    // Get user data using utility function
    const userData = getUserData();
    if (userData) {
      setUser(userData);
      setProfileForm(userData);
      // Set profile image from user data
      if (userData.profileImage) {
        setProfileImage(userData.profileImage);
      }
    }
    
    // Check subscription status from API
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await subscriptionAPI.getStatus();
        setIsSubscribed(response.data.isSubscribed);
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      }
    };
    
    if (userData) {
      fetchSubscriptionStatus();
    }
    
    // Fetch fresh user data from API
    fetchUserProfile();
    // Fetch enrolled courses
    fetchEnrolledCourses();
    // Fetch grades
    fetchGrades();
    // Fetch assignments
    fetchAssignments();
    // Fetch notifications
    fetchNotifications();
    // Fetch chat count
    fetchUnreadCount();
    
    // Set up periodic notification check (every 30 seconds)
    const notificationInterval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    
    // Cleanup interval on unmount
    return () => {
      clearInterval(notificationInterval);
    };
  }, [searchParams]);

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUpdate(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch payments when user is loaded
  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      const userData = response.data.user;
      setUser(userData);
      setProfileForm(userData);
      // Set profile image from API response
      if (userData.profileImage) {
        setProfileImage(userData.profileImage);
      }
      
      // Update stored user data
      updateUserData(userData);
    } catch (error) {
      console.error('Fetch profile error:', error);
    }
  };

  // Generate initials from user name
  const getInitials = (name) => {
    if (!name) return 'EY';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // Format name to show only first two parts (e.g., "Elyas Yenealem Atalay" -> "Elyas Yenealem")
  const formatDisplayName = (name) => {
    if (!name) return 'Student';
    const nameParts = name.trim().split(' ');
    return nameParts.slice(0, 2).join(' ');
  };

  const handleProfileSave = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.updateProfile(profileForm);
      const updatedUser = response.data.user;
      setUser(updatedUser);
      setIsEditing(false);
      
      // Update stored user data
      updateUserData(updatedUser);
      
      showNotification('success', 'Profile Updated!', 'Your profile has been updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      showNotification('error', 'Update Failed', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      setLoading(true);
      await profileAPI.changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      showNotification('success', 'Password Changed!', 'Your password has been updated successfully');
    } catch (error) {
      console.error('Password change error:', error);
      if (error.response?.status === 400 && error.response?.data?.message?.includes('current password')) {
        showNotification('error', 'Incorrect Current Password', 'The current password you entered is not correct. You cannot change the password.');
      } else {
        showNotification('error', 'Password Change Failed', 'Current password is not correct. Please verify your current password and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordFormChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  };

  const handleBackToWebsite = () => {
    window.location.href = '/';
  };

  const handleLogout = () => {
    clearUserData();
    window.location.href = '/login';
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BookOpen },
    { id: 'browse-courses', name: 'Browse Courses', icon: BookOpen },
    { id: 'courses', name: 'My Courses', icon: BookOpen, hasSubmenu: true },
    { id: 'course-resources', name: 'Course Resources', icon: FileText, hasSubmenu: true },
    { id: 'schedule', name: 'Schedule', icon: Calendar },
    { id: 'progress', name: 'Progress', icon: TrendingUp },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'review', name: 'Leave Review', icon: Star },
    { id: 'profile', name: 'My Profile', icon: User }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="mb-6">
        <div className="flex items-start sm:items-center justify-between mb-4 gap-3">
          <div className="flex items-start sm:items-center flex-1 min-w-0">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded-xl mr-3 sm:mr-4 flex-shrink-0">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">Student Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                Welcome back{user ? `, ${formatDisplayName(user.name)}` : ''}, track your learning progress
              </p>
            </div>
          </div>
          
          {/* Notifications */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (hasNewNotifications) {
                  setHasNewNotifications(false);
                }
              }}
              className="relative p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700"
            >
              {hasNewNotifications ? (
                <BellRing className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 animate-pulse" />
              ) : (
                <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-400" />
              )}
              {hasNewNotifications && (
                <span className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{notifications.filter(n => !n.read).length}</span>
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        !notif.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notif.type === 'success' ? 'bg-green-500' :
                            notif.type === 'info' ? 'bg-blue-500' :
                            notif.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{notif.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{notif.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">{notif.time}</p>
                            {notif.sender && (
                              <div className="text-xs text-gray-500 dark:text-gray-500">
                                {notif.sender.role === 'instructor' ? (
                                  <div>
                                    <p>from Instructor: {notif.sender.name}</p>
                                    {notif.course && <p>Course: {notif.course.title}</p>}
                                  </div>
                                ) : (
                                  <p>from {notif.sender.role === 'superadmin' ? 'superadmin' : notif.sender.role === 'admin' ? 'admin' : notif.sender.role}</p>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {!notif.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                            <button
                              onClick={() => deleteNotification(notif.id)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                            >
                              <X className="h-3 w-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Mark all as read
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total My Courses</p>
              <p className="text-2xl lg:text-3xl font-bold mt-2 text-gray-900 dark:text-white">{enrolledCourses?.length || 0}</p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Enrolled courses</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
              <BookOpen className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Completed</p>
              <p className="text-2xl lg:text-3xl font-bold mt-2 text-gray-900 dark:text-white">3</p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Courses finished</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
              <Award className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Classes */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 lg:p-6">
        <div className="flex items-center mb-4 lg:mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
            <Calendar className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
          </div>
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">Today's Classes</h3>
        </div>
        
        {(() => {
          const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const todayName = dayNames[today];
          
          const todaySessions = [];
          schedules.forEach(schedule => {
            schedule.sessions.forEach(session => {
              if (session.day === todayName) {
                todaySessions.push({
                  ...session,
                  course: schedule.course
                });
              }
            });
          });
          
          const sortedSessions = todaySessions.sort((a, b) => a.startTime.localeCompare(b.startTime));
          
          if (sortedSessions.length === 0) {
            return (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No classes scheduled for today</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Enjoy your free day!</p>
              </div>
            );
          }
          
          return (
            <div className="space-y-3 lg:space-y-4">
              {sortedSessions.map((session, index) => {
                const colors = [
                  'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-500',
                  'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-500',
                  'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-500',
                  'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-500'
                ];
                const colorClass = colors[index % colors.length];
                
                return (
                  <div key={index} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 lg:p-4 bg-gradient-to-r ${colorClass} rounded-xl border-l-4 gap-3`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {session.course?.title || 'Course'}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1">
                            <span className="font-medium">
                              {formatTimeWithAMPM(session.startTime)} - {formatTimeWithAMPM(session.endTime)}
                            </span>
                            {session.room && (
                              <>
                                <span>•</span>
                                <span>Room: {session.room}</span>
                              </>
                            )}
                            <span>•</span>
                            {(() => {
                              const now = new Date();
                              const [startHour, startMin] = session.startTime.split(':').map(Number);
                              const [endHour, endMin] = session.endTime.split(':').map(Number);
                              const startTime = new Date();
                              startTime.setHours(startHour, startMin, 0, 0);
                              const endTime = new Date();
                              endTime.setHours(endHour, endMin, 0, 0);
                              
                              if (now >= startTime && now <= endTime) {
                                return <span className="text-green-600 dark:text-green-400 font-medium">Started</span>;
                              } else if (now < startTime) {
                                const diff = startTime - now;
                                const minutes = Math.floor(diff / 60000);
                                const seconds = Math.floor((diff % 60000) / 1000);
                                return <span className="text-blue-600 dark:text-blue-400 font-medium">{minutes}m {seconds}s left</span>;
                              } else {
                                return <span className="text-red-600 dark:text-red-400 font-medium">Ended</span>;
                              }
                            })()} 
                          </div>
                          <div className="text-xs text-orange-600 dark:text-orange-400 font-medium mt-1">
                            Note: After 15 min you are late
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 sm:ml-4">
                      <button
                        onClick={() => {
                          const now = new Date();
                          const [startHour, startMin] = session.startTime.split(':').map(Number);
                          const [endHour, endMin] = session.endTime.split(':').map(Number);
                          const startTime = new Date();
                          startTime.setHours(startHour, startMin, 0, 0);
                          const endTime = new Date();
                          endTime.setHours(endHour, endMin, 0, 0);
                          const lateTime = new Date(startTime.getTime() + 15 * 60000);
                          
                          let modalType, title, message, actionText, canJoin = false;
                          
                          if (now < startTime) {
                            const diff = startTime - now;
                            const minutes = Math.floor(diff / 60000);
                            const seconds = Math.floor((diff % 60000) / 1000);
                            modalType = 'waiting';
                            title = 'Class Not Started Yet';
                            message = `Please wait ${minutes}m ${seconds}s for the class to begin.`;
                            actionText = 'Wait';
                          } else if (now >= startTime && now <= lateTime) {
                            modalType = 'join';
                            title = 'Join Class Now';
                            message = session.link 
                              ? 'Click below to join the online class meeting.'
                              : `Please go to ${session.room || 'the assigned room'} for your class.`;
                            actionText = session.link ? 'Join Meeting' : 'Got It';
                            canJoin = true;
                          } else if (now > lateTime && now <= endTime) {
                            modalType = 'late';
                            title = 'You Are Late!';
                            message = 'After 15 minutes, you cannot join the class.';
                            actionText = 'Understood';
                          } else {
                            modalType = 'ended';
                            title = 'Class Has Ended';
                            message = 'This class session has already finished.';
                            actionText = 'OK';
                          }
                          
                          setJoinModalData({
                            type: modalType,
                            title,
                            message,
                            actionText,
                            canJoin,
                            session,
                            link: session.link,
                            courseId: session.course?._id || session.course,
                            day: session.day
                          });
                          setShowJoinModal(true);
                        }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                      >
                        <Video className="h-4 w-4" />
                        <span className="hidden sm:inline">Join Class</span>
                        <span className="sm:hidden">Join</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Quick Links */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 lg:p-6">
        <div className="flex items-center mb-4 lg:mb-6">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-3">
            <Settings className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600" />
          </div>
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">Quick Links</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <button 
            onClick={() => setActiveTab('assignments')}
            className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-200 group border border-blue-200 dark:border-blue-700"
          >
            <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">Assignments</span>
          </button>
          
          <button 
            onClick={() => {
              setActiveTab('course-materials');
            }}
            className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-200 group border border-green-200 dark:border-green-700"
          >
            <BookOpen className="h-6 w-6 lg:h-8 lg:w-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">Course Materials</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('exams')}
            className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-200 group border border-purple-200 dark:border-purple-700"
          >
            <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">Exams</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('schedule')}
            className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-900/30 dark:hover:to-red-900/30 transition-all duration-200 group border border-orange-200 dark:border-orange-700"
          >
            <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderCourses = () => {
    const displayedCourses = showLikedOnly 
      ? (enrolledCourses || []).filter(course => course.stars?.includes(user?._id))
      : (enrolledCourses || []);

    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">My Courses</h2>
            <button
              onClick={() => setShowLikedOnly(!showLikedOnly)}
              className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-colors hover:opacity-80 ${
                showLikedOnly 
                  ? 'text-red-500' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Heart className={`h-4 w-4 ${showLikedOnly ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">Liked Courses</span>
              <span className="sm:hidden">Liked</span>
            </button>
          </div>
          <button 
            onClick={() => window.location.href = '/courses'}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Browse Courses
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-3 lg:p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total My Courses</p>
              <p className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">{enrolledCourses?.length || 0}</p>
            </div>
          </div>
        </div>
      
        {coursesLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : displayedCourses.length === 0 ? (
        <div className="text-center py-8 lg:py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
          <BookOpen className="h-12 lg:h-16 w-12 lg:w-16 text-gray-400 mx-auto mb-3 lg:mb-4" />
          <h3 className="text-base lg:text-lg font-medium text-gray-900 dark:text-white mb-2">
            {showLikedOnly ? 'No Liked Courses' : 'No Courses Enrolled'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {showLikedOnly ? 'You haven\'t liked any courses yet.' : 'You haven\'t enrolled in any courses yet.'}
          </p>
          <button 
            onClick={() => window.location.href = '/courses'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            Browse Courses
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b-2 border-gray-200 dark:border-gray-600">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                      Course
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                      Instructor
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-gray-200 dark:divide-gray-600">
                  {displayedCourses.map((course, index) => (
                    <tr key={course._id} className={`hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors border-b border-gray-200 dark:border-gray-600 ${
                      index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'
                    }`}>
                      <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-600">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-xs">{course.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{course.category || 'General'}</div>
                      </td>
                      <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-600">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {course.instructor?.name || 'Instructor'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => {
                            setSelectedCourse(course);
                            setActiveTab('course-materials');
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                        >
                          View Materials
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {displayedCourses.map((course) => (
              <div key={course._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{course.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{course.category || 'General'}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Instructor</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{course.instructor?.name || 'Instructor'}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedCourse(course);
                        setActiveTab('course-materials');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const renderPayments = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Payment History</h2>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <CreditCard className="h-4 w-4" />
          <span>{payments.length} transactions</span>
        </div>
      </div>
      
      {paymentsLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-8 lg:py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
          <CreditCard className="h-12 lg:h-16 w-12 lg:w-16 text-gray-400 mx-auto mb-3 lg:mb-4" />
          <h3 className="text-base lg:text-lg font-medium text-gray-900 dark:text-white mb-2">No Payments Found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">You haven't made any payments yet.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b-2 border-gray-200 dark:border-gray-600">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                      Course
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-gray-200 dark:divide-gray-600">
                  {payments.map((payment, index) => (
                    <tr key={payment._id} className={`hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors border-b border-gray-200 dark:border-gray-600 ${
                      index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'
                    }`}>
                      <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-600">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-xs">
                          {payment.course?.title || 'Course'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Receipt: {payment.receiptNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-600">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {payment.amount} Birr
                        </span>
                      </td>
                      <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-600">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'success' 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                            : payment.status === 'pending'
                            ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                            : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                        }`}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewReceipt(payment._id)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="View Receipt"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadReceipt(payment._id)}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Download Receipt"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {payments.map((payment) => (
              <div key={payment._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {payment.course?.title || 'Course'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Receipt: {payment.receiptNumber}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount</p>
                      <p className="text-base font-bold text-gray-900 dark:text-white">{payment.amount} Birr</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      payment.status === 'success' 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                        : payment.status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                    }`}>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {payment.status}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleViewReceipt(payment._id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-xs font-medium"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                    <button
                      onClick={() => handleDownloadReceipt(payment._id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-xs font-medium"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const renderAssignments = () => {
    const pendingAssignments = assignments.filter(a => a.submissionStatus === 'pending');
    const submittedAssignments = assignments.filter(a => a.submissionStatus === 'submitted');
    const gradedAssignments = assignments.filter(a => a.submissionStatus === 'graded');

    const getActiveAssignments = () => {
      switch (activeAssignmentTab) {
        case 'pending': return pendingAssignments;
        case 'submitted': return submittedAssignments;
        case 'graded': return gradedAssignments;
        default: return pendingAssignments;
      }
    };

    const activeAssignments = getActiveAssignments();

    return (
      <div className="space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Assignments</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Track and submit your course assignments
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <FileText className="h-4 w-4" />
            <span>{assignments.length} total</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 lg:gap-4">
          <div className="bg-white dark:bg-gray-800 p-3 lg:p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600" />
              </div>
              <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">{pendingAssignments.length}</p>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Pending</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 lg:p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Upload className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
              </div>
              <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">{submittedAssignments.length}</p>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Submitted</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 lg:p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
              </div>
              <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">{gradedAssignments.length}</p>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Graded</p>
            </div>
          </div>
        </div>

        {/* Assignment Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl shadow-lg p-3 lg:p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveAssignmentTab('pending')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md transition-all ${
                activeAssignmentTab === 'pending'
                  ? 'bg-white dark:bg-gray-800 text-orange-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Pending</span>
              <span className="bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 text-xs px-2 py-0.5 rounded-full font-medium">
                {pendingAssignments.length}
              </span>
            </button>
            <button
              onClick={() => setActiveAssignmentTab('submitted')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md transition-all ${
                activeAssignmentTab === 'submitted'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Submitted</span>
              <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full font-medium">
                {submittedAssignments.length}
              </span>
            </button>
            <button
              onClick={() => setActiveAssignmentTab('graded')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md transition-all ${
                activeAssignmentTab === 'graded'
                  ? 'bg-white dark:bg-gray-800 text-green-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Graded</span>
              <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs px-2 py-0.5 rounded-full font-medium">
                {gradedAssignments.length}
              </span>
            </button>
          </div>
        </div>

        {assignmentsLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : activeAssignments.length === 0 ? (
          <div className="text-center py-8 lg:py-12 bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 lg:h-10 lg:w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No {activeAssignmentTab.charAt(0).toUpperCase() + activeAssignmentTab.slice(1)} Assignments
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              {activeAssignmentTab === 'pending' && 'No pending assignments at the moment. Check back later for new assignments.'}
              {activeAssignmentTab === 'submitted' && 'You haven\'t submitted any assignments yet. Complete and submit your pending assignments.'}
              {activeAssignmentTab === 'graded' && 'No graded assignments available. Your grades will appear here once instructors review your submissions.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 lg:space-y-4">
            {activeAssignments.map((assignment) => {
              const dueDateInfo = formatDueDate(assignment.dueDate);
              const isOverdue = dueDateInfo.isOverdue;
              const isUrgent = dueDateInfo.timeLeft && (dueDateInfo.timeLeft.includes('h') && parseInt(dueDateInfo.timeLeft) <= 24);
              
              return (
                <div key={assignment._id} className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-200">
                  {/* Mobile Layout */}
                  <div className="lg:hidden">
                    <div className="p-4">
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          activeAssignmentTab === 'pending' ? 'bg-orange-100 dark:bg-orange-900/20' :
                          activeAssignmentTab === 'submitted' ? 'bg-blue-100 dark:bg-blue-900/20' :
                          'bg-green-100 dark:bg-green-900/20'
                        }`}>
                          <FileText className={`h-5 w-5 ${
                            activeAssignmentTab === 'pending' ? 'text-orange-600' :
                            activeAssignmentTab === 'submitted' ? 'text-blue-600' :
                            'text-green-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                            {assignment.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {assignment.course?.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Instructor: {assignment.instructor?.name}
                          </p>
                        </div>
                      </div>

                      {/* Due Date - Only show for pending and submitted */}
                      {activeAssignmentTab !== 'graded' && (
                        <div className={`mb-3 p-2 rounded-lg ${
                          isOverdue ? 'bg-red-50 dark:bg-red-900/20' :
                          isUrgent ? 'bg-orange-50 dark:bg-orange-900/20' :
                          'bg-gray-50 dark:bg-gray-700/50'
                        }`}>
                          <div className="flex items-center gap-2">
                            <Clock className={`h-4 w-4 ${
                              isOverdue ? 'text-red-600' :
                              isUrgent ? 'text-orange-600' :
                              'text-gray-600 dark:text-gray-400'
                            }`} />
                            <span className={`text-sm font-medium ${
                              isOverdue ? 'text-red-600' :
                              isUrgent ? 'text-orange-600' :
                              'text-gray-600 dark:text-gray-400'
                            }`}>
                              {dueDateInfo.text}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Grade Display for Graded Assignments */}
                      {activeAssignmentTab === 'graded' && assignment.submission?.grade !== undefined && (
                        <div className="mb-3">
                          <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
                            assignment.submission.grade >= (assignment.totalMarks * 0.8) ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                            assignment.submission.grade >= (assignment.totalMarks * 0.6) ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                            'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                          }`}>
                            <Award className="h-4 w-4 mr-2" />
                            Grade: {assignment.submission.grade}/{assignment.totalMarks || 100}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setShowAssignmentDetail(true);
                          }}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Details
                        </button>
                        
                        {activeAssignmentTab === 'pending' && !isOverdue && (
                          <button
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowSubmissionModal(true);
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          >
                            <Upload className="h-4 w-4" />
                            Submit
                          </button>
                        )}
                        
                        {assignment.file && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDownloadAssignmentFile(assignment._id, assignment.file.fileName);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white py-2.5 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                            type="button"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:block">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            activeAssignmentTab === 'pending' ? 'bg-orange-100 dark:bg-orange-900/20' :
                            activeAssignmentTab === 'submitted' ? 'bg-blue-100 dark:bg-blue-900/20' :
                            'bg-green-100 dark:bg-green-900/20'
                          }`}>
                            <FileText className={`h-6 w-6 ${
                              activeAssignmentTab === 'pending' ? 'text-orange-600' :
                              activeAssignmentTab === 'submitted' ? 'text-blue-600' :
                              'text-green-600'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {assignment.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                              <span>{assignment.course?.title}</span>
                              <span>•</span>
                              <span>Instructor: {assignment.instructor?.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              {/* Due Date - Only show for pending and submitted */}
                              {activeAssignmentTab !== 'graded' && (
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                                  isOverdue ? 'bg-red-50 dark:bg-red-900/20 text-red-600' :
                                  isUrgent ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' :
                                  'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                                }`}>
                                  <Clock className="h-4 w-4" />
                                  <span className="text-sm font-medium">{dueDateInfo.text}</span>
                                </div>
                              )}
                              {activeAssignmentTab === 'graded' && assignment.submission?.grade !== undefined && (
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                                  assignment.submission.grade >= (assignment.totalMarks * 0.8) ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                                  assignment.submission.grade >= (assignment.totalMarks * 0.6) ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                                  'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                }`}>
                                  <Award className="h-4 w-4" />
                                  <span className="text-sm font-medium">Grade: {assignment.submission.grade}/{assignment.totalMarks || 100}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 ml-4">
                          <button
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowAssignmentDetail(true);
                            }}
                            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </button>
                          
                          {activeAssignmentTab === 'pending' && !isOverdue && (
                            <button
                              onClick={() => {
                                setSelectedAssignment(assignment);
                                setShowSubmissionModal(true);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              Submit Assignment
                            </button>
                          )}
                          
                          {assignment.file && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDownloadAssignmentFile(assignment._id, assignment.file.fileName);
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                              type="button"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Assignment Detail Modal */}
        {showAssignmentDetail && selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white pr-4 break-words">{selectedAssignment.title}</h3>
                  <button
                    onClick={() => {
                      setShowAssignmentDetail(false);
                      setSelectedAssignment(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Course & Instructor</h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base break-words">
                      {selectedAssignment.course?.title} • {selectedAssignment.instructor?.name}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Due Date</h4>
                    {(() => {
                      const dueDateInfo = formatDueDate(selectedAssignment.dueDate);
                      return (
                        <p className={`text-gray-700 dark:text-gray-300 text-sm sm:text-base ${
                          dueDateInfo.isOverdue ? 'text-red-600 font-semibold' : ''
                        }`}>
                          {dueDateInfo.text}
                        </p>
                      );
                    })()}
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Instructions</h4>
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words overflow-wrap-anywhere leading-relaxed text-sm sm:text-base max-w-full">
                      {selectedAssignment.instructions}
                    </div>
                  </div>

                  {selectedAssignment.submission && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Your Submission</h4>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Submitted: {new Date(selectedAssignment.submission.submittedAt).toLocaleString()}
                        </p>
                        {selectedAssignment.submission && selectedAssignment.submission.file && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDownloadSubmissionFile(selectedAssignment._id, selectedAssignment.submission.file.fileName);
                            }}
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                            type="button"
                          >
                            <Download className="h-4 w-4" />
                            {selectedAssignment.submission.file.fileName}
                          </button>
                        )}
                        {selectedAssignment.submission.grade !== undefined && (
                          <div className="mt-3">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              selectedAssignment.submission.grade >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                              selectedAssignment.submission.grade >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                              'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                            }`}>
                              Grade: {selectedAssignment.submission.grade}/100
                            </div>
                            {selectedAssignment.submission.feedback && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Feedback:</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {selectedAssignment.submission.feedback}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submission Modal */}
        {showSubmissionModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Submit Assignment</h3>
                  <button
                    onClick={() => {
                      setShowSubmissionModal(false);
                      setSubmissionFile(null);
                      setSelectedAssignment(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                    <div className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {selectedAssignment.title}
                      </h4>
                      {(() => {
                        const dueDateInfo = formatDueDate(selectedAssignment.dueDate);
                        return (
                          <p className={`text-sm ${
                            dueDateInfo.isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {dueDateInfo.text}
                          </p>
                        );
                      })()}
                    </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select File to Submit *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        onChange={(e) => setSubmissionFile(e.target.files[0])}
                        className="hidden"
                        id="submissionFile"
                      />
                      <label htmlFor="submissionFile" className="cursor-pointer">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Click to select file
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Any file type (max 100MB)
                        </p>
                      </label>
                      {submissionFile && (
                        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm text-blue-800 dark:text-blue-300">
                            Selected: {submissionFile.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSubmitAssignment}
                      disabled={loading || !submissionFile}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Submitting...' : 'Submit Assignment'}
                    </button>
                    <button
                      onClick={() => {
                        setShowSubmissionModal(false);
                        setSubmissionFile(null);
                        setSelectedAssignment(null);
                      }}
                      disabled={loading}
                      className="px-6 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setSchedulesLoading(true);
        const { scheduleAPI } = await import('../services/api');
        const response = await scheduleAPI.getSchedules();
        const fetchedSchedules = response.data.schedules || [];
        setSchedules(fetchedSchedules);
        
        // Check for today's classes only on initial load
        if (fetchedSchedules.length > 0) {
          const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
          const todaysClasses = [];
          
          fetchedSchedules.forEach(schedule => {
            const todaySessions = schedule.sessions.filter(session => session.day === today);
            if (todaySessions.length > 0) {
              todaysClasses.push({
                course: schedule.course,
                sessions: todaySessions
              });
            }
          });
          
          setTodayClasses(todaysClasses);
          if (todaysClasses.length > 0) {
            setTimeout(() => {
              setShowTodayAnnouncement(true);
              // Auto hide after 8 seconds
              setTimeout(() => setShowTodayAnnouncement(false), 8000);
            }, 1500);
          }
        }
      } catch (error) {
        setSchedules([]);
      } finally {
        setSchedulesLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  const renderSchedule = () => {
    // Helper function to get today's sessions
    const getTodaysSessions = () => {
      const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayName = dayNames[today];
      
      const todaySessions = [];
      schedules.forEach(schedule => {
        schedule.sessions.forEach(session => {
          if (session.day === todayName) {
            todaySessions.push({
              ...session,
              course: schedule.course
            });
          }
        });
      });
      
      return todaySessions.sort((a, b) => a.startTime.localeCompare(b.startTime));
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Schedule</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your course schedules</p>
        </div>
        
        {/* Today's Classes Announcement */}
        {getTodaysSessions().length > 0 && (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-4 lg:p-6 text-white animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold">Today's Classes</h3>
            </div>
            <div className="space-y-3">
              {getTodaysSessions().map((session, idx) => (
                <div key={idx} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm lg:text-base">{session.course?.title}</h4>
                      <div className="flex items-center gap-4 text-xs lg:text-sm text-white/80 mt-1">
                        <span>🕐 {formatTimeWithAMPM(session.startTime)} - {formatTimeWithAMPM(session.endTime)}</span>
                        {session.room && <span>📍 Room: {session.room}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const now = new Date();
                        const [startHour, startMin] = session.startTime.split(':').map(Number);
                        const [endHour, endMin] = session.endTime.split(':').map(Number);
                        const startTime = new Date();
                        startTime.setHours(startHour, startMin, 0, 0);
                        const endTime = new Date();
                        endTime.setHours(endHour, endMin, 0, 0);
                        const lateTime = new Date(startTime.getTime() + 15 * 60000);
                        
                        let modalType, title, message, actionText, canJoin = false;
                        
                        if (now < startTime) {
                          const diff = startTime - now;
                          const minutes = Math.floor(diff / 60000);
                          const seconds = Math.floor((diff % 60000) / 1000);
                          modalType = 'waiting';
                          title = 'Class Not Started Yet';
                          message = `Please wait ${minutes}m ${seconds}s for the class to begin.`;
                          actionText = 'Wait';
                        } else if (now >= startTime && now <= lateTime) {
                          modalType = 'join';
                          title = 'Join Class Now';
                          message = session.link 
                            ? 'Click below to join the online class meeting.'
                            : `Please go to ${session.room || 'the assigned room'} for your class.`;
                          actionText = session.link ? 'Join Meeting' : 'Got It';
                          canJoin = true;
                        } else if (now > lateTime && now <= endTime) {
                          modalType = 'late';
                          title = 'You Are Late!';
                          message = 'After 15 minutes, you cannot join the class.';
                          actionText = 'Understood';
                        } else {
                          modalType = 'ended';
                          title = 'Class Has Ended';
                          message = 'This class session has already finished.';
                          actionText = 'OK';
                        }
                        
                        setJoinModalData({
                          type: modalType,
                          title,
                          message,
                          actionText,
                          canJoin,
                          session,
                          link: session.link
                        });
                        setShowJoinModal(true);
                      }}
                      className="bg-white text-blue-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
                    >
                      Join Class
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {schedulesLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Courses Enrolled</h3>
            <p className="text-gray-500 dark:text-gray-400">Enroll in courses to see your schedule.</p>
          </div>
        ) : (
          <div className="space-y-4 lg:space-y-6">
            {enrolledCourses.map((course) => {
              const courseSchedules = schedules.filter(s => s.course?._id === course._id);
              const hasSchedule = courseSchedules.length > 0;
              
              return (
                <div key={course._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 lg:p-6">
                  <div className="flex items-center justify-between gap-3 mb-4 lg:mb-6">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white truncate">{course.title}</h3>
                      <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Instructor: {course.instructor?.name || 'Instructor'}</p>
                    </div>
                    {!hasSchedule && (
                      <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 text-xs rounded-full font-medium">
                        Not Assigned
                      </span>
                    )}
                  </div>
                  
                  {!hasSchedule ? (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 text-sm">No schedule assigned for this course yet.</p>
                      <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">The Program Office will assign a schedule.</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Schedule Grid */}
                      <div className="hidden lg:block">
                        <div className="grid grid-cols-7 gap-4 mb-4">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                            <div key={day} className="text-center font-medium text-gray-900 dark:text-white text-base">{day}</div>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-7 gap-4">
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                            const daySessions = courseSchedules[0].sessions.filter(s => s.day === day);
                            return (
                              <div key={day}>
                                {daySessions.map((session, idx) => {
                                  const colors = ['bg-blue-100 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100', 
                                                'bg-green-100 dark:bg-green-900/20 text-green-900 dark:text-green-100',
                                                'bg-purple-100 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100'];
                                  const color = colors[idx % 3];
                                  return (
                                    <div key={idx} className={`${color} p-3 rounded-lg mb-2`}>
                                      <div className="flex items-center gap-1 text-xs flex-wrap">
                                        <Clock className="h-3 w-3 flex-shrink-0" />
                                        <span className="font-medium">Time:</span>
                                        <span>{formatTimeWithAMPM(session.startTime)} - {formatTimeWithAMPM(session.endTime)}</span>
                                      </div>
                                      {session.room && (
                                        <div className="flex items-center gap-1 text-xs mt-1 flex-wrap">
                                          <MapPin className="h-3 w-3 flex-shrink-0" />
                                          <span className="font-medium">Room:</span>
                                          <span>{session.room}</span>
                                        </div>
                                      )}
                                      {(() => {
                                        const today = new Date().getDay();
                                        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                                        const todayName = dayNames[today];
                                        return session.day === todayName && (
                                          <div className="mt-2">
                                            <button
                                              onClick={() => {
                                                const now = new Date();
                                                const [startHour, startMin] = session.startTime.split(':').map(Number);
                                                const [endHour, endMin] = session.endTime.split(':').map(Number);
                                                const startTime = new Date();
                                                startTime.setHours(startHour, startMin, 0, 0);
                                                const endTime = new Date();
                                                endTime.setHours(endHour, endMin, 0, 0);
                                                const lateTime = new Date(startTime.getTime() + 15 * 60000);
                                                
                                                let modalType, title, message, actionText, canJoin = false;
                                                
                                                if (now < startTime) {
                                                  const diff = startTime - now;
                                                  const minutes = Math.floor(diff / 60000);
                                                  const seconds = Math.floor((diff % 60000) / 1000);
                                                  modalType = 'waiting';
                                                  title = 'Class Not Started Yet';
                                                  message = `Please wait ${minutes}m ${seconds}s for the class to begin.`;
                                                  actionText = 'Wait';
                                                } else if (now >= startTime && now <= lateTime) {
                                                  modalType = 'join';
                                                  title = 'Join Class Now';
                                                  message = session.link 
                                                    ? 'Click below to join the online class meeting.'
                                                    : `Please go to ${session.room || 'the assigned room'} for your class.`;
                                                  actionText = session.link ? 'Join Meeting' : 'Got It';
                                                  canJoin = true;
                                                } else if (now > lateTime && now <= endTime) {
                                                  modalType = 'late';
                                                  title = 'You Are Late!';
                                                  message = 'After 15 minutes, you cannot join the class.';
                                                  actionText = 'Understood';
                                                } else {
                                                  modalType = 'ended';
                                                  title = 'Class Has Ended';
                                                  message = 'This class session has already finished.';
                                                  actionText = 'OK';
                                                }
                                                
                                                setJoinModalData({
                                                  type: modalType,
                                                  title,
                                                  message,
                                                  actionText,
                                                  canJoin,
                                                  session,
                                                  link: session.link
                                                });
                                                setShowJoinModal(true);
                                              }}
                                              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                                            >
                                              Join Class
                                            </button>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Mobile Schedule List */}
                      <div className="lg:hidden space-y-3">
                        {courseSchedules[0].sessions.map((session, idx) => {
                          const colors = ['bg-blue-100 dark:bg-blue-900/20', 'bg-green-100 dark:bg-green-900/20', 'bg-purple-100 dark:bg-purple-900/20'];
                          const textColors = ['text-blue-900 dark:text-blue-100', 'text-green-900 dark:text-green-100', 'text-purple-900 dark:text-purple-100'];
                          const color = colors[idx % 3];
                          const textColor = textColors[idx % 3];
                          
                          return (
                            <div key={idx} className={`${color} p-3 rounded-lg`}>
                              <span className={`text-sm font-medium ${textColor} capitalize block mb-2`}>{session.day}</span>
                              <div className="flex items-center gap-1 text-xs mb-1 flex-wrap">
                                <Clock className="h-3 w-3 flex-shrink-0" />
                                <span className={`font-medium ${textColor}`}>Time:</span>
                                <span className={`${textColor}`}>{formatTimeWithAMPM(session.startTime)} - {formatTimeWithAMPM(session.endTime)}</span>
                              </div>
                              {session.room && (
                                <div className="flex items-center gap-1 text-xs flex-wrap">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  <span className={`font-medium ${textColor}`}>Room:</span>
                                  <span className={`${textColor}`}>{session.room}</span>
                                </div>
                              )}
                              {(() => {
                                const today = new Date().getDay();
                                const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                                const todayName = dayNames[today];
                                return session.day === todayName && (
                                  <div className="mt-2">
                                    <button
                                      onClick={() => {
                                        const now = new Date();
                                        const [startHour, startMin] = session.startTime.split(':').map(Number);
                                        const [endHour, endMin] = session.endTime.split(':').map(Number);
                                        const startTime = new Date();
                                        startTime.setHours(startHour, startMin, 0, 0);
                                        const endTime = new Date();
                                        endTime.setHours(endHour, endMin, 0, 0);
                                        const lateTime = new Date(startTime.getTime() + 15 * 60000);
                                        
                                        let modalType, title, message, actionText, canJoin = false;
                                        
                                        if (now < startTime) {
                                          const diff = startTime - now;
                                          const minutes = Math.floor(diff / 60000);
                                          const seconds = Math.floor((diff % 60000) / 1000);
                                          modalType = 'waiting';
                                          title = 'Class Not Started Yet';
                                          message = `Please wait ${minutes}m ${seconds}s for the class to begin.`;
                                          actionText = 'Wait';
                                        } else if (now >= startTime && now <= lateTime) {
                                          modalType = 'join';
                                          title = 'Join Class Now';
                                          message = session.link 
                                            ? 'Click below to join the online class meeting.'
                                            : `Please go to ${session.room || 'the assigned room'} for your class.`;
                                          actionText = session.link ? 'Join Meeting' : 'Got It';
                                          canJoin = true;
                                        } else if (now > lateTime && now <= endTime) {
                                          modalType = 'late';
                                          title = 'You Are Late!';
                                          message = 'After 15 minutes, you cannot join the class.';
                                          actionText = 'Understood';
                                        } else {
                                          modalType = 'ended';
                                          title = 'Class Has Ended';
                                          message = 'This class session has already finished.';
                                          actionText = 'OK';
                                        }
                                        
                                        setJoinModalData({
                                          type: modalType,
                                          title,
                                          message,
                                          actionText,
                                          canJoin,
                                          session,
                                          link: session.link
                                        });
                                        setShowJoinModal(true);
                                      }}
                                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                                    >
                                      Join Class
                                    </button>
                                  </div>
                                );
                              })()}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderProgress = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Progress</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Course Progress</h3>
          <div className="space-y-4">
            {['Mathematics', 'Physics', 'Chemistry'].map((subject, index) => (
              <div key={subject}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{subject}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{75 + index * 5}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${75 + index * 5}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Overall Performance</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">85%</div>
            <p className="text-gray-600 dark:text-gray-400">Average Grade</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGrades = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">My Grades</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Award className="h-4 w-4" />
          <span>{grades.length} courses graded</span>
        </div>
      </div>
      
      {gradesLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : grades.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Grades Available</h3>
          <p className="text-gray-500 dark:text-gray-400">Your grades will appear here once instructors submit them.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b-2 border-gray-200 dark:border-gray-600">
                    <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Course</th>
                    <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">Grade</th>
                    <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-gray-200 dark:divide-gray-600">
                  {grades.map((grade, index) => (
                    <tr key={grade._id} className={`hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors border-b border-gray-200 dark:border-gray-600 ${
                      index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'
                    }`}>
                      <td className="px-3 lg:px-6 py-3 lg:py-4 border-r border-gray-200 dark:border-gray-600">
                        <div className="text-xs lg:text-sm font-semibold text-gray-900 dark:text-white truncate max-w-xs">{grade.course.title}</div>
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4 border-r border-gray-200 dark:border-gray-600">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          grade.gradeLetter === 'A' || grade.gradeLetter === 'A+' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                          grade.gradeLetter === 'B' || grade.gradeLetter === 'B+' || grade.gradeLetter === 'B-' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                          grade.gradeLetter === 'C' || grade.gradeLetter === 'C+' || grade.gradeLetter === 'C-' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        }`}>
                          {grade.gradeLetter}
                        </span>
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4">
                        <button
                          onClick={() => {
                            setSelectedGrade(grade);
                            setShowGradeDetail(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
                        >
                          View Assessment
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Grade Detail Modal */}
      {showGradeDetail && selectedGrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Assessment Details</h3>
                <button
                  onClick={() => setShowGradeDetail(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {selectedGrade.course.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Instructor: {selectedGrade.course.instructor.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enrolled: {new Date(selectedGrade.enrollmentDate).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-white">Final Grade</h5>
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${
                      selectedGrade.gradeLetter === 'A' || selectedGrade.gradeLetter === 'A+' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                      selectedGrade.gradeLetter === 'B' || selectedGrade.gradeLetter === 'B+' || selectedGrade.gradeLetter === 'B-' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                      selectedGrade.gradeLetter === 'C' || selectedGrade.gradeLetter === 'C+' || selectedGrade.gradeLetter === 'C-' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    }`}>
                      {selectedGrade.gradeLetter}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assessment Breakdown</h5>
                  <div className="space-y-3">
                    {selectedGrade.assessments.map((assessment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white">{assessment.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">{assessment.mark}%</span>
                          <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                assessment.mark >= 90 ? 'bg-green-500' :
                                assessment.mark >= 80 ? 'bg-blue-500' :
                                assessment.mark >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${assessment.mark}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">Overall Average</span>
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(selectedGrade.assessments.reduce((sum, a) => sum + a.mark, 0) / selectedGrade.assessments.length)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">My Profile</h2>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button 
                onClick={handleProfileSave}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setProfileForm(user);
                }}
                disabled={loading}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
      
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl lg:text-4xl font-bold overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user ? getInitials(user.name) : 'EY'
                )}
              </div>
              {isEditing && (
                <>
                  <button 
                    onClick={() => setShowImageOptions(!showImageOptions)}
                    disabled={loading}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  {showImageOptions && (
                    <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-10">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="hidden" 
                        id="imageUpload"
                        disabled={loading}
                      />
                      <label 
                        htmlFor="imageUpload"
                        className={`block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {loading ? 'Uploading...' : 'Upload Photo'}
                      </label>
                      {profileImage && (
                        <button 
                          onClick={removeImage}
                          disabled={loading}
                          className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                        >
                          {loading ? 'Removing...' : 'Remove Photo'}
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Basic Info */}
          <div className="flex-1">
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">{user?.name || 'Elyas Yenealem'}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-1">{user?.email || 'email@example.com'}</p>
            <p className="text-blue-600 dark:text-blue-400 font-medium capitalize">{user?.role || 'Student'}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-sm rounded-full">Verified Account</span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm rounded-full">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <input 
                type="text" 
                value={profileForm.name || ''} 
                onChange={(e) => handleFormChange('name', e.target.value)}
                disabled={!isEditing} 
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input 
                type="email" 
                value={profileForm.email || ''} 
                onChange={(e) => handleFormChange('email', e.target.value)}
                disabled={!isEditing} 
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
              <input 
                type="tel" 
                value={profileForm.phone || ''} 
                onChange={(e) => handleFormChange('phone', e.target.value)}
                placeholder="+251 xxx xxx xxxx" 
                disabled={!isEditing} 
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth</label>
              <input 
                type="date" 
                value={profileForm.dateOfBirth ? new Date(profileForm.dateOfBirth).toISOString().split('T')[0] : ''} 
                onChange={(e) => handleFormChange('dateOfBirth', e.target.value)}
                disabled={!isEditing} 
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
              <input 
                type="text" 
                value={profileForm.address || ''} 
                onChange={(e) => handleFormChange('address', e.target.value)}
                placeholder="Street Address" 
                disabled={!isEditing} 
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
              <input 
                type="text" 
                value={profileForm.city || ''} 
                onChange={(e) => handleFormChange('city', e.target.value)}
                placeholder="Addis Ababa" 
                disabled={!isEditing} 
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
              <select 
                value={profileForm.gender || ''} 
                onChange={(e) => handleFormChange('gender', e.target.value)}
                disabled={!isEditing} 
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Academic Information</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student ID</label>
              <input 
                type="text" 
                value={profileForm.systemId || ''} 
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 cursor-not-allowed dark:text-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Program</label>
              <select 
                value={profileForm.program || ''} 
                onChange={(e) => handleFormChange('program', e.target.value)}
                disabled={!isEditing} 
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`}
              >
                <option value="">Select Program</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="Diploma">Diploma</option>
                <option value="Certificate">Certificate</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Field of Study</label>
              <input 
                type="text" 
                value={profileForm.fieldOfStudy || ''} 
                onChange={(e) => handleFormChange('fieldOfStudy', e.target.value)}
                placeholder="e.g., Computer Science, Mathematics" 
                disabled={!isEditing} 
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year of Study</label>
              <select 
                value={profileForm.yearOfStudy || ''} 
                onChange={(e) => handleFormChange('yearOfStudy', e.target.value)}
                disabled={!isEditing} 
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`}
              >
                <option value="">Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="5th Year">5th Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Institution</label>
              <input 
                type="text" 
                value={profileForm.institution || ''} 
                onChange={(e) => handleFormChange('institution', e.target.value)}
                placeholder="e.g., Addis Ababa University" 
                disabled={!isEditing} 
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
              <textarea 
                rows="3" 
                value={profileForm.bio || ''} 
                onChange={(e) => handleFormChange('bio', e.target.value)}
                placeholder="Tell us about yourself..." 
                disabled={!isEditing} 
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`}
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      {showPasswordForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                <div className="relative">
                  <input 
                    type={showCurrentPassword ? 'text' : 'password'} 
                    value={passwordForm.currentPassword}
                    onChange={(e) => handlePasswordFormChange('currentPassword', e.target.value)}
                    placeholder="Enter your current password"
                    autoComplete="off"
                    className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                <div className="relative">
                  <input 
                    type={showNewPassword ? 'text' : 'password'} 
                    value={passwordForm.newPassword}
                    onChange={(e) => handlePasswordFormChange('newPassword', e.target.value)}
                    autoComplete="off"
                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white ${
                      passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    value={passwordForm.confirmPassword}
                    onChange={(e) => handlePasswordFormChange('confirmPassword', e.target.value)}
                    autoComplete="off"
                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white ${
                      passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                )}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handlePasswordChange}
                  disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
                <button 
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  disabled={loading}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Account Security</p>
                <p className="text-lg font-semibold text-green-600">Strong</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Button */}
      {!showPasswordForm && (
        <div className="flex justify-center">
          <button 
            onClick={() => setShowPasswordForm(true)}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            Change Password
          </button>
        </div>
      )}
    </div>
  );

  const renderCertificates = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Certificates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((cert) => (
          <div key={cert} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="h-32 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg mb-4 flex items-center justify-center">
              <Award className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Certificate {cert}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Completed Course {cert}</p>
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              <Download className="h-4 w-4 inline mr-2" />
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderExams = () => (
    <StudentExams showNotification={showNotification} />
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'courses': return renderCourses();
      case 'enrolled-courses': return renderCourses();
      case 'view-grades': return renderGrades();
      case 'course-materials': return <CourseMaterials selectedCourse={selectedCourse} onBack={() => setActiveTab('courses')} />;
      case 'assignments': return renderAssignments();
      case 'certificates': return renderCertificates();
      case 'exams': return renderExams();
      case 'payments': return renderPayments();
      case 'schedule': return renderSchedule();
      case 'progress': return renderProgress();
      case 'messages': return (
        <div className="h-full min-h-[600px]">
          <ChatInterface onChatViewed={updateUnreadCount} />
        </div>
      );
      case 'review': return <div className="p-4"><iframe src="/leave-review" className="w-full h-screen border-0 rounded-lg" title="Leave Review"></iframe></div>;
      case 'profile': return renderProfile();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Popup Notification */}
      <PopupNotification
        type={notification.type}
        title={notification.title}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-56 lg:w-64 bg-white dark:bg-gray-800 shadow-2xl border-r border-gray-200 dark:border-gray-700 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-300 ease-in-out lg:translate-x-0 lg:fixed lg:inset-y-0 flex flex-col overflow-hidden`}>
        {/* Logo/Title */}
        <div className="flex items-center justify-between h-12 lg:h-14 px-3 lg:px-4 bg-gradient-to-r from-blue-600 to-indigo-600 border-b border-blue-500 flex-shrink-0">
          <button 
            onClick={() => {
              setActiveTab('profile');
              setSidebarOpen(false);
            }}
            className="flex items-center hover:bg-white/10 rounded-lg p-2 transition-colors cursor-pointer w-full"
          >
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white/20 rounded-full flex items-center justify-center mr-2 overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-xs lg:text-sm">{user ? getInitials(user.name) : 'EY'}</span>
              )}
            </div>
            <div className="min-w-0 flex-1 text-center">
              <h1 className="text-xs lg:text-sm font-bold truncate text-white">{user ? formatDisplayName(user.name) : 'Elyas Yenealem'}</h1>
              <p className="text-blue-50 text-xs flex items-center justify-center">
                <GraduationCap className="h-3 w-3 mr-1" />
                <span className="truncate">{user ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}</span>
              </p>
            </div>
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 lg:px-3 py-2 overflow-y-auto">
          <div className="space-y-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <div key={tab.id}>
                  <button
                    onClick={() => {
                      if (tab.id === 'browse-courses') {
                        window.location.href = '/courses';
                      } else if (tab.id === 'courses' && tab.hasSubmenu) {
                        setShowCoursesSubmenu(!showCoursesSubmenu);
                      } else if (tab.id === 'course-resources' && tab.hasSubmenu) {
                        setShowCourseResourcesSubmenu(!showCourseResourcesSubmenu);
                      } else if (tab.id === 'messages') {
                        setActiveTab(tab.id);
                        setSidebarOpen(false);
                      } else {
                        setActiveTab(tab.id);
                        setSidebarOpen(false);
                      }
                    }}
                    className={`w-full flex items-center px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200 group ${
                      activeTab === tab.id || 
                      (tab.id === 'courses' && (activeTab === 'enrolled-courses' || activeTab === 'view-grades')) ||
                      (tab.id === 'course-resources' && (activeTab === 'course-materials' || activeTab === 'assignments' || activeTab === 'certificates' || activeTab === 'exams'))
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 mr-2 flex-shrink-0 ${
                      activeTab === tab.id || 
                      (tab.id === 'courses' && (activeTab === 'enrolled-courses' || activeTab === 'view-grades')) ||
                      (tab.id === 'course-resources' && (activeTab === 'course-materials' || activeTab === 'assignments' || activeTab === 'certificates' || activeTab === 'exams'))
                        ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <span className="font-medium truncate">{tab.name}</span>
                    {tab.id === 'messages' && unreadCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold">
                        {unreadCount}
                      </span>
                    )}
                    {tab.hasSubmenu && (
                      <svg className={`ml-auto h-3 w-3 transition-transform ${
                        (tab.id === 'courses' && showCoursesSubmenu) || (tab.id === 'course-resources' && showCourseResourcesSubmenu) ? 'rotate-180' : ''
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                    {(activeTab === tab.id || 
                      (tab.id === 'courses' && (activeTab === 'enrolled-courses' || activeTab === 'view-grades')) ||
                      (tab.id === 'course-resources' && (activeTab === 'course-materials' || activeTab === 'assignments' || activeTab === 'certificates' || activeTab === 'exams'))
                    ) && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                    )}
                  </button>
                  
                  {/* Submenu for My Courses */}
                  {tab.id === 'courses' && tab.hasSubmenu && showCoursesSubmenu && (
                    <div className="ml-4 mt-0.5 space-y-0.5">
                      <button
                        onClick={() => {
                          setActiveTab('enrolled-courses');
                          setShowCoursesSubmenu(false);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-2 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                          activeTab === 'enrolled-courses'
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <BookOpen className="h-3 w-3 mr-1.5 flex-shrink-0" />
                        <span className="font-medium truncate">Enrolled Courses</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('view-grades');
                          setShowCoursesSubmenu(false);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-2 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                          activeTab === 'view-grades'
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <Award className="h-3 w-3 mr-1.5 flex-shrink-0" />
                        <span className="font-medium truncate">View Grades</span>
                      </button>
                    </div>
                  )}
                  
                  {/* Submenu for Course Resources */}
                  {tab.id === 'course-resources' && tab.hasSubmenu && showCourseResourcesSubmenu && (
                    <div className="ml-4 mt-0.5 space-y-0.5">
                      <button
                        onClick={() => {
                          setActiveTab('course-materials');
                          setShowCourseResourcesSubmenu(false);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-2 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                          activeTab === 'course-materials'
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <FileText className="h-3 w-3 mr-1.5 flex-shrink-0" />
                        <span className="font-medium truncate">Course Materials</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('assignments');
                          setShowCourseResourcesSubmenu(false);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-2 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                          activeTab === 'assignments'
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <FileText className="h-3 w-3 mr-1.5 flex-shrink-0" />
                        <span className="font-medium truncate">Assignments</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('certificates');
                          setShowCourseResourcesSubmenu(false);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-2 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                          activeTab === 'certificates'
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <Award className="h-3 w-3 mr-1.5 flex-shrink-0" />
                        <span className="font-medium truncate">Certificates</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('exams');
                          setShowCourseResourcesSubmenu(false);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-2 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                          activeTab === 'exams'
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <CheckCircle className="h-3 w-3 mr-1.5 flex-shrink-0" />
                        <span className="font-medium truncate">Exams</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Separator */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            
            {/* Additional Navigation Items */}
            <div className="mt-2 pt-1">
              {/* Email Subscription Bell */}
              {user && user.role === 'student' && (
                  <div className="relative mb-1">
                  <button
                    onClick={() => setShowSubscribeMenu(!showSubscribeMenu)}
                    className="w-full flex items-center px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-md transition-all duration-200"
                  >
                    {isSubscribed ? (
                      <Bell className="h-3.5 w-3.5 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    ) : (
                      <BellOff className="h-3.5 w-3.5 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    )}
                    <span className="font-medium truncate">{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
                    {isSubscribed && (
                      <div className="ml-auto w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    )}
                  </button>
                  {showSubscribeMenu && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-50">
                      <button
                        onClick={toggleSubscription}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded whitespace-nowrap"
                      >
                        {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              <button
                onClick={() => {
                  setActiveTab('messages');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'messages'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <MessageCircle className={`h-3.5 w-3.5 mr-2 flex-shrink-0 ${
                  activeTab === 'messages' ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                }`} />
                <span className="font-medium truncate">Chats</span>
                {unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold">
                    {unreadCount}
                  </span>
                )}
                {activeTab === 'messages' && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                )}
              </button>
              <button
                onClick={handleBackToWebsite}
                className="w-full flex items-center px-2 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-md transition-all duration-200"
              >
                <Home className="h-3.5 w-3.5 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <span className="font-medium truncate">Back to Website</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-2 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 rounded-md transition-all duration-200 mt-0.5"
              >
                <LogOut className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                <span className="font-medium truncate">Logout</span>
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile hamburger button - Fixed */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-3 left-3 z-40 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 shadow-lg transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-3 lg:p-8 pt-14 lg:pt-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </div>
      {/* Click outside to close notifications */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        ></div>
      )}
      
      {/* Join Class Modal */}
      {showJoinModal && joinModalData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className={`px-6 py-4 rounded-t-2xl ${
              joinModalData.type === 'waiting' ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
              joinModalData.type === 'join' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
              joinModalData.type === 'late' ? 'bg-gradient-to-r from-red-500 to-rose-500' :
              'bg-gradient-to-r from-gray-500 to-slate-500'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    {joinModalData.type === 'waiting' && <Clock className="h-5 w-5 text-white" />}
                    {joinModalData.type === 'join' && <Video className="h-5 w-5 text-white" />}
                    {joinModalData.type === 'late' && <X className="h-5 w-5 text-white" />}
                    {joinModalData.type === 'ended' && <CheckCircle className="h-5 w-5 text-white" />}
                  </div>
                  <h3 className="text-lg font-bold text-white">{joinModalData.title}</h3>
                </div>
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              {/* Course Info */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {joinModalData.session.course?.title || 'Course'}
                </h4>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatTimeWithAMPM(joinModalData.session.startTime)} - {formatTimeWithAMPM(joinModalData.session.endTime)}</span>
                  </div>
                  {joinModalData.session.room && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>Room: {joinModalData.session.room}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              <div className={`p-4 rounded-xl mb-6 ${
                joinModalData.type === 'waiting' ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' :
                joinModalData.type === 'join' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
                joinModalData.type === 'late' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
                'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600'
              }`}>
                <p className={`text-sm font-medium ${
                  joinModalData.type === 'waiting' ? 'text-orange-800 dark:text-orange-200' :
                  joinModalData.type === 'join' ? 'text-green-800 dark:text-green-200' :
                  joinModalData.type === 'late' ? 'text-red-800 dark:text-red-200' :
                  'text-gray-800 dark:text-gray-200'
                }`}>
                  {joinModalData.message}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {joinModalData.canJoin && joinModalData.link ? (
                  <button
                    onClick={() => {
                      window.open(joinModalData.link, '_blank', 'noopener,noreferrer');
                      try { attendanceAPI.join({ courseId: joinModalData.courseId, sessionDay: joinModalData.day }); } catch {}
                      setShowJoinModal(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Video className="h-4 w-4" />
                    {joinModalData.actionText}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowJoinModal(false)}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                      joinModalData.type === 'waiting' ? 'bg-orange-600 hover:bg-orange-700 text-white' :
                      joinModalData.type === 'join' ? 'bg-green-600 hover:bg-green-700 text-white' :
                      joinModalData.type === 'late' ? 'bg-red-600 hover:bg-red-700 text-white' :
                      'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {joinModalData.actionText}
                  </button>
                )}
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Class Modal */}
      {showJoinModal && joinModalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    joinModalData.type === 'join' ? 'bg-green-100 dark:bg-green-900/20' :
                    joinModalData.type === 'waiting' ? 'bg-blue-100 dark:bg-blue-900/20' :
                    joinModalData.type === 'late' ? 'bg-red-100 dark:bg-red-900/20' :
                    'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {joinModalData.type === 'join' ? (
                      <Video className="h-6 w-6 text-green-600" />
                    ) : joinModalData.type === 'waiting' ? (
                      <Clock className="h-6 w-6 text-blue-600" />
                    ) : joinModalData.type === 'late' ? (
                      <X className="h-6 w-6 text-red-600" />
                    ) : (
                      <CheckCircle className="h-6 w-6 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{joinModalData.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{joinModalData.session.course?.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 text-center mb-4">
                  {joinModalData.message}
                </p>
                
                {/* Session Details */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Time:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatTimeWithAMPM(joinModalData.session.startTime)} - {formatTimeWithAMPM(joinModalData.session.endTime)}
                    </span>
                  </div>
                  {joinModalData.session.room && (
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-600 dark:text-gray-400">Room:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{joinModalData.session.room}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
                {joinModalData.canJoin && joinModalData.link && (
                  <button
                    onClick={() => {
                      window.open(joinModalData.link, '_blank');
                      try { attendanceAPI.join({ courseId: joinModalData.courseId, sessionDay: joinModalData.day }); } catch {}
                      setShowJoinModal(false);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Video className="h-4 w-4" />
                    {joinModalData.actionText}
                  </button>
                )}
                {joinModalData.canJoin && !joinModalData.link && (
                  <button
                    onClick={() => setShowJoinModal(false)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    {joinModalData.actionText}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
