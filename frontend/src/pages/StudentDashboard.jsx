import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, Award, Calendar, TrendingUp, LogOut, User, CreditCard, FileText, Video, Download, Bell, Clock, CheckCircle, GraduationCap, Home, Camera, X, Eye, EyeOff, Star } from 'lucide-react';
import { profileAPI, enrollmentAPI, paymentAPI } from '../services/api';
import PopupNotification from '../components/PopupNotification';
import { getUserData, updateUserData, clearUserData } from '../utils/userUtils';

const StudentDashboard = () => {
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
              <img src="http://localhost:3000/assets/images/${payment.paymentMethod === 'telebirr' ? 'telebirrlogo.png' : 'cbe.png'}" alt="${payment.paymentMethod}">
              <p>${payment.paymentMethod === 'telebirr' ? 'Telebirr' : 'CBE'}</p>
            </div>
            
            <div class="header">
              <img src="http://localhost:3000/assets/images/aaulogo.png" alt="AAU Logo">
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
                    <span>${payment.user.systemId || payment.user._id.slice(-8).toUpperCase()}</span>
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
                    <span style="text-transform: capitalize;">${payment.paymentMethod}</span>
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
                      <h4>${payment.course.title}</h4>
                      <p>Instructor: ${payment.course.instructor?.name || 'Instructor'}</p>
                      <p style="font-size: 14px; color: #6b7280;">Certificate of Completion Included</p>
                    </div>
                    <div class="course-price">
                      <div class="amount">${payment.amount} ETB</div>
                      <div class="type">One-time payment</div>
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
            <img src="http://localhost:3000/assets/images/${payment.paymentMethod === 'telebirr' ? 'telebirrlogo.png' : 'cbe.png'}" alt="${payment.paymentMethod}" style="width: 40px; height: 40px; object-fit: contain; margin-bottom: 5px;">
            <p style="font-size: 12px; font-weight: bold; color: #374151; text-transform: uppercase; margin: 0;">
              ${payment.paymentMethod === 'telebirr' ? 'Telebirr' : 'CBE'}
            </p>
          </div>
          
          <div style="border-bottom: 2px solid #000; padding: 40px; text-align: center;">
            <img src="http://localhost:3000/assets/images/aaulogo.png" alt="AAU Logo" style="height: 64px; width: auto; margin-bottom: 16px;">
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
                <div style="margin-bottom: 8px; display: flex; justify-content: space-between;"><span style="color: #6b7280;">Student ID:</span><span style="color: #000; font-weight: 500;">${payment.user.systemId || payment.user._id.slice(-8).toUpperCase()}</span></div>
              </div>
              
              <div>
                <h3 style="font-size: 18px; font-weight: bold; color: #000; margin-bottom: 16px; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">Payment Information</h3>
                <div style="margin-bottom: 8px; display: flex; justify-content: space-between;"><span style="color: #6b7280;">Date:</span><span style="color: #000; font-weight: 500;">${new Date(payment.createdAt).toLocaleDateString()}</span></div>
                <div style="margin-bottom: 8px; display: flex; justify-content: space-between;"><span style="color: #6b7280;">Method:</span><span style="color: #000; font-weight: 500; text-transform: capitalize;">${payment.paymentMethod}</span></div>
                <div style="margin-bottom: 8px; display: flex; justify-content: space-between;"><span style="color: #6b7280;">Transaction ID:</span><span style="color: #000; font-weight: 500;">${payment.transactionId}</span></div>
              </div>
            </div>
            
            <div style="margin-bottom: 40px;">
              <h3 style="font-size: 18px; font-weight: bold; color: #000; margin-bottom: 16px; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">Course Details</h3>
              <div style="background: #f9fafb; padding: 24px; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <h4 style="font-size: 18px; font-weight: bold; color: #000; margin: 0 0 8px 0;">${payment.course.title}</h4>
                    <p style="color: #6b7280; margin: 0 0 8px 0;">Instructor: ${payment.course.instructor?.name || 'Instructor'}</p>
                    <p style="font-size: 14px; color: #6b7280; margin: 0;">Certificate of Completion Included</p>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 24px; font-weight: bold; color: #000;">${payment.amount} ETB</div>
                    <div style="font-size: 14px; color: #6b7280;">One-time payment</div>
                  </div>
                </div>
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
      setEnrolledCourses(response.data.courses);
    } catch (error) {
      console.error('Fetch enrolled courses error:', error);
      showNotification('error', 'Error', 'Failed to fetch enrolled courses');
    } finally {
      setCoursesLoading(false);
    }
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
    
    // Fetch fresh user data from API
    fetchUserProfile();
    // Fetch enrolled courses
    fetchEnrolledCourses();
  }, [searchParams]);

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
      showNotification('error', 'Password Change Failed', error.response?.data?.message || 'Failed to change password');
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
    { id: 'courses', name: 'My Courses', icon: BookOpen },
    { id: 'browse-courses', name: 'Browse Courses', icon: BookOpen },
    { id: 'course-details', name: 'Course Materials', icon: FileText },
    { id: 'assignments', name: 'Assignments', icon: FileText },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'schedule', name: 'Schedule', icon: Calendar },
    { id: 'progress', name: 'Progress', icon: TrendingUp },
    { id: 'certificates', name: 'Certificates', icon: Award },
    { id: 'review', name: 'Leave Review', icon: Star },
    { id: 'profile', name: 'My Profile', icon: User }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total My Courses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{enrolledCourses.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Grade</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">85%</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">4</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
              <Bell className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">New assignment posted</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Mathematics - Due in 3 days</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Grade published</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Physics Quiz - 92%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Upcoming Live Sessions</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 border rounded">
              <Video className="h-5 w-5 text-red-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Advanced Mathematics</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Today, 2:00 PM</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Join</button>
            </div>
            <div className="flex items-center p-3 border rounded">
              <Video className="h-5 w-5 text-red-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Physics Lab</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Tomorrow, 10:00 AM</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Join</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h2>
        <button 
          onClick={() => window.location.href = '/courses'}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Browse Courses
        </button>
      </div>
      
      <div className="inline-block bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total My Courses</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{enrolledCourses.length}</p>
          </div>
        </div>
      </div>
      
      {coursesLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : enrolledCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Courses Enrolled</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't enrolled in any courses yet.</p>
          <button 
            onClick={() => window.location.href = '/courses'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
            <div key={course._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
              <div className="relative">
                <img 
                  src={course.image || `https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop`}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Active</span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                  {course.title}
                </h3>
                
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full mr-3 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{course.instructor?.name || 'Instructor'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Instructor</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{course.studentCount || 0} students</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    setSelectedCourse(course);
                    setActiveTab('course-details');
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  View Course Materials
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment History</h2>
      
      {paymentsLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Payments Found</h3>
          <p className="text-gray-500 dark:text-gray-400">You haven't made any payments yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img 
                          src={payment.course?.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=50'}
                          alt={payment.course?.title}
                          className="w-12 h-12 rounded-lg object-cover mr-4"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {payment.course?.title || 'Course'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Receipt: {payment.receiptNumber}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {payment.amount} Birr
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 capitalize">
                        {payment.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
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
      )}
      

    </div>
  );

  const renderAssignments = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-4">
            <button className="text-blue-600 border-b-2 border-blue-600 pb-2">Pending</button>
            <button className="text-gray-600 dark:text-gray-400 pb-2">Submitted</button>
            <button className="text-gray-600 dark:text-gray-400 pb-2">Graded</button>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[1, 2, 3, 4].map((assignment) => (
            <div key={assignment} className="p-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Assignment {assignment}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mathematics Course</p>
                <p className="text-sm text-red-600">Due: Dec 25, 2024</p>
              </div>
              <div className="flex space-x-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Submit</button>
                <button className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Schedule</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-7 gap-4 mb-6">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="text-center font-medium text-gray-900 dark:text-white">{day}</div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-4">
            <div className="col-span-2 bg-blue-100 dark:bg-blue-900/20 p-3 rounded">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Advanced Math</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">10:00 - 11:30 AM</p>
            </div>
            <div></div>
            <div className="col-span-2 bg-green-100 dark:bg-green-900/20 p-3 rounded">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">Physics Lab</p>
              <p className="text-xs text-green-700 dark:text-green-300">2:00 - 3:30 PM</p>
            </div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );

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
                    className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" 
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
                    className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
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

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'courses': return renderCourses();
      case 'course-details': return renderCourseDetails();
      case 'assignments': return renderAssignments();
      case 'payments': return renderPayments();
      case 'schedule': return renderSchedule();
      case 'progress': return renderProgress();
      case 'certificates': return renderCertificates();
      case 'review': return <div className="p-4"><iframe src="/leave-review" className="w-full h-screen border-0 rounded-lg" title="Leave Review"></iframe></div>;
      case 'profile': return renderProfile();
      default: return renderOverview();
    }
  };

  const renderCourseDetails = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('courses')}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          ← Back to Courses
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {selectedCourse?.title || 'Course Materials'}
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-6">
          <img 
            src={selectedCourse?.image || `https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200&h=150&fit=crop`}
            alt={selectedCourse?.title}
            className="w-32 h-24 object-cover rounded-xl"
          />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {selectedCourse?.title || 'Course Title'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Instructor: {selectedCourse?.instructor?.name || 'Instructor'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Video className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Video Lectures</h3>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((video) => (
              <div key={video} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Video className="h-4 w-4 text-gray-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Lecture {video}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{10 + video} minutes</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">PDF Materials</h3>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((pdf) => (
              <div key={pdf} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <FileText className="h-4 w-4 text-red-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Chapter {pdf} Notes</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PDF • 2.{pdf} MB</p>
                </div>
                <Download className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

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
      <div className={`fixed inset-y-0 left-0 z-50 w-64 lg:w-72 bg-white dark:bg-gray-800 shadow-2xl border-r border-gray-200 dark:border-gray-700 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-300 ease-in-out lg:translate-x-0 lg:fixed lg:inset-y-0 flex flex-col overflow-hidden`}>
        {/* Logo/Title */}
        <div className="flex items-center justify-between h-16 lg:h-20 px-4 lg:px-6 bg-gradient-to-r from-blue-600 to-indigo-600 border-b border-blue-500 flex-shrink-0">
          <button 
            onClick={() => setActiveTab('profile')}
            className="flex items-center hover:bg-white/10 rounded-lg p-2 transition-colors cursor-pointer w-full"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 rounded-full flex items-center justify-center mr-2 lg:mr-3 overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-sm lg:text-lg">{user ? getInitials(user.name) : 'EY'}</span>
              )}
            </div>
            <div className="min-w-0 flex-1 text-center">
              <h1 className="text-sm lg:text-lg font-bold truncate text-white">{user ? user.name : 'Elyas Yenealem'}</h1>
              <p className="text-blue-50 text-xs lg:text-sm flex items-center justify-center">
                <GraduationCap className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                <span className="truncate">{user ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}</span>
              </p>
              {user?.bio && (
                <p className="text-blue-50/90 text-xs mt-1 truncate italic">
                  "{user.bio}"
                </p>
              )}
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
        <nav className="flex-1 px-3 lg:px-4 py-3 lg:py-4 overflow-y-auto">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'browse-courses') {
                      window.location.href = '/courses';
                    } else {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                    }
                  }}
                  className={`w-full flex items-center px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all duration-200 group ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 mr-2 lg:mr-3 flex-shrink-0 ${
                    activeTab === tab.id ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  <span className="font-medium truncate">{tab.name}</span>
                  {activeTab === tab.id && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  )}
                </button>
              );
            })}
            
            {/* Separator */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2 mt-100"></div>
            
            {/* Additional Navigation Items */}
            <div className="mt-6 lg:mt-100 pt-3 lg:pt-4">
              <button
                onClick={handleBackToWebsite}
                className="w-full flex items-center px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg transition-all duration-200"
              >
                <Home className="h-4 w-4 mr-2 lg:mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <span className="font-medium truncate">Back to Website</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 rounded-lg transition-all duration-200 mt-1"
              >
                <LogOut className="h-4 w-4 mr-2 lg:mr-3 flex-shrink-0" />
                <span className="font-medium truncate">Logout</span>
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-72">
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
    </div>
  );
};

export default StudentDashboard;