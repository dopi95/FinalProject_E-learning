import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Users, Calendar, LogOut, FileText, Video, BarChart3, Settings, Upload, Clock, CheckCircle, Bell, BellRing, BellOff, Home, User, Camera, X, Eye, EyeOff, Star, Search, Globe, Heart, MapPin, Edit, MessageCircle, Plus, Download, Edit3, Trash2 } from 'lucide-react';
import { profileAPI, courseAPI, instructorAPI, subscriptionAPI, notificationAPI, scheduleAPI, scheduleUpdateRequestAPI, materialAPI, assignmentAPI } from '../services/api';
import PopupNotification from '../components/PopupNotification';
import ChatInterface from '../components/ChatInterface';
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
  const [genderStats, setGenderStats] = useState({ male: 0, female: 0 });
  const [topCourses, setTopCourses] = useState([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState('all');
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
  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUpdateScheduleModal, setShowUpdateScheduleModal] = useState(false);
  const [selectedScheduleForUpdate, setSelectedScheduleForUpdate] = useState(null);
  const [updateSessions, setUpdateSessions] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [updateReason, setUpdateReason] = useState('');

  // Materials state
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState('');
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    type: '',
    files: [],
    youtubeLink: '',
    uploadSource: 'device'
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filterType, setFilterType] = useState('all');
  const [viewerModal, setViewerModal] = useState({ show: false, url: '', fileName: '', title: '', type: '' });
  const [editMaterial, setEditMaterial] = useState(null);

  // Assignment state
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    instructions: '',
    dueDate: '',
    course: '',
    file: null
  });
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [showAssignmentDetail, setShowAssignmentDetail] = useState(false);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [fileViewerData, setFileViewerData] = useState({ url: '', fileName: '', type: '' });

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
    fetchSchedules();
    fetchMyRequests();
    fetchUnreadCount();
    fetchAssignments();
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

  // Fetch materials when course changes
  useEffect(() => {
    const fetchMaterials = async () => {
      if (!selectedCourse) {
        setMaterials([]);
        return;
      }
      try {
        setMaterialsLoading(true);
        const response = await materialAPI.getCourseMaterials(selectedCourse._id);
        setMaterials(response.data.materials || []);
      } catch (error) {
        console.error('Fetch materials error:', error);
        setMaterials([]);
      } finally {
        setMaterialsLoading(false);
      }
    };

    fetchMaterials();
  }, [selectedCourse]);

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
      
      // Calculate gender statistics
      const genderCount = studentsData.reduce((acc, student) => {
        if (student.gender === 'male') acc.male++;
        else if (student.gender === 'female') acc.female++;
        return acc;
      }, { male: 0, female: 0 });
      setGenderStats(genderCount);
      
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
    if (!searchTerm && selectedGenderFilter === 'all') return true;
    
    const matchesSearch = !searchTerm || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.systemId && student.systemId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesGender = selectedGenderFilter === 'all' || student.gender === selectedGenderFilter;
    
    return matchesSearch && matchesGender;
  });

  const fetchInstructorCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getInstructorCourses();
      const activeCourses = response.data.courses || [];
      setCourses(activeCourses);
      
      // Calculate top 3 courses by enrollment
      const sortedCourses = activeCourses
        .sort((a, b) => (b.students?.length || 0) - (a.students?.length || 0))
        .slice(0, 3);
      setTopCourses(sortedCourses);
      
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
      showNotification('error', 'Error', 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      setSchedulesLoading(true);
      const response = await scheduleAPI.getSchedules();
      setSchedules(response.data.schedules || []);
    } catch (error) {
      setSchedules([]);
    } finally {
      setSchedulesLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const response = await scheduleUpdateRequestAPI.getMyRequests();
      setMyRequests(response.data.requests || []);
    } catch (error) {
      setMyRequests([]);
    }
  };

  // Fetch assignments
  const fetchAssignments = async () => {
    try {
      setAssignmentsLoading(true);
      const response = await assignmentAPI.getInstructorAssignments();
      setAssignments(response.data.assignments || []);
    } catch (error) {
      console.error('Fetch assignments error:', error);
      setAssignments([]);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  // Create or update assignment
  const handleAssignmentSubmit = async () => {
    try {
      if (!assignmentForm.title || !assignmentForm.instructions || !assignmentForm.dueDate || !assignmentForm.course || (!assignmentForm.file && !editingAssignment)) {
        showNotification('error', 'Error', 'Please fill in all required fields and select a file');
        return;
      }

      setLoading(true);
      
      const formData = {
        title: assignmentForm.title,
        instructions: assignmentForm.instructions,
        dueDate: assignmentForm.dueDate,
        course: assignmentForm.course
      };

      if (assignmentForm.file) {
        formData.file = assignmentForm.file;
      }

      if (editingAssignment) {
        await assignmentAPI.updateAssignment(editingAssignment._id, formData);
        showNotification('success', 'Success', 'Assignment updated successfully');
      } else {
        await assignmentAPI.createAssignment(formData);
        showNotification('success', 'Success', 'Assignment created successfully');
      }

      setShowAssignmentModal(false);
      setAssignmentForm({ title: '', instructions: '', dueDate: '', course: '', file: null });
      setEditingAssignment(null);
      fetchAssignments();
      
      // Close detail modal if it's open and refresh it
      if (showAssignmentDetail && selectedAssignment && editingAssignment && selectedAssignment._id === editingAssignment._id) {
        setShowAssignmentDetail(false);
        setTimeout(() => {
          const updatedAssignment = assignments.find(a => a._id === editingAssignment._id);
          if (updatedAssignment) {
            setSelectedAssignment(updatedAssignment);
            setShowAssignmentDetail(true);
          }
        }, 100);
      }
    } catch (error) {
      console.error('Assignment submit error:', error);
      showNotification('error', 'Error', error.response?.data?.message || 'Failed to save assignment');
    } finally {
      setLoading(false);
    }
  };

  // Delete assignment
  const handleDeleteAssignment = async (assignmentId) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      setLoading(true);
      await assignmentAPI.deleteAssignment(assignmentId);
      showNotification('success', 'Success', 'Assignment deleted successfully');
      fetchAssignments();
    } catch (error) {
      console.error('Delete assignment error:', error);
      showNotification('error', 'Error', 'Failed to delete assignment');
    } finally {
      setLoading(false);
    }
  };

  // Grade submission
  const handleGradeSubmission = async () => {
    try {
      if (!gradeForm.grade || gradeForm.grade < 0 || gradeForm.grade > 100) {
        showNotification('error', 'Error', 'Please enter a valid grade (0-100)');
        return;
      }

      setLoading(true);
      await assignmentAPI.gradeSubmission(
        selectedAssignment._id,
        gradingSubmission._id,
        {
          grade: parseFloat(gradeForm.grade),
          feedback: gradeForm.feedback
        }
      );

      showNotification('success', 'Success', 'Submission graded successfully');
      setGradingSubmission(null);
      setGradeForm({ grade: '', feedback: '' });
      fetchAssignments();
    } catch (error) {
      console.error('Grade submission error:', error);
      showNotification('error', 'Error', 'Failed to grade submission');
    } finally {
      setLoading(false);
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
        <div className="flex items-start sm:items-center justify-between mb-4 gap-3">
          <div className="flex items-start sm:items-center flex-1 min-w-0">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded-xl mr-3 sm:mr-4 flex-shrink-0">
              <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">Instructor Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                Welcome back{user ? `, ${user.name}` : ''}, manage your courses and students
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

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center mb-6">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-3">
              <Users className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600" />
            </div>
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">Student Gender Distribution</h3>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              {/* Donut Chart */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  className="dark:stroke-gray-600"
                />
                {genderStats.male + genderStats.female > 0 && (
                  <>
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="8"
                      strokeDasharray={`${(genderStats.male / (genderStats.male + genderStats.female)) * 251.2} 251.2`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#ec4899"
                      strokeWidth="8"
                      strokeDasharray={`${(genderStats.female / (genderStats.male + genderStats.female)) * 251.2} 251.2`}
                      strokeDashoffset={`-${(genderStats.male / (genderStats.male + genderStats.female)) * 251.2}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </>
                )}
              </svg>
              
              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {genderStats.male + genderStats.female}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Male Students</span>
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {genderStats.male} ({genderStats.male + genderStats.female > 0 ? Math.round((genderStats.male / (genderStats.male + genderStats.female)) * 100) : 0}%)
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-pink-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Female Students</span>
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {genderStats.female} ({genderStats.male + genderStats.female > 0 ? Math.round((genderStats.female / (genderStats.male + genderStats.female)) * 100) : 0}%)
              </div>
            </div>
          </div>
        </div>
        
        {/* Top Courses Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center mb-6">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mr-3">
              <BookOpen className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
            </div>
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">Top 3 Courses by Enrollment</h3>
          </div>
          
          <div className="space-y-4">
            {topCourses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No courses available</p>
              </div>
            ) : (
              topCourses.map((course, index) => {
                const maxStudents = Math.max(...topCourses.map(c => c.students?.length || 0));
                const percentage = maxStudents > 0 ? ((course.students?.length || 0) / maxStudents) * 100 : 0;
                const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500'];
                const bgColors = ['bg-green-100 dark:bg-green-900/20', 'bg-blue-100 dark:bg-blue-900/20', 'bg-purple-100 dark:bg-purple-900/20'];
                
                return (
                  <div key={course._id} className={`p-4 rounded-xl ${bgColors[index]} border border-gray-200 dark:border-gray-600`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 ${colors[index]} rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {course.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {course.category || 'General'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {course.students?.length || 0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">students</div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${colors[index]} transition-all duration-1000 ease-out`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
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
      <div className="space-y-4 lg:space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">My Courses</h2>
          <button
            onClick={() => setSortByLikes(!sortByLikes)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              sortByLikes 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Heart className={`h-3 w-3 ${sortByLikes ? 'fill-current' : ''}`} />
            {sortByLikes ? 'All' : 'Likes'}
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
          <>
            {/* Mobile Cards View */}
            <div className="lg:hidden space-y-3">
              {sortedCourses.map((course) => (
                <div key={course._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{course.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{course.category || 'General'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                      <div className="flex items-center gap-1 mb-1">
                        <Users className="h-3 w-3 text-gray-400" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Students</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{course.students?.length || 0}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                      <div className="flex items-center gap-1 mb-1">
                        <Heart className="h-3 w-3 text-red-500" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Likes</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{course.stars?.length || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedCourse(course);
                        setActiveTab('materials');
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Manage
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedCourse(course);
                        setFilterType('video');
                        setActiveTab('materials');
                      }}
                      className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 p-2 rounded-lg transition-colors"
                    >
                      <Video className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

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
                        Students
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                        Likes
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-gray-200 dark:divide-gray-600">
                    {sortedCourses.map((course, index) => (
                      <tr key={course._id} className={`hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors border-b border-gray-200 dark:border-gray-600 ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'
                      }`}>
                        <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-600">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{course.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{course.category || 'General'}</div>
                        </td>
                        <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-600">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {course.students?.length || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-600">
                          <div className="flex items-center">
                            <Heart className="h-4 w-4 text-red-500 mr-2" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {course.stars?.length || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => {
                                setSelectedCourse(course);
                                setActiveTab('materials');
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                            >
                              Manage
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedCourse(course);
                                setFilterType('video');
                                setActiveTab('materials');
                              }}
                              className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                            >
                              <Video className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderMaterials = () => {
    const handleUploadClick = (type) => {
      setUploadType(type);
      setUploadForm({ ...uploadForm, type });
      setShowUploadModal(true);
    };

    const handleFileChange = (e) => {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length > 0) {
        setUploadForm({ ...uploadForm, files: [...uploadForm.files, ...selectedFiles] });
      }
    };

    const handleUpload = async () => {
      if (!uploadForm.title) {
        showNotification('error', 'Error', 'Title is required');
        return;
      }

      // If editing, update and optionally replace file
      if (editMaterial) {
        try {
          setLoading(true);
          setUploadProgress(10);
          
          // If new file selected, upload it
          if (uploadForm.files.length > 0) {
            const file = uploadForm.files[0];
            const materialData = {
              title: uploadForm.title,
              description: uploadForm.description,
              type: uploadForm.type,
              courseId: selectedCourse._id,
              youtubeLink: uploadForm.uploadSource === 'youtube' ? uploadForm.youtubeLink : '',
              file: uploadForm.uploadSource === 'device' ? file : null
            };
            
            setUploadProgress(30);
            // Delete old material
            await materialAPI.deleteMaterial(editMaterial._id);
            setUploadProgress(60);
            // Create new one
            await materialAPI.uploadMaterial(materialData);
            setUploadProgress(100);
          } else {
            // Just update title and description
            setUploadProgress(50);
            await materialAPI.updateMaterial(editMaterial._id, {
              title: uploadForm.title,
              description: uploadForm.description
            });
            setUploadProgress(100);
          }
          
          showNotification('success', 'Success', 'Material updated successfully');
          
          // Refresh materials first
          setUploadProgress(0);
          const response = await materialAPI.getCourseMaterials(selectedCourse._id);
          setMaterials(response.data.materials || []);
          
          // Then close modal
          setShowUploadModal(false);
          setEditMaterial(null);
          setUploadForm({
            title: '',
            description: '',
            type: '',
            files: [],
            youtubeLink: '',
            uploadSource: 'device'
          });
        } catch (error) {
          console.error('Update error:', error);
          showNotification('error', 'Update Failed', error.response?.data?.message || 'Failed to update material');
          setUploadProgress(0);
        } finally {
          setLoading(false);
        }
        return;
      }

      if (uploadForm.type === 'video' && uploadForm.uploadSource === 'youtube') {
        if (!uploadForm.youtubeLink) {
          showNotification('error', 'Error', 'YouTube link is required');
          return;
        }
        
        // Upload YouTube link
        try {
          setLoading(true);
          setUploadProgress(50);
          
          const materialData = {
            title: uploadForm.title,
            description: uploadForm.description,
            type: uploadForm.type,
            courseId: selectedCourse._id,
            youtubeLink: uploadForm.youtubeLink,
            file: null
          };
          
          await materialAPI.uploadMaterial(materialData);
          setUploadProgress(100);
          
          showNotification('success', 'Success', 'YouTube video added successfully');
          setShowUploadModal(false);
          setUploadForm({
            title: '',
            description: '',
            type: '',
            files: [],
            youtubeLink: '',
            uploadSource: 'device'
          });
          setUploadProgress(0);
          
          // Refresh materials
          const response = await materialAPI.getCourseMaterials(selectedCourse._id);
          setMaterials(response.data.materials || []);
        } catch (error) {
          console.error('Upload error:', error);
          showNotification('error', 'Upload Failed', error.response?.data?.message || 'Failed to add YouTube video');
          setUploadProgress(0);
        } finally {
          setLoading(false);
        }
        return;
      }
      
      if (uploadForm.files.length === 0) {
        showNotification('error', 'Error', 'At least one file is required');
        return;
      }

      try {
        setLoading(true);
        setUploadProgress(10);

        // Upload each file
        for (let i = 0; i < uploadForm.files.length; i++) {
          const file = uploadForm.files[i];
          const materialData = {
            title: uploadForm.title,
            description: uploadForm.description,
            type: uploadForm.type,
            courseId: selectedCourse._id,
            youtubeLink: uploadForm.uploadSource === 'youtube' ? uploadForm.youtubeLink : '',
            file: uploadForm.uploadSource === 'device' ? file : null
          };

          setUploadProgress(10 + ((i + 1) / uploadForm.files.length) * 80);
          await materialAPI.uploadMaterial(materialData);
        }

        setUploadProgress(100);

        showNotification('success', 'Success', `${uploadForm.files.length} material(s) uploaded successfully`);
        setShowUploadModal(false);
        setUploadForm({
          title: '',
          description: '',
          type: '',
          files: [],
          youtubeLink: '',
          uploadSource: 'device'
        });
        setUploadProgress(0);
        
        // Refresh materials
        const response = await materialAPI.getCourseMaterials(selectedCourse._id);
        setMaterials(response.data.materials || []);
      } catch (error) {
        console.error('Upload error:', error);
        showNotification('error', 'Upload Failed', error.response?.data?.message || 'Failed to upload material');
        setUploadProgress(0);
      } finally {
        setLoading(false);
      }
    };

    const handleDelete = async (materialId) => {
      if (!confirm('Are you sure you want to delete this material?')) return;

      try {
        setLoading(true);
        await materialAPI.deleteMaterial(materialId);
        showNotification('success', 'Success', 'Material deleted successfully');
        
        // Refresh materials
        const response = await materialAPI.getCourseMaterials(selectedCourse._id);
        setMaterials(response.data.materials || []);
      } catch (error) {
        console.error('Delete error:', error);
        showNotification('error', 'Delete Failed', error.response?.data?.message || 'Failed to delete material');
      } finally {
        setLoading(false);
      }
    };

    const filteredMaterials = filterType === 'all' 
      ? materials 
      : materials.filter(m => m.type === filterType);

    const getFileIcon = (material) => {
      if (material.type === 'video') return <Video className="h-5 w-5 text-red-600" />;
      if (material.type === 'lecture_note') return <Camera className="h-5 w-5 text-purple-600" />;
      return <FileText className="h-5 w-5 text-blue-600" />;
    };

    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => {
              setActiveTab('courses');
              setSelectedCourse(null);
            }}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Courses
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Course Materials</h2>
          {selectedCourse && (
            <button 
              onClick={() => setShowUploadModal(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 transition-all text-sm sm:text-base"
            >
              <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
              Upload Material
            </button>
          )}
        </div>

        {/* Course Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Select Course</label>
          <select
            value={selectedCourse?._id || ''}
            onChange={(e) => {
              const course = courses.find(c => c._id === e.target.value);
              setSelectedCourse(course || null);
            }}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl dark:bg-gray-700 dark:text-white text-sm sm:text-base"
          >
            <option value="">-- Select a course --</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title} ({course.students?.length || 0} students)
              </option>
            ))}
          </select>
        </div>

        {!selectedCourse ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Course Selected</h3>
            <p className="text-gray-500 dark:text-gray-400">Please select a course to manage materials.</p>
          </div>
        ) : (
          <>
            {/* Filter Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {[
                  { id: 'all', label: 'All', icon: FileText },
                  { id: 'video', label: 'Videos', icon: Video },
                  { id: 'file', label: 'Files', icon: FileText },
                  { id: 'lecture_note', label: 'Notes', icon: Camera }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setFilterType(id)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                      filterType === id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Materials List */}
            {materialsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Materials Found</h3>
                <p className="text-gray-500 dark:text-gray-400">Upload your first material to get started.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg divide-y divide-gray-200 dark:divide-gray-700">
                {filteredMaterials.map((material) => (
                  <div key={material._id} className="p-3 sm:p-4 lg:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex items-start gap-2 sm:gap-4 flex-1 min-w-0">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                          {getFileIcon(material)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">{material.title}</h3>
                          {material.description && (
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{material.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="px-2 py-0.5 sm:py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full font-medium capitalize text-xs">
                              {material.type.replace('_', ' ')}
                            </span>
                            {material.fileName && !material.youtubeLink && (
                              <span className="font-mono truncate max-w-[150px] sm:max-w-none">{material.fileName}</span>
                            )}
                            {material.fileSize && !material.youtubeLink && (
                              <span className="hidden sm:inline">{(material.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                            )}
                            <span className="hidden sm:inline">{new Date(material.createdAt).toLocaleDateString()}</span>
                            {material.youtubeLink && (
                              <span className="text-red-600 dark:text-red-400">YouTube</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
                        {material.youtubeLink ? (
                          <button
                            onClick={() => {
                              const videoId = material.youtubeLink.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
                              const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId[1]}` : material.youtubeLink;
                              setViewerModal({ 
                                show: true, 
                                url: embedUrl, 
                                fileName: material.fileName, 
                                title: material.title,
                                type: 'video'
                              });
                            }}
                            className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs sm:text-sm font-medium transition-colors text-center"
                          >
                            View
                          </button>
                        ) : material.fileType?.includes('pdf') || material.fileType?.includes('word') || material.fileType?.includes('powerpoint') || material.fileType?.includes('presentation') ? (
                          <button
                            onClick={() => setViewerModal({ 
                              show: true, 
                              url: material.fileUrl, 
                              fileName: material.fileName, 
                              title: material.title,
                              type: material.fileType?.includes('pdf') ? 'pdf' : 'office'
                            })}
                            className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs sm:text-sm font-medium transition-colors text-center"
                          >
                            View
                          </button>
                        ) : (
                          <button
                            onClick={() => setViewerModal({ 
                              show: true, 
                              url: material.fileUrl, 
                              fileName: material.fileName, 
                              title: material.title,
                              type: material.fileType?.includes('image') ? 'image' : 'file'
                            })}
                            className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs sm:text-sm font-medium transition-colors"
                          >
                            View
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditMaterial(material);
                            setUploadForm({
                              title: material.title,
                              description: material.description || '',
                              type: material.type,
                              files: material.fileName ? [{ name: material.fileName, size: material.fileSize || 0 }] : [],
                              youtubeLink: material.youtubeLink || '',
                              uploadSource: material.youtubeLink ? 'youtube' : 'device'
                            });
                            setShowUploadModal(true);
                          }}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm font-medium transition-colors"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDelete(material._id)}
                          disabled={loading}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs sm:text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* File Viewer Modal */}
        {viewerModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600">
                <div>
                  <h3 className="text-xl font-bold text-white">{viewerModal.title || viewerModal.fileName}</h3>
                  <p className="text-sm text-blue-100 mt-1">{viewerModal.fileName}</p>
                </div>
                <button
                  onClick={() => setViewerModal({ show: false, url: '', fileName: '', title: '', type: '' })}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900">
                {viewerModal.type === 'pdf' ? (
                  <iframe
                    src={`https://docs.google.com/gview?url=${encodeURIComponent(viewerModal.url)}&embedded=true`}
                    className="w-full h-full border-0"
                    title="PDF Viewer"
                  />
                ) : viewerModal.type === 'image' ? (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <img
                      src={viewerModal.url}
                      alt={viewerModal.fileName}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : viewerModal.type === 'video' ? (
                  <iframe
                    src={viewerModal.url}
                    className="w-full h-full border-0"
                    title="Video Player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : viewerModal.type === 'office' ? (
                  <iframe
                    src={`https://docs.google.com/gview?url=${encodeURIComponent(viewerModal.url)}&embedded=true`}
                    className="w-full h-full border-0"
                    title="Office Document Viewer"
                  />
                ) : (
                  <iframe
                    src={viewerModal.url}
                    className="w-full h-full border-0"
                    title="File Viewer"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{editMaterial ? 'Update Material' : 'Upload Material'}</h3>
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setEditMaterial(null);
                      setUploadForm({
                        title: '',
                        description: '',
                        type: '',
                        files: [],
                        youtubeLink: '',
                        uploadSource: 'device'
                      });
                      setUploadProgress(0);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Material Type Selection */}
                  {!uploadForm.type && !editMaterial && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <button
                        onClick={() => handleUploadClick('video')}
                        className="p-6 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                      >
                        <Video className="h-12 w-12 text-red-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Video</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Upload video or YouTube link</p>
                      </button>
                      <button
                        onClick={() => handleUploadClick('file')}
                        className="p-6 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                      >
                        <FileText className="h-12 w-12 text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">File</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PDF, Word, PowerPoint</p>
                      </button>
                      <button
                        onClick={() => handleUploadClick('lecture_note')}
                        className="p-6 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                      >
                        <Camera className="h-12 w-12 text-purple-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Lecture Note</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Images, Photos</p>
                      </button>
                    </div>
                  )}

                  {/* Upload Form */}
                  {uploadForm.type && (
                    <>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                          Uploading: {uploadForm.type === 'video' ? 'Video' : uploadForm.type === 'file' ? 'File' : 'Lecture Note'}
                        </p>
                      </div>

                      {/* Video Source Selection */}
                      {uploadForm.type === 'video' && (
                        <div className="flex gap-4">
                          <button
                            onClick={() => setUploadForm({ ...uploadForm, uploadSource: 'device' })}
                            className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                              uploadForm.uploadSource === 'device'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-600'
                            }`}
                          >
                            <Upload className="h-6 w-6 mx-auto mb-2" />
                            <p className="font-medium text-sm">From Device</p>
                          </button>
                          <button
                            onClick={() => setUploadForm({ ...uploadForm, uploadSource: 'youtube' })}
                            className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                              uploadForm.uploadSource === 'youtube'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-600'
                            }`}
                          >
                            <Video className="h-6 w-6 mx-auto mb-2" />
                            <p className="font-medium text-sm">YouTube Link</p>
                          </button>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
                        <input
                          type="text"
                          value={uploadForm.title}
                          onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                          placeholder="Enter material title"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                        <textarea
                          rows="3"
                          value={uploadForm.description}
                          onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                          placeholder="Enter material description (optional)"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                        ></textarea>
                      </div>

                      {/* YouTube Link Input */}
                      {uploadForm.type === 'video' && uploadForm.uploadSource === 'youtube' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">YouTube Link *</label>
                          <input
                            type="url"
                            value={uploadForm.youtubeLink}
                            onChange={(e) => setUploadForm({ ...uploadForm, youtubeLink: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      )}

                      {/* File Upload */}
                      {uploadForm.uploadSource === 'device' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {uploadForm.type === 'video' ? 'Video File *' : uploadForm.type === 'file' ? 'Document Files *' : 'Image Files *'}
                          </label>
                          
                          {/* Selected Files List */}
                          {uploadForm.files.length > 0 && (
                            <div className="space-y-2 mb-3">
                              {uploadForm.files.map((file, index) => (
                                <div key={index} className="border-2 border-blue-500 rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <FileText className="h-6 w-6 text-blue-600" />
                                      <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => {
                                        const newFiles = uploadForm.files.filter((_, i) => i !== index);
                                        setUploadForm({ ...uploadForm, files: newFiles });
                                      }}
                                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                      <X className="h-5 w-5 text-red-600" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Upload Area */}
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                            <input
                              type="file"
                              onChange={handleFileChange}
                              accept={uploadForm.type === 'video' ? 'video/*' : uploadForm.type === 'file' ? '.pdf,.doc,.docx,.ppt,.pptx' : 'image/*'}
                              className="hidden"
                              id="fileInput"
                              multiple={uploadForm.type !== 'video'}
                            />
                            <label htmlFor="fileInput" className="cursor-pointer">
                              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Click to upload {uploadForm.type !== 'video' ? 'multiple files' : 'file'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {uploadForm.type === 'video' ? 'MP4, AVI, MOV (max 100MB)' : 
                                 uploadForm.type === 'file' ? 'PDF, DOC, DOCX, PPT, PPTX (max 100MB each)' : 
                                 'JPG, PNG, GIF (max 100MB each)'}
                              </p>
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Upload Progress */}
                      {uploadProgress > 0 && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-700 dark:text-gray-300">Uploading...</span>
                            <span className="text-blue-600 dark:text-blue-400">{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleUpload}
                          disabled={loading}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {loading ? (editMaterial ? 'Updating...' : 'Uploading...') : (editMaterial ? 'Update Material' : 'Upload Material')}
                        </button>
                        <button
                          onClick={() => {
                            setUploadForm({ ...uploadForm, type: '' });
                            setEditMaterial(null);
                          }}
                          disabled={loading}
                          className="px-6 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 font-medium disabled:opacity-50 transition-all"
                        >
                          Back
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAssignments = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Assignments</h2>
        <button 
          onClick={() => {
            setShowAssignmentModal(true);
            setEditingAssignment(null);
            setAssignmentForm({ title: '', instructions: '', dueDate: '', course: '', file: null });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm lg:text-base flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Assignment
        </button>
      </div>

      {assignmentsLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Assignments</h3>
          <p className="text-gray-500 dark:text-gray-400">Create your first assignment to get started.</p>
        </div>
      ) : (
        <>
          {/* Mobile Cards View */}
          <div className="lg:hidden space-y-3">
            {assignments.map((assignment) => {
              const submissionCount = assignment.submissions?.length || 0;
              const gradedCount = assignment.submissions?.filter(s => s.grade !== undefined).length || 0;
              const isOverdue = new Date() > new Date(assignment.dueDate);
              
              return (
                <div key={assignment._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setShowAssignmentDetail(true);
                        }}
                        className="text-base font-semibold text-blue-600 hover:text-blue-800 mb-1 text-left"
                      >
                        {assignment.title}
                      </button>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{courses.find(c => c._id === assignment.course)?.title || 'Unknown Course'}</p>
                      <p className={`text-xs mt-1 ${
                        isOverdue ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      assignment.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      assignment.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Submissions</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{submissionCount}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Graded</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{gradedCount}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setShowSubmissionsModal(true);
                      }}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      View Submissions
                    </button>
                    <button 
                      onClick={() => {
                        setEditingAssignment(assignment);
                        setAssignmentForm({
                          title: assignment.title,
                          instructions: assignment.instructions,
                          dueDate: new Date(assignment.dueDate).toISOString().slice(0, 16),
                          course: assignment.course,
                          file: assignment.file ? { name: assignment.file.fileName, isExisting: true, url: assignment.file.fileUrl } : null
                        });
                        setShowAssignmentModal(true);
                      }}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteAssignment(assignment._id)}
                      className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Assignment</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Submissions</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {assignments.map((assignment) => {
                    const submissionCount = assignment.submissions?.length || 0;
                    const gradedCount = assignment.submissions?.filter(s => s.grade !== undefined).length || 0;
                    const isOverdue = new Date() > new Date(assignment.dueDate);
                    
                    return (
                      <tr key={assignment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowAssignmentDetail(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {assignment.title}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {courses.find(c => c._id === assignment.course)?.title || 'Unknown Course'}
                        </td>
                        <td className="px-6 py-4">
                          <div className={`text-sm ${
                            isOverdue ? 'text-red-600' : 'text-gray-900 dark:text-white'
                          }`}>
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(assignment.dueDate).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {submissionCount} submitted
                          </div>
                          <div className="text-xs text-gray-500">
                            {gradedCount} graded
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            new Date() > new Date(assignment.dueDate) ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                            assignment.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            assignment.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {new Date() > new Date(assignment.dueDate) ? 'Overdue' : 
                             assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => {
                                setSelectedAssignment(assignment);
                                setShowSubmissionsModal(true);
                              }}
                              className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 text-sm font-medium"
                            >
                              View
                            </button>
                            <button 
                              onClick={() => {
                                setEditingAssignment(assignment);
                                setAssignmentForm({
                                  title: assignment.title,
                                  instructions: assignment.instructions,
                                  dueDate: new Date(assignment.dueDate).toISOString().slice(0, 16),
                                  course: assignment.course,
                                  file: assignment.file ? { name: assignment.file.fileName, isExisting: true, url: assignment.file.fileUrl } : null
                                });
                                setShowAssignmentModal(true);
                              }}
                              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteAssignment(assignment._id)}
                              className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingAssignment ? 'Edit Assignment' : 'Create Assignment'}
                </h3>
                <button
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setEditingAssignment(null);
                    setAssignmentForm({ title: '', instructions: '', dueDate: '', course: '', file: null });
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                    placeholder="Assignment title"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course *</label>
                  <select
                    value={assignmentForm.course}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, course: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instructions *</label>
                  <textarea
                    rows="4"
                    value={assignmentForm.instructions}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, instructions: e.target.value })}
                    placeholder="Assignment instructions and requirements"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attachment *</label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, file: e.target.files[0] })}
                      className="hidden"
                      id="assignmentFile"
                      required
                    />
                    <label htmlFor="assignmentFile" className="cursor-pointer">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Click to upload file *
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Any file type (max 100MB)
                      </p>
                    </label>
                    {assignmentForm.file && (
                      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          {assignmentForm.file.isExisting ? (
                            <>
                              Current: {assignmentForm.file.name}
                              <a href={assignmentForm.file.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 underline">View</a>
                            </>
                          ) : (
                            `Selected: ${assignmentForm.file.name}`
                          )}
                        </p>
                        <button
                          type="button"
                          onClick={() => setAssignmentForm({ ...assignmentForm, file: null })}
                          className="text-red-600 hover:text-red-700 ml-2"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAssignmentSubmit}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (editingAssignment ? 'Updating...' : 'Creating...') : (editingAssignment ? 'Update Assignment' : 'Create Assignment')}
                  </button>
                  <button
                    onClick={() => {
                      setShowAssignmentModal(false);
                      setEditingAssignment(null);
                      setAssignmentForm({ title: '', instructions: '', dueDate: '', course: '', file: null });
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

      {/* File Viewer Modal */}
      {showFileViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div>
                <h3 className="text-xl font-bold text-white">{fileViewerData.fileName}</h3>
                <p className="text-sm text-blue-100 mt-1">File Viewer</p>
              </div>
              <button
                onClick={() => {
                  setShowFileViewer(false);
                  setShowAssignmentDetail(true);
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900">
              {fileViewerData.type === 'image' ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <img
                    src={fileViewerData.url}
                    alt={fileViewerData.fileName}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <iframe
                  src={fileViewerData.url}
                  className="w-full h-full border-0"
                  title="File Viewer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assignment Detail Modal */}
      {showAssignmentDetail && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedAssignment.title}</h3>
                <button
                  onClick={() => {
                    setShowAssignmentDetail(false);
                    setSelectedAssignment(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Course</h4>
                  <div className="text-gray-700 dark:text-gray-300 break-words">
                    {courses.find(c => c._id === selectedAssignment.course)?.title || 'Unknown Course'}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Due Date & Time</h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {new Date(selectedAssignment.dueDate).toLocaleString()}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Instructions</h4>
                  <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
                    {selectedAssignment.instructions}
                  </div>
                </div>

                {selectedAssignment.file && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Attachment</h4>
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-700 dark:text-gray-300 font-medium break-words">{selectedAssignment.file.fileName}</p>
                        <p className="text-sm text-gray-500 break-words">
                          {(selectedAssignment.file.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const fileType = selectedAssignment.file.fileType;
                          let viewUrl = selectedAssignment.file.fileUrl;
                          let type = 'file';
                          
                          if (fileType?.includes('pdf')) {
                            viewUrl = `https://docs.google.com/gview?url=${encodeURIComponent(selectedAssignment.file.fileUrl)}&embedded=true`;
                            type = 'pdf';
                          } else if (fileType?.includes('word') || fileType?.includes('document')) {
                            viewUrl = `https://docs.google.com/gview?url=${encodeURIComponent(selectedAssignment.file.fileUrl)}&embedded=true`;
                            type = 'document';
                          } else if (fileType?.includes('powerpoint') || fileType?.includes('presentation')) {
                            viewUrl = `https://docs.google.com/gview?url=${encodeURIComponent(selectedAssignment.file.fileUrl)}&embedded=true`;
                            type = 'presentation';
                          } else if (fileType?.includes('image')) {
                            type = 'image';
                          }
                          
                          setFileViewerData({
                            url: viewUrl,
                            fileName: selectedAssignment.file.fileName,
                            type: type
                          });
                          setShowFileViewer(true);
                          setShowAssignmentDetail(false);
                        }}
                        className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View File
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Status</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    new Date() > new Date(selectedAssignment.dueDate) ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                    selectedAssignment.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    selectedAssignment.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {new Date() > new Date(selectedAssignment.dueDate) ? 'Overdue' : 
                     selectedAssignment.status.charAt(0).toUpperCase() + selectedAssignment.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {showSubmissionsModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedAssignment.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedAssignment.submissions?.length || 0} submissions
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowSubmissionsModal(false);
                    setSelectedAssignment(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {selectedAssignment.submissions?.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Submissions Yet</h4>
                  <p className="text-gray-500 dark:text-gray-400">Students haven't submitted this assignment yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedAssignment.submissions.map((submission) => (
                    <div key={submission._id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {submission.student?.name || 'Unknown Student'}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Submitted: {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                          {submission.file && (
                            <div className="mt-2">
                              <a
                                href={submission.file.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                              >
                                <Download className="h-4 w-4" />
                                {submission.file.fileName}
                              </a>
                            </div>
                          )}
                          {submission.grade !== undefined && (
                            <div className="mt-2">
                              <span className={`px-2 py-1 rounded text-sm font-medium ${
                                submission.grade >= 80 ? 'bg-green-100 text-green-800' :
                                submission.grade >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                Grade: {submission.grade}/100
                              </span>
                              {submission.feedback && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  Feedback: {submission.feedback}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {submission.grade === undefined && (
                            <button
                              onClick={() => {
                                setGradingSubmission(submission);
                                setGradeForm({ grade: '', feedback: '' });
                              }}
                              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm"
                            >
                              Grade
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Grade Submission</h3>
                <button
                  onClick={() => {
                    setGradingSubmission(null);
                    setGradeForm({ grade: '', feedback: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {gradingSubmission.student?.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Submitted: {new Date(gradingSubmission.submittedAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Grade (0-100) *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gradeForm.grade}
                    onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                    placeholder="Enter grade"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Feedback (Optional)</label>
                  <textarea
                    rows="3"
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                    placeholder="Provide feedback to the student"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleGradeSubmission}
                    disabled={loading || !gradeForm.grade}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Grading...' : 'Submit Grade'}
                  </button>
                  <button
                    onClick={() => {
                      setGradingSubmission(null);
                      setGradeForm({ grade: '', feedback: '' });
                    }}
                    className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 font-medium"
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
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Course Schedules</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">These schedules are created by the Program Office. Contact them if you need any updates.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>{courses?.length || 0} courses</span>
        </div>
      </div>

      {/* My Update Requests */}
      {myRequests.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Update Requests</h3>
          <div className="space-y-3">
            {myRequests.map((request) => (
              <div key={request._id} className={`p-4 rounded-lg border-2 relative ${
                request.status === 'approved' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' :
                request.status === 'rejected' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' :
                'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
              }`}>
                <button
                  onClick={async () => {
                    try {
                      await scheduleUpdateRequestAPI.dismissRequest(request._id);
                      setMyRequests(prev => prev.filter(r => r._id !== request._id));
                    } catch (error) {
                      console.error('Dismiss request error:', error);
                    }
                  }}
                  className="absolute top-3 right-3 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                </button>
                <div className="flex items-start justify-between gap-3 pr-8">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{request.course?.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Requested: {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                    {request.status === 'approved' && (
                      <div className="text-green-700 dark:text-green-300">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Approved by Program Office</span>
                        </div>
                        <p className="text-sm ml-6">Your request to update the schedule has been approved. You can now teach with the new schedule.</p>
                      </div>
                    )}
                    {request.status === 'rejected' && (
                      <div className="text-red-700 dark:text-red-300">
                        <div className="flex items-center gap-2 mb-1">
                          <X className="h-4 w-4" />
                          <span className="text-sm font-medium">Rejected by Program Office</span>
                        </div>
                        <p className="text-sm ml-6">Your schedule update request has been rejected. Reason: {request.rejectionReason}</p>
                      </div>
                    )}
                    {request.status === 'pending' && (
                      <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">Pending approval from Program Office</span>
                      </div>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                    request.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
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
      ) : (courses?.length || 0) === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Courses Available</h3>
          <p className="text-gray-500 dark:text-gray-400">You don't have any courses assigned yet.</p>
        </div>
      ) : (
        <div className="space-y-4 lg:space-y-6">
          {(courses || []).map((course) => {
            const courseSchedules = schedules.filter(s => s.course?._id === course._id);
            const hasSchedule = courseSchedules.length > 0;
            
            return (
              <div key={course._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 lg:p-6">
                <div className="flex flex-col gap-4 mb-4 lg:mb-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white truncate">{course.title}</h3>
                      <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">{course.students?.length || 0} students enrolled</p>
                    </div>
                    {!hasSchedule ? (
                      <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 text-xs rounded-full font-medium">
                        Not Assigned
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedScheduleForUpdate(courseSchedules[0]);
                          setUpdateSessions(JSON.parse(JSON.stringify(courseSchedules[0].sessions)));
                          setShowUpdateScheduleModal(true);
                        }}
                        className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                {!hasSchedule ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">No schedule assigned for this course yet.</p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Contact the Program Office to assign a schedule.</p>
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
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day, dayIdx) => {
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
                                      <span>{session.startTime} - {session.endTime}</span>
                                    </div>
                                    {session.room && (
                                      <div className="flex items-center gap-1 text-xs mt-1 flex-wrap">
                                        <MapPin className="h-3 w-3 flex-shrink-0" />
                                        <span className="font-medium">Room:</span>
                                        <span>{session.room}</span>
                                      </div>
                                    )}
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
                              <span className={`${textColor}`}>{session.startTime} - {session.endTime}</span>
                            </div>
                            {session.room && (
                              <div className="flex items-center gap-1 text-xs flex-wrap">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className={`font-medium ${textColor}`}>Room:</span>
                                <span className={`${textColor}`}>{session.room}</span>
                              </div>
                            )}
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
      
      {/* Update Schedule Modal */}
      {showUpdateScheduleModal && selectedScheduleForUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Request Schedule Update</h3>
                <button
                  onClick={() => {
                    setShowUpdateScheduleModal(false);
                    setSelectedScheduleForUpdate(null);
                    setUpdateSessions([]);
                    setUpdateReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Your update request will be sent to the Program Office for approval.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason for Update *</label>
                  <textarea
                    value={updateReason}
                    onChange={(e) => setUpdateReason(e.target.value)}
                    rows="3"
                    placeholder="Please explain why you need to update the schedule..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm resize-none"
                  />
                  {!updateReason.trim() && <p className="text-xs text-red-500 mt-1">Reason is required</p>}
                </div>
                
                {updateSessions.map((session, idx) => (
                  <div key={idx} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">Session {idx + 1}</h4>
                      {updateSessions.length > 1 && (
                        <button
                          onClick={() => setUpdateSessions(updateSessions.filter((_, i) => i !== idx))}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day</label>
                        <select
                          value={session.day}
                          onChange={(e) => {
                            const newSessions = [...updateSessions];
                            newSessions[idx].day = e.target.value;
                            setUpdateSessions(newSessions);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
                        >
                          <option value="monday">Monday</option>
                          <option value="tuesday">Tuesday</option>
                          <option value="wednesday">Wednesday</option>
                          <option value="thursday">Thursday</option>
                          <option value="friday">Friday</option>
                          <option value="saturday">Saturday</option>
                          <option value="sunday">Sunday</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room</label>
                        <input
                          type="text"
                          value={session.room || ''}
                          onChange={(e) => {
                            const newSessions = [...updateSessions];
                            newSessions[idx].room = e.target.value;
                            setUpdateSessions(newSessions);
                          }}
                          placeholder="Room number"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={session.startTime}
                          onChange={(e) => {
                            const newSessions = [...updateSessions];
                            newSessions[idx].startTime = e.target.value;
                            setUpdateSessions(newSessions);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                        <input
                          type="time"
                          value={session.endTime}
                          onChange={(e) => {
                            const newSessions = [...updateSessions];
                            newSessions[idx].endTime = e.target.value;
                            setUpdateSessions(newSessions);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={() => setUpdateSessions([...updateSessions, { day: 'monday', startTime: '09:00', endTime: '10:00', room: '' }])}
                  className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors text-sm"
                >
                  + Add Session
                </button>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={async () => {
                      try {
                        setLoading(true);
                        await scheduleUpdateRequestAPI.createRequest({
                          schedule: selectedScheduleForUpdate._id,
                          course: selectedScheduleForUpdate.course._id,
                          newSessions: updateSessions,
                          reason: updateReason
                        });
                        setShowUpdateScheduleModal(false);
                        setSelectedScheduleForUpdate(null);
                        setUpdateSessions([]);
                        setUpdateReason('');
                        fetchMyRequests();
                        showNotification('success', 'Request Sent', 'Your schedule update request has been sent to the Program Office for approval');
                      } catch (error) {
                        showNotification('error', 'Request Failed', error.response?.data?.message || 'Failed to send update request');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading || updateSessions.length === 0 || !updateReason.trim()}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Send Request'}
                  </button>
                  <button
                    onClick={() => {
                      setShowUpdateScheduleModal(false);
                      setSelectedScheduleForUpdate(null);
                      setUpdateSessions([]);
                      setUpdateReason('');
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white dark:bg-gray-800 p-3 lg:p-4 rounded-xl shadow text-center">
          <p className="text-xl lg:text-2xl font-bold text-blue-600">{students.length}</p>
          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">Total Students</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 lg:p-4 rounded-xl shadow text-center">
          <p className="text-xl lg:text-2xl font-bold text-green-600">{instructorCourses.length}</p>
          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">My Courses</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 lg:p-4 rounded-xl shadow text-center">
          <p className="text-xl lg:text-2xl font-bold text-purple-600">
            {students.reduce((sum, student) => sum + student.totalCourses, 0)}
          </p>
          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">Enrollments</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 lg:p-4 rounded-xl shadow text-center">
          <p className="text-xl lg:text-2xl font-bold text-orange-600">
            {students.length > 0 ? Math.round(students.reduce((sum, student) => {
              const avgAttendance = student.courses.reduce((acc, course) => acc + course.attendance, 0) / student.courses.length;
              return sum + avgAttendance;
            }, 0) / students.length) : 0}%
          </p>
          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">Avg Attendance</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl shadow-lg p-3 lg:p-6">
        <div className="grid grid-cols-1 gap-3 lg:gap-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select 
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
            >
              <option value="all">All My Courses</option>
              {instructorCourses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
            <select 
              value={selectedGenderFilter}
              onChange={(e) => setSelectedGenderFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
      </div>

      {studentsLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Students Found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          {/* Mobile Cards View */}
          <div className="lg:hidden space-y-3">
            {filteredStudents.map((student) => {
              const avgAttendance = student.courses.length > 0 
                ? Math.round(student.courses.reduce((sum, course) => sum + course.attendance, 0) / student.courses.length)
                : 0;
              
              return (
                <div key={student._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
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
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{student.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{student.email}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">ID: {student.systemId || 'N/A'}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                      student.gender === 'male' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      student.gender === 'female' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {student.gender ? student.gender.charAt(0).toUpperCase() : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Courses</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{student.totalCourses}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Attendance</p>
                      <p className={`text-lg font-bold ${
                        avgAttendance >= 80 ? 'text-green-600' :
                        avgAttendance >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>{avgAttendance}%</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        avgAttendance >= 80 ? 'bg-green-500' :
                        avgAttendance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${avgAttendance}%` }}
                    ></div>
                  </div>
                  
                  {selectedCourseFilter !== 'all' && (
                    <button
                      onClick={() => setSelectedStudentForGrading(student)}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Grade Student
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Courses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Attendance
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
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {student.systemId || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.gender === 'male' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                            student.gender === 'female' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : 'N/A'}
                          </span>
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
                              Grade
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
          {/* Send Notification Table - Responsive */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Course</th>
                    <th className="px-3 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Students</th>
                    <th className="px-3 lg:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {(courses || []).map((course) => (
                    <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-3 lg:px-6 py-4">
                        <div>
                          <p className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white">{course.title}</p>
                          <p className="text-xs text-gray-500">{course.category}</p>
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4">
                        <div className="flex items-center">
                          <Users className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400 mr-1 lg:mr-2" />
                          <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white">{course.students?.length || 0}</span>
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedNotificationCourse(course);
                            setShowNotificationForm(true);
                          }}
                          className="bg-blue-600 text-white px-2 lg:px-4 py-1 lg:py-2 rounded-lg hover:bg-blue-700 text-xs lg:text-sm font-medium"
                        >
                          Send
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

      case 'materials': return renderMaterials();
      case 'assignments': return renderAssignments();
      case 'exams': return renderExams();
      case 'schedule': return renderSchedule();
      case 'send-notification': return renderSendNotification();
      case 'students': return renderStudents();
      case 'analytics': return renderAnalytics();
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
                      } else if (tab.id === 'messages') {
                        setActiveTab(tab.id);
                        setSidebarOpen(false);
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
                    {tab.id === 'messages' && unreadCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold">
                        {unreadCount}
                      </span>
                    )}
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
                onClick={() => {
                  setActiveTab('messages');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all duration-200 group ${
                  activeTab === 'messages'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <MessageCircle className={`h-4 w-4 mr-2 lg:mr-3 flex-shrink-0 ${
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