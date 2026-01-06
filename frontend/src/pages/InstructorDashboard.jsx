import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Users, Calendar, LogOut, FileText, Video, BarChart3, Settings, Upload, Clock, CheckCircle, Bell, BellRing, BellOff, Home, User, Camera, X, Eye, EyeOff, Star, Search, Globe, Heart } from 'lucide-react';
import { profileAPI, courseAPI, instructorAPI, subscriptionAPI, notificationAPI } from '../services/api';
import PopupNotification from '../components/PopupNotification';
import { getUserData, updateUserData, clearUserData } from '../utils/userUtils';
import { useTranslation } from 'react-i18next';

const InstructorDashboard = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentForGrading, setSelectedStudentForGrading] = useState(null);
  const [gradeFields, setGradeFields] = useState([{ name: '', mark: '' }]);
  const [gradeLetter, setGradeLetter] = useState('');
  const [selectedStudentCourse, setSelectedStudentCourse] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSubscribeMenu, setShowSubscribeMenu] = useState(false);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [selectedNotificationCourse, setSelectedNotificationCourse] = useState(null);
  const [notificationForm, setNotificationForm] = useState({ title: '', message: '' });
  const [showCourseResourcesSubmenu, setShowCourseResourcesSubmenu] = useState(false);

  // Admin notifications state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [sortByLikes, setSortByLikes] = useState(false);

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
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // Silently fail if audio is not supported or blocked
      console.log('Audio notification blocked by browser');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      setUser(userData);
      setProfileForm(userData);
      if (userData.profileImage) {
        setProfileImage(userData.profileImage);
      }
    }
    fetchUserProfile();
    fetchInstructorCourses();
    fetchInstructorStudents();
    if (userData) {
      fetchSubscriptionStatus();
      fetchNotifications();
    }
    
    // Set up periodic notification check (every 30 seconds)
    const notificationInterval = setInterval(() => {
      if (userData) {
        fetchNotifications();
      }
    }, 30000);
    
    // Cleanup interval on unmount
    return () => {
      clearInterval(notificationInterval);
    };
  }, []);

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

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await subscriptionAPI.getStatus();
      setIsSubscribed(response.data.isSubscribed);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  const playSound = (type) => {
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
    } catch (error) {
      // Silently fail if audio is not supported or blocked
      console.log('Audio notification blocked by browser');
    }
  };

  const toggleSubscription = async () => {
    try {
      setLoading(true);
      if (isSubscribed) {
        await subscriptionAPI.unsubscribe(user.email);
        setIsSubscribed(false);
        playSound('unsubscribe');
        showToast('Unsubscribed successfully!', 'unsubscribe');
      } else {
        await subscriptionAPI.subscribe(user.email);
        setIsSubscribed(true);
        playSound('subscribe');
        showToast('Subscribed successfully!', 'success');
      }
      setShowSubscribeMenu(false);
    } catch (error) {
      console.error('Subscription error:', error);
      showToast(error.response?.data?.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-24 right-4 z-50 px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 transform translate-x-full`;
    
    // Set background color based on the type parameter
    if (type === 'success') {
      toast.style.backgroundColor = '#10b981'; // green-500
    } else if (type === 'error' || type === 'unsubscribe') {
      toast.style.backgroundColor = '#ef4444'; // red-500
    } else if (type === 'warning') {
      toast.style.backgroundColor = '#f59e0b'; // amber-500
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

  const fetchInstructorStudents = async () => {
    try {
      setStudentsLoading(true);
      const params = {};
      if (selectedCourseFilter !== 'all') params.course = selectedCourseFilter;
      
      const response = await instructorAPI.getStudents(params);
      const studentsData = response.data.students || [];
      const coursesData = response.data.courses || [];
      
      setStudents(studentsData);
      setInstructorCourses(coursesData);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
      setInstructorCourses([]);
      showNotification('error', 'Error', 'Failed to fetch students');
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructorStudents();
  }, [selectedCourseFilter]);

  const filteredStudents = students.filter(student => {
    if (!searchTerm) return true;
    return student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (student.systemId && student.systemId.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const fetchInstructorCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getInstructorCourses();
      const activeCourses = response.data.courses || [];
      setCourses(activeCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
      showNotification('error', 'Error', 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      const userData = response.data.user;
      setUser(userData);
      setProfileForm(userData);
      if (userData.profileImage) {
        setProfileImage(userData.profileImage);
      }
      updateUserData(userData);
    } catch (error) {
      console.error('Fetch profile error:', error);
    }
  };

  const handleProfileSave = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.updateProfile(profileForm);
      const updatedUser = response.data.user;
      setUser(updatedUser);
      setIsEditing(false);
      
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

  // Generate initials from user name
  const getInitials = (name) => {
    if (!name) return 'IN';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleBackToWebsite = () => {
    window.location.href = '/';
  };

  const handleLogout = () => {
    clearUserData();
    window.location.href = '/login';
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: GraduationCap },
    { id: 'students', name: 'Students', icon: Users },
    { id: 'courses', name: 'My Courses', icon: BookOpen },
    { id: 'course-resources', name: 'Course Resources', icon: FileText, hasSubmenu: true },
    { id: 'schedule', name: 'Schedule', icon: Calendar },
    { id: 'send-notification', name: 'Send Notification', icon: Bell },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'review', name: 'Leave Review', icon: Star },
    { id: 'profile', name: 'My Profile', icon: User }
  ];

  const renderOverview = () => (
    <div className="space-y-4 lg:space-y-6">
      {/* Dashboard Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl mr-4">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Instructor Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Welcome back{user ? `, ${user.name}` : ''}, manage your courses and students</p>
            </div>
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (hasNewNotifications) {
                  setHasNewNotifications(false);
                }
              }}
              className="relative p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700"
            >
              {hasNewNotifications ? (
                <BellRing className="h-6 w-6 text-blue-600 animate-pulse" />
              ) : (
                <Bell className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              )}
              {hasNewNotifications && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
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
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                from {notif.sender.role === 'superadmin' ? 'superadmin' : notif.sender.role === 'admin' ? 'admin' : notif.sender.role}
                              </p>
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
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">My Courses</p>
              <p className="text-2xl lg:text-3xl font-bold mt-2 text-gray-900 dark:text-white">{courses?.length || 0}</p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Active courses</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
              <BookOpen className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Students</p>
              <p className="text-2xl lg:text-3xl font-bold mt-2 text-gray-900 dark:text-white">{courses?.reduce((sum, course) => sum + (course.students?.length || 0), 0) || 0}</p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Enrolled students</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
              <Users className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 lg:p-6">
        <div className="flex items-center mb-4 lg:mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
            <Calendar className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
          </div>
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">Today's Schedule</h3>
        </div>
        <div className="space-y-3 lg:space-y-4">
          <div className="flex items-center p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-l-4 border-blue-500">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Advanced Mathematics</h4>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">10:00 AM - 11:30 AM • on Zoom</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">32 students enrolled</p>
            </div>
            <div className="text-right">
              <span className="px-2 lg:px-3 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
                Upcoming
              </span>
            </div>
          </div>
          
          <div className="flex items-center p-3 lg:p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border-l-4 border-emerald-500">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Physics Laboratory</h4>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">2:00 PM - 3:30 PM • on Zoom</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">28 students enrolled</p>
            </div>
            <div className="text-right">
              <span className="px-2 lg:px-3 py-1 bg-emerald-500 text-white text-xs rounded-full font-medium">
                Later Today
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 lg:p-6">
        <div className="flex items-center mb-4 lg:mb-6">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-3">
            <Settings className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600" />
          </div>
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <button 
            onClick={() => setActiveTab('materials')}
            className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-200 group border border-purple-200 dark:border-purple-700"
          >
            <Upload className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">Upload Material</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('assignments')}
            className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-900/30 dark:hover:to-red-900/30 transition-all duration-200 group border border-orange-200 dark:border-orange-700"
          >
            <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">New Assignment</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('exams')}
            className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl hover:from-indigo-100 hover:to-blue-100 dark:hover:from-indigo-900/30 dark:hover:to-blue-900/30 transition-all duration-200 group border border-indigo-200 dark:border-indigo-700"
          >
            <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">Create Exam</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('analytics')}
            className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl hover:from-teal-100 hover:to-cyan-100 dark:hover:from-teal-900/30 dark:hover:to-cyan-900/30 transition-all duration-200 group border border-teal-200 dark:border-teal-700"
          >
            <BarChart3 className="h-6 w-6 lg:h-8 lg:w-8 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderCourses = () => {
    const sortedCourses = sortByLikes 
      ? [...(courses || [])].sort((a, b) => (b.stars?.length || 0) - (a.stars?.length || 0))
      : (courses || []);

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">My Courses</h2>
          <button
            onClick={() => setSortByLikes(!sortByLikes)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortByLikes 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {sortByLikes ? 'Show All' : 'Sort by Likes'}
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : sortedCourses.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Courses Assigned</h3>
            <p className="text-gray-500 dark:text-gray-400">You don't have any active courses assigned to you yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {sortedCourses.map((course) => (
              <div key={course._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6">
                <div className="h-24 lg:h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-4 overflow-hidden">
                  {course.image ? (
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
                  )}
                </div>
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-2">{course.title}</h3>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{course.students?.length || 0} Students Enrolled</p>
                  <div className="flex items-center gap-1 text-red-500">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm font-medium">{course.stars?.length || 0}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4"></p>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      setSelectedCourse(course);
                      setActiveTab('materials');
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm"
                  >
                    Manage
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedCourse(course);
                      setActiveTab('course-videos');
                    }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Video className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMaterials = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
          {selectedCourse && (
            <button 
              onClick={() => setActiveTab('courses')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Courses
            </button>
          )}
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
            {selectedCourse ? `${selectedCourse.title} Materials` : 'Learning Materials'}
          </h2>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm lg:text-base">
          <Upload className="h-4 w-4 mr-2" />
          Upload Material
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2 lg:gap-4">
            <button className="text-blue-600 border-b-2 border-blue-600 pb-2 text-sm lg:text-base">All Materials</button>
            <button className="text-gray-600 dark:text-gray-400 pb-2 text-sm lg:text-base">PDFs</button>
            <button className="text-gray-600 dark:text-gray-400 pb-2 text-sm lg:text-base">Videos</button>
            <button className="text-gray-600 dark:text-gray-400 pb-2 text-sm lg:text-base">Lecture Notes</button>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[1, 2, 3, 4, 5].map((material) => (
            <div key={material} className="p-4 lg:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-4">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base lg:text-lg font-medium text-gray-900 dark:text-white">Material {material}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedCourse ? selectedCourse.title : 'Mathematics Course'} • Uploaded Dec {material}, 2024
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAssignments = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Assignments</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm lg:text-base">
          Create Assignment
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2 lg:gap-4">
            <button className="text-blue-600 border-b-2 border-blue-600 pb-2 text-sm lg:text-base">Active</button>
            <button className="text-gray-600 dark:text-gray-400 pb-2 text-sm lg:text-base">Pending Review</button>
            <button className="text-gray-600 dark:text-gray-400 pb-2 text-sm lg:text-base">Completed</button>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[1, 2, 3, 4].map((assignment) => (
            <div key={assignment} className="p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                <div>
                  <h3 className="text-base lg:text-lg font-medium text-gray-900 dark:text-white">Assignment {assignment}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mathematics Course</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Due: Dec {25 + assignment}, 2024</p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                  <button className="text-green-600 hover:text-green-800 text-sm">Grade</button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-2">
                <span className="text-gray-600 dark:text-gray-400">Submissions: {15 + assignment}/30</span>
                <span className="text-gray-600 dark:text-gray-400">Avg Grade: {85 + assignment}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderQuizzes = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Quizzes</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm lg:text-base">
          Create Quiz
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {[1, 2, 3, 4, 5, 6].map((quiz) => (
          <div key={quiz} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">Quiz {quiz}</h3>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded">
                Active
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Mathematics Course</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{10 + quiz} Questions • {20 + quiz} min</p>
            <div className="flex justify-between text-sm mb-4">
              <span className="text-gray-600 dark:text-gray-400">Attempts: {25 + quiz}</span>
              <span className="text-gray-600 dark:text-gray-400">Avg: {80 + quiz}%</span>
            </div>
            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm">View Results</button>
              <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Course Schedules</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>{courses?.length || 0} courses</span>
        </div>
      </div>
      
      {(courses?.length || 0) === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Courses Available</h3>
          <p className="text-gray-500 dark:text-gray-400">Create courses to manage schedules.</p>
        </div>
      ) : (
        <div className="space-y-4 lg:space-y-6">
          {(courses || []).map((course) => (
            <div key={course._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 lg:p-6">
              <div className="flex flex-col gap-4 mb-4 lg:mb-6">
                <div className="flex items-center gap-3">
                  <img 
                    src={course.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=60'}
                    alt={course.title}
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white truncate">{course.title}</h3>
                    <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">{course.students?.length || 0} students enrolled</p>
                  </div>
                </div>
                <button 
                  onClick={() => alert(`Edit schedule for ${course.title}`)}
                  className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Edit Schedule
                </button>
              </div>
              
              {/* Desktop Schedule Grid */}
              <div className="hidden lg:block">
                <div className="grid grid-cols-7 gap-4 mb-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="text-center font-medium text-gray-900 dark:text-white text-base">{day}</div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-4">
                  {course.title.includes('Math') ? (
                    <>
                      <div className="col-span-2 bg-blue-100 dark:bg-blue-900/20 p-3 rounded">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">{course.title}</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">10:00 - 11:30 AM</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">Room 101</p>
                      </div>
                      <div></div>
                      <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">{course.title}</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">2:00 - 3:30 PM</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">Room 101</p>
                      </div>
                      <div></div>
                      <div></div>
                      <div></div>
                    </>
                  ) : course.title.includes('Physics') ? (
                    <>
                      <div></div>
                      <div className="col-span-2 bg-green-100 dark:bg-green-900/20 p-3 rounded">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">{course.title}</p>
                        <p className="text-xs text-green-700 dark:text-green-300">9:00 - 10:30 AM</p>
                        <p className="text-xs text-green-600 dark:text-green-400">Lab 201</p>
                      </div>
                      <div></div>
                      <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">{course.title}</p>
                        <p className="text-xs text-green-700 dark:text-green-300">1:00 - 2:30 PM</p>
                        <p className="text-xs text-green-600 dark:text-green-400">Lab 201</p>
                      </div>
                      <div></div>
                      <div></div>
                    </>
                  ) : (
                    <>
                      <div></div>
                      <div></div>
                      <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded">
                        <p className="text-sm font-medium text-purple-900 dark:text-purple-100">{course.title}</p>
                        <p className="text-xs text-purple-700 dark:text-purple-300">11:00 - 12:30 PM</p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">Room 301</p>
                      </div>
                      <div></div>
                      <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded">
                        <p className="text-sm font-medium text-purple-900 dark:text-purple-100">{course.title}</p>
                        <p className="text-xs text-purple-700 dark:text-purple-300">3:00 - 4:30 PM</p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">Room 301</p>
                      </div>
                      <div></div>
                      <div></div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Mobile Schedule List */}
              <div className="lg:hidden space-y-3">
                {course.title.includes('Math') ? (
                  <>
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Monday & Tuesday</span>
                        <span className="text-xs text-blue-600 dark:text-blue-400">Room 101</span>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300">10:00 - 11:30 AM</p>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Thursday</span>
                        <span className="text-xs text-blue-600 dark:text-blue-400">Room 101</span>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300">2:00 - 3:30 PM</p>
                    </div>
                  </>
                ) : course.title.includes('Physics') ? (
                  <>
                    <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-green-900 dark:text-green-100">Tuesday & Wednesday</span>
                        <span className="text-xs text-green-600 dark:text-green-400">Lab 201</span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-300">9:00 - 10:30 AM</p>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-green-900 dark:text-green-100">Friday</span>
                        <span className="text-xs text-green-600 dark:text-green-400">Lab 201</span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-300">1:00 - 2:30 PM</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Wednesday</span>
                        <span className="text-xs text-purple-600 dark:text-purple-400">Room 301</span>
                      </div>
                      <p className="text-xs text-purple-700 dark:text-purple-300">11:00 - 12:30 PM</p>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Friday</span>
                        <span className="text-xs text-purple-600 dark:text-purple-400">Room 301</span>
                      </div>
                      <p className="text-xs text-purple-700 dark:text-purple-300">3:00 - 4:30 PM</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">My Students</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Users className="h-4 w-4" />
          <span>{filteredStudents.length} students found</span>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow text-center">
          <p className="text-lg lg:text-2xl font-bold text-blue-600">{students.length}</p>
          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Total Students</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow text-center">
          <p className="text-lg lg:text-2xl font-bold text-green-600">{instructorCourses.length}</p>
          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">My Courses</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow text-center">
          <p className="text-lg lg:text-2xl font-bold text-purple-600">
            {students.reduce((sum, student) => sum + student.totalCourses, 0)}
          </p>
          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Total Enrollments</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow text-center">
          <p className="text-lg lg:text-2xl font-bold text-orange-600">
            {students.length > 0 ? Math.round(students.reduce((sum, student) => {
              const avgAttendance = student.courses.reduce((acc, course) => acc + course.attendance, 0) / student.courses.length;
              return sum + avgAttendance;
            }, 0) / students.length) : 0}%
          </p>
          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Avg Attendance</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
            />
          </div>
          <select 
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
          >
            <option value="all">All My Courses</option>
            {instructorCourses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {studentsLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Enrolled Courses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {selectedCourseFilter === 'all' ? 'Avg Attendance' : `Attendance on ${instructorCourses.find(c => c._id === selectedCourseFilter)?.title || 'Course'}`}
                    </th>
                    {selectedCourseFilter !== 'all' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredStudents.map((student) => {
                    const avgAttendance = student.courses.length > 0 
                      ? Math.round(student.courses.reduce((sum, course) => sum + course.attendance, 0) / student.courses.length)
                      : 0;
                    
                    return (
                      <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mr-3 overflow-hidden flex-shrink-0">
                              {student.profileImage ? (
                                <img src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                  {student.name?.charAt(0)?.toUpperCase() || 'S'}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{student.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {student.systemId || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {student.totalCourses}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  avgAttendance >= 80 ? 'bg-green-500' :
                                  avgAttendance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${avgAttendance}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{avgAttendance}%</span>
                          </div>
                        </td>
                        {selectedCourseFilter !== 'all' && (
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setSelectedStudentForGrading(student)}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                              Submit Grade
                            </button>
                          </td>
                        )}

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Students Found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStudents.map((student) => {
                  const avgAttendance = student.courses.length > 0 
                    ? Math.round(student.courses.reduce((sum, course) => sum + course.attendance, 0) / student.courses.length)
                    : 0;
                  
                  return (
                    <div key={student._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
                      {/* Student Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {student.profileImage ? (
                            <img src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              {student.name?.charAt(0)?.toUpperCase() || 'S'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                            {student.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            {student.email}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            ID: {student.systemId || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{student.totalCourses}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Courses</p>
                        </div>
                        <div className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  avgAttendance >= 80 ? 'bg-green-500' :
                                  avgAttendance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${avgAttendance}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-900 dark:text-white">{avgAttendance}%</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {selectedCourseFilter === 'all' ? 'Attendance' : `Attendance on ${instructorCourses.find(c => c._id === selectedCourseFilter)?.title || 'Course'}`}
                          </p>
                        </div>
                      </div>

                      {/* Course Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {selectedCourseFilter === 'all' ? (
                          student.courses.map((course) => (
                            <button
                              key={course._id}
                              onClick={() => setSelectedStudentCourse({ student, course })}
                              className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                            >
                              {course.title}
                            </button>
                          ))
                        ) : (
                          <button
                            onClick={() => setSelectedStudentForGrading(student)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                          >
                            Submit Grade
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Grade Submission Modal */}
      {selectedStudentForGrading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Submit Grade</h3>
                <button
                  onClick={() => {
                    setSelectedStudentForGrading(null);
                    setGradeFields([{ name: '', mark: '' }]);
                    setGradeLetter('');
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mx-auto mb-3">
                    {selectedStudentForGrading.profileImage ? (
                      <img src={selectedStudentForGrading.profileImage} alt={selectedStudentForGrading.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-gray-600 dark:text-gray-300">
                        {selectedStudentForGrading.name?.charAt(0)?.toUpperCase() || 'S'}
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedStudentForGrading.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {instructorCourses.find(c => c._id === selectedCourseFilter)?.title || 'Course'}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Grade Fields</label>
                    {gradeFields.map((field, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Field name (e.g., Quiz 1)"
                          value={field.name}
                          onChange={(e) => {
                            const newFields = [...gradeFields];
                            newFields[index].name = e.target.value;
                            setGradeFields(newFields);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Mark"
                          value={field.mark}
                          onChange={(e) => {
                            const newFields = [...gradeFields];
                            newFields[index].mark = e.target.value;
                            setGradeFields(newFields);
                          }}
                          className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
                        />
                        {gradeFields.length > 1 && (
                          <button
                            onClick={() => {
                              const newFields = gradeFields.filter((_, i) => i !== index);
                              setGradeFields(newFields);
                            }}
                            className="px-2 py-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setGradeFields([...gradeFields, { name: '', mark: '' }])}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      + Add Field
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Grade Letter</label>
                    <select
                      value={gradeLetter}
                      onChange={(e) => setGradeLetter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
                    >
                      <option value="">Select Grade</option>
                      <option value="A+">A+</option>
                      <option value="A">A</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B">B</option>
                      <option value="B-">B-</option>
                      <option value="C+">C+</option>
                      <option value="C">C</option>
                      <option value="C-">C-</option>
                      <option value="D">D</option>
                      <option value="F">F</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        console.log('Submitting grade:', {
                          student: selectedStudentForGrading,
                          course: selectedCourseFilter,
                          fields: gradeFields,
                          gradeLetter
                        });
                        setSelectedStudentForGrading(null);
                        setGradeFields([{ name: '', mark: '' }]);
                        setGradeLetter('');
                        showNotification('success', 'Grade Submitted', 'Grade has been submitted successfully');
                      }}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStudentForGrading(null);
                        setGradeFields([{ name: '', mark: '' }]);
                        setGradeLetter('');
                      }}
                      className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Attendance Modal */}
      {selectedStudentCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Course Attendance</h3>
                <button
                  onClick={() => setSelectedStudentCourse(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mx-auto mb-3">
                    {selectedStudentCourse.student.profileImage ? (
                      <img src={selectedStudentCourse.student.profileImage} alt={selectedStudentCourse.student.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-gray-600 dark:text-gray-300">
                        {selectedStudentCourse.student.name?.charAt(0)?.toUpperCase() || 'S'}
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedStudentCourse.student.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedStudentCourse.course.title}
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="text-center mb-4">
                    <div className={`text-4xl font-bold mb-2 ${
                      selectedStudentCourse.course.attendance >= 80 ? 'text-green-600' :
                      selectedStudentCourse.course.attendance >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {selectedStudentCourse.course.attendance}%
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</p>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        selectedStudentCourse.course.attendance >= 80 ? 'bg-green-500' :
                        selectedStudentCourse.course.attendance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${selectedStudentCourse.course.attendance}%` }}
                    ></div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Enrolled: {new Date(selectedStudentCourse.course.enrollmentDate).toLocaleDateString()}
                    </p>
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
                  user ? getInitials(user.name) : 'IN'
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
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{user?.name || 'Instructor Name'}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-1">{user?.email || 'email@example.com'}</p>
            <p className="text-blue-600 dark:text-blue-400 font-medium capitalize">{user?.role || 'Instructor'}</p>
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

        {/* Professional Information */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Professional Information</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instructor ID</label>
              <input 
                type="text" 
                value={profileForm.systemId || ''} 
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 cursor-not-allowed dark:text-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
              <input 
                type="text" 
                value={profileForm.department || ''} 
                onChange={(e) => handleFormChange('department', e.target.value)}
                placeholder="e.g., Computer Science" 
                disabled={!isEditing} 
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Qualification</label>
              <select 
                value={profileForm.program || ''} 
                onChange={(e) => handleFormChange('program', e.target.value)}
                disabled={!isEditing} 
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`}
              >
                <option value="">Select Qualification</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="PhD">PhD</option>
                <option value="Diploma">Diploma</option>
                <option value="Certificate">Certificate</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specialization</label>
              <input 
                type="text" 
                value={profileForm.specialization || ''} 
                onChange={(e) => handleFormChange('specialization', e.target.value)}
                placeholder="e.g., Machine Learning, Mathematics" 
                disabled={!isEditing} 
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Experience</label>
              <select 
                value={profileForm.experience || ''} 
                onChange={(e) => handleFormChange('experience', e.target.value)}
                disabled={!isEditing} 
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`}
              >
                <option value="">Select Experience</option>
                <option value="0-2 years">0-2 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="6-10 years">6-10 years</option>
                <option value="10+ years">10+ years</option>
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

  const renderCourseVideos = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab('courses')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Courses
          </button>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
            {selectedCourse ? `${selectedCourse.title} Videos` : 'Course Videos'}
          </h2>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Video className="h-4 w-4" />
          Add Video
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4].map((video) => (
          <div key={video} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="h-32 bg-gray-300 rounded-lg mb-3 flex items-center justify-center">
              <Video className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="font-semibold mb-2">Video {video}</h3>
            <p className="text-sm text-gray-600 mb-3">Duration: {5 + video} minutes</p>
            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-600 text-white py-1 px-2 rounded text-sm hover:bg-blue-700">
                Play
              </button>
              <button className="px-2 py-1 border rounded text-sm hover:bg-gray-50">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  const renderExams = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Exams</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CheckCircle className="h-4 w-4" />
          <span>{courses?.length || 0} courses available</span>
        </div>
      </div>
      
      {(courses?.length || 0) === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Courses Available</h3>
          <p className="text-gray-500 dark:text-gray-400">You need courses to create exams.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Course</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Students</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {(courses || []).map((course) => (
                <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img 
                        src={course.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=50'}
                        alt={course.title}
                        className="w-12 h-12 rounded-lg object-cover mr-4"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{course.title}</p>
                        <p className="text-xs text-gray-500">Created {new Date(course.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{course.students?.length || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{course.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1 inline" />
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => alert(`Create Exam for ${course.title}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Create Exam
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Course Performance</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">85%</div>
          <p className="text-gray-600 dark:text-gray-400">Average completion rate</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Student Engagement</h3>
          <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
          <p className="text-gray-600 dark:text-gray-400">Active participation</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Assignment Scores</h3>
          <div className="text-3xl font-bold text-purple-600 mb-2">78%</div>
          <p className="text-gray-600 dark:text-gray-400">Average score</p>
        </div>
      </div>
    </div>
  );

  const renderSendNotification = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Send Notifications</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Bell className="h-4 w-4" />
          <span>{courses?.length || 0} courses</span>
        </div>
      </div>
      
      {(courses?.length || 0) === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Courses Available</h3>
          <p className="text-gray-500 dark:text-gray-400">Create courses to send notifications.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Course</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Students</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {(courses || []).map((course) => (
                  <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img 
                          src={course.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=50'}
                          alt={course.title}
                          className="w-12 h-12 rounded-lg object-cover mr-4"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{course.title}</p>
                          <p className="text-xs text-gray-500">{course.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{course.students?.length || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{course.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedNotificationCourse(course);
                          setShowNotificationForm(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        Send to Students
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {(courses || []).map((course) => (
              <div key={course._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
                <div className="flex items-start gap-3 mb-4">
                  <img 
                    src={course.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=60'}
                    alt={course.title}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 truncate">{course.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{course.category}</p>
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Users className="h-3 w-3" />
                      <span className="text-xs">{course.students?.length || 0} students</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedNotificationCourse(course);
                    setShowNotificationForm(true);
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Send to Students
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Notification Form Modal */}
      {showNotificationForm && selectedNotificationCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Send Notification</h3>
                <button
                  onClick={() => {
                    setShowNotificationForm(false);
                    setSelectedNotificationCourse(null);
                    setNotificationForm({ title: '', message: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {selectedNotificationCourse.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Sending to {selectedNotificationCourse.students?.length || 0} enrolled students
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Students will see this notification with your name and course title
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Notification title"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                  <textarea
                    rows="4"
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Notification message"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm resize-none"
                  ></textarea>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={async () => {
                      try {
                        setLoading(true);
                        await notificationAPI.sendNotification({
                          title: notificationForm.title,
                          message: notificationForm.message,
                          role: 'student',
                          course: selectedNotificationCourse._id
                        });
                        
                        setShowNotificationForm(false);
                        setSelectedNotificationCourse(null);
                        setNotificationForm({ title: '', message: '' });
                        showNotification('success', 'Notification Sent', `Notification sent to ${selectedNotificationCourse.title} students`);
                      } catch (error) {
                        console.error('Send notification error:', error);
                        showNotification('error', 'Send Failed', error.response?.data?.message || 'Failed to send notification');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={!notificationForm.title || !notificationForm.message || loading}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Send Notification'}
                  </button>
                  <button
                    onClick={() => {
                      setShowNotificationForm(false);
                      setSelectedNotificationCourse(null);
                      setNotificationForm({ title: '', message: '' });
                    }}
                    className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 text-sm"
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

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'courses': return renderCourses();
      case 'course-videos': return renderCourseVideos();
      case 'materials': return renderMaterials();
      case 'assignments': return renderAssignments();
      case 'exams': return renderExams();
      case 'schedule': return renderSchedule();
      case 'send-notification': return renderSendNotification();
      case 'students': return renderStudents();
      case 'analytics': return renderAnalytics();
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
      <div className={`fixed inset-y-0 left-0 z-50 w-64 lg:w-72 bg-white dark:bg-gray-800 shadow-2xl border-r border-gray-200 dark:border-gray-700 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-300 ease-in-out lg:translate-x-0 lg:fixed lg:inset-y-0 flex flex-col overflow-hidden`}>
        {/* Logo/Title */}
        <div className="flex items-center justify-between h-16 lg:h-20 px-4 lg:px-6 bg-gradient-to-r from-blue-600 to-indigo-600 border-b border-blue-500 flex-shrink-0">
          <button 
            onClick={() => {
              setActiveTab('profile');
              setSidebarOpen(false);
            }}
            className="flex items-center hover:bg-white/10 rounded-lg p-2 transition-colors cursor-pointer w-full"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 rounded-full flex items-center justify-center mr-2 lg:mr-3 overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-sm lg:text-lg">{user ? getInitials(user.name) : 'IN'}</span>
              )}
            </div>
            <div className="min-w-0 flex-1 text-center">
              <h1 className="text-sm lg:text-lg font-bold truncate text-white">{user ? user.name : 'Instructor'}</h1>
              <p className="text-blue-50 text-xs lg:text-sm flex items-center justify-center">
                <GraduationCap className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                <span className="truncate">{user ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Instructor'}</span>
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
                <div key={tab.id}>
                  <button
                    onClick={() => {
                      if (tab.id === 'course-resources' && tab.hasSubmenu) {
                        setShowCourseResourcesSubmenu(!showCourseResourcesSubmenu);
                      } else {
                        setActiveTab(tab.id);
                        setSidebarOpen(false);
                      }
                    }}
                    className={`w-full flex items-center px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all duration-200 group ${
                      activeTab === tab.id || 
                      (tab.id === 'course-resources' && (activeTab === 'materials' || activeTab === 'assignments' || activeTab === 'exams'))
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className={`h-4 w-4 mr-2 lg:mr-3 flex-shrink-0 ${
                      activeTab === tab.id || 
                      (tab.id === 'course-resources' && (activeTab === 'materials' || activeTab === 'assignments' || activeTab === 'exams'))
                        ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <span className="font-medium truncate">{tab.name}</span>
                    {tab.hasSubmenu && (
                      <svg className={`ml-auto h-4 w-4 transition-transform ${
                        showCourseResourcesSubmenu ? 'rotate-180' : ''
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                    {(activeTab === tab.id || 
                      (tab.id === 'course-resources' && (activeTab === 'materials' || activeTab === 'assignments' || activeTab === 'exams'))
                    ) && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                    )}
                  </button>
                  
                  {/* Submenu for Course Resources */}
                  {tab.id === 'course-resources' && tab.hasSubmenu && showCourseResourcesSubmenu && (
                    <div className="ml-6 mt-1 space-y-1">
                      <button
                        onClick={() => {
                          setActiveTab('materials');
                          setShowCourseResourcesSubmenu(false);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all duration-200 ${
                          activeTab === 'materials'
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <FileText className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span className="font-medium truncate">Materials</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('assignments');
                          setShowCourseResourcesSubmenu(false);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all duration-200 ${
                          activeTab === 'assignments'
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <FileText className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span className="font-medium truncate">Assignments</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('exams');
                          setShowCourseResourcesSubmenu(false);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all duration-200 ${
                          activeTab === 'exams'
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <CheckCircle className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span className="font-medium truncate">Exams</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Separator */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2 mt-100"></div>
            
            {/* Additional Navigation Items */}
            <div className="mt-6 lg:mt-100 pt-3 lg:pt-4">
              {/* Email Subscription Bell */}
              <div className="relative mb-2">
                <button
                  onClick={() => setShowSubscribeMenu(!showSubscribeMenu)}
                  className="w-full flex items-center px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg transition-all duration-200"
                >
                  {isSubscribed ? (
                    <Bell className="h-4 w-4 mr-2 lg:mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  ) : (
                    <BellOff className="h-4 w-4 mr-2 lg:mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
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
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded whitespace-nowrap disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : (isSubscribed ? 'Unsubscribe' : 'Subscribe')}
                    </button>
                  </div>
                )}
              </div>
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
      {/* Click outside to close subscription menu */}
      {showSubscribeMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSubscribeMenu(false)}
        ></div>
      )}
    </div>
  );
};

export default InstructorDashboard;