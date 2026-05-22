import React, { useState, useEffect } from 'react';
import { Crown, Users, Shield, Settings, LogOut, Database, Activity, AlertTriangle, Server, Globe, Lock, Home, User, Camera, X, CheckCircle, Eye, EyeOff, BookOpen, Plus, Edit, Trash2, Search, Filter, Star, Mail, MessageSquare, Reply, ThumbsUp, ThumbsDown, Heart, Download, Calendar, Clock, MapPin, Save, Bell, BellRing, Video } from 'lucide-react';
import { profileAPI, courseAPI, categoryAPI, contactAPI, reviewAPI, usersAPI, paymentAPI, notificationAPI, statsAPI, scheduleAPI, scheduleUpdateRequestAPI, reelAPI, adminActivityAPI } from '../services/api';
import api from '../services/api';
import PopupNotification from '../components/PopupNotification';
import SubscriptionManagement from '../components/SubscriptionManagement';
import { getUserData, updateUserData, clearUserData } from '../utils/userUtils';
import { isUserOnline, getOnlineStatusText, OnlineStatusIndicator } from '../utils/onlineStatus.jsx';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    about: '',
    price: '',
    category: '',
    instructor: '',
    image: null,
    startDate: '',
    endDate: ''
  });

  const [showCourseDetail, setShowCourseDetail] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: ''
  });

  const [contacts, setContacts] = useState([]);
  const [showContactDetail, setShowContactDetail] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  const [reviews, setReviews] = useState([]);
  const [showReviewDetail, setShowReviewDetail] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  // Users management state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState('all');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [userEnrollments, setUserEnrollments] = useState([]);
  const [userPayments, setUserPayments] = useState([]);
  const [userCourses, setUserCourses] = useState([]);
  const [totalPayments, setTotalPayments] = useState(0);

  // Schedule management state
  const [selectedCourseForSchedule, setSelectedCourseForSchedule] = useState(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showCourseSchedules, setShowCourseSchedules] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({
    sessions: [{ day: 'monday', startTime: '', endTime: '', room: '' }]
  });
  const [scheduleRequests, setScheduleRequests] = useState([]);
  const [showRequestDetail, setShowRequestDetail] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Notification state
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [notificationForm, setNotificationForm] = useState({ title: '', message: '', role: 'all' });

  // Newsletter state
  const [showNewsletterForm, setShowNewsletterForm] = useState(false);

  // Admin management state
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [selectedAdminForPermissions, setSelectedAdminForPermissions] = useState(null);
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    permissions: []
  });
  const [adminPermissions, setAdminPermissions] = useState([]);

  // Settings state
  const [platformSettings, setPlatformSettings] = useState({
    platformName: 'AAU E-Learning Platform',
    systemEmail: 'system@aau.edu.et',
    maxUploadSize: '500',
    maintenanceMode: false,
    autoBackup: true,
    debugMode: false
  });

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

  // Admin notifications state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Gender distribution state
  const [genderStats, setGenderStats] = useState({
    students: { male: 0, female: 0 },
    instructors: { male: 0, female: 0 }
  });

  // Reel management state
  const [showReelUpload, setShowReelUpload] = useState(false);
  const [showReelsList, setShowReelsList] = useState(false);
  const [showEditReel, setShowEditReel] = useState(false);
  const [editingReel, setEditingReel] = useState(null);
  const [reels, setReels] = useState([]);
  const [reelForm, setReelForm] = useState({
    title: '',
    description: '',
    video: null
  });
  const [reelsLoading, setReelsLoading] = useState(false);

  // Recent admin activities state
  const [recentActivities, setRecentActivities] = useState([]);

  // Play notification sound
  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const response = await notificationAPI.getMyNotifications();
      setNotifications(response.data.notifications);
      setHasNewNotifications(response.data.unreadCount > 0);
    } catch (error) {
      console.error('Fetch notifications error:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Fetch gender distribution
  const fetchGenderDistribution = async () => {
    try {
      const response = await statsAPI.getGenderDistribution();
      setGenderStats(response.data);
    } catch (error) {
      console.error('Fetch gender distribution error:', error);
    }
  };

  // Fetch reels
  const fetchReels = async () => {
    try {
      setReelsLoading(true);
      const response = await reelAPI.getReels();
      // Filter out reels without required properties
      const validReels = (response.data.reels || []).filter(reel => 
        reel && reel._id && reel.title && reel.description
      );
      setReels(validReels);
    } catch (error) {
      console.error('Fetch reels error:', error);
      setReels([]);
    } finally {
      setReelsLoading(false);
    }
  };

  // Fetch recent admin activities
  const fetchRecentActivities = async () => {
    try {
      const response = await adminActivityAPI.getRecentActivities(5);
      setRecentActivities(response.data.activities || []);
    } catch (error) {
      console.error('Fetch recent activities error:', error);
      setRecentActivities([]);
    }
  };

  // Handle reel form change
  const handleReelFormChange = (field, value) => {
    setReelForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle reel video upload
  const handleReelVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        showNotification('error', 'File Too Large', 'Video file must be less than 100MB');
        return;
      }
      // Check file type
      if (!file.type.startsWith('video/')) {
        showNotification('error', 'Invalid File Type', 'Please select a video file');
        return;
      }
      setReelForm(prev => ({ ...prev, video: file }));
    }
  };

  // Upload reel
  const handleUploadReel = async () => {
    try {
      if (!reelForm.title || !reelForm.description || !reelForm.video) {
        showNotification('error', 'Missing Fields', 'Please fill all fields and select a video');
        return;
      }

      setLoading(true);
      const response = await reelAPI.uploadReel(reelForm);
      if (response.data.reel) {
        setReels(prev => [response.data.reel, ...prev]);
      }
      setReelForm({ title: '', description: '', video: null });
      setShowReelUpload(false);
      showNotification('success', 'Reel Uploaded!', 'Your reel has been uploaded successfully');
    } catch (error) {
      console.error('Upload reel error:', error);
      showNotification('error', 'Upload Failed', error.response?.data?.message || 'Failed to upload reel');
    } finally {
      setLoading(false);
    }
  };

  // Edit reel
  const handleEditReel = (reel) => {
    setEditingReel(reel);
    setReelForm({
      title: reel.title,
      description: reel.description,
      video: null
    });
    setShowEditReel(true);
  };

  // Update reel
  const handleUpdateReel = async () => {
    try {
      if (!reelForm.title || !reelForm.description) {
        showNotification('error', 'Missing Fields', 'Please fill all required fields');
        return;
      }

      setLoading(true);

      const updateData = new FormData();
      updateData.append('title', reelForm.title);
      updateData.append('description', reelForm.description);
      if (reelForm.video) updateData.append('video', reelForm.video);

      const response = await reelAPI.updateReel(editingReel._id, updateData);

      setReels(prev => prev.map(reel =>
        reel._id === editingReel._id ? (response.data.reel || reel) : reel
      ));

      setReelForm({ title: '', description: '', video: null });
      setShowEditReel(false);
      setEditingReel(null);
      showNotification('success', 'Reel Updated!', 'Your reel has been updated successfully');
    } catch (error) {
      console.error('Update reel error:', error);
      showNotification('error', 'Update Failed', error.response?.data?.message || 'Failed to update reel');
    } finally {
      setLoading(false);
    }
  };

  // Delete reel
  const handleDeleteReel = async (reelId) => {
    if (!window.confirm('Are you sure you want to delete this reel?')) return;
    
    try {
      await reelAPI.deleteReel(reelId);
      setReels(prev => prev.filter(reel => reel._id !== reelId));
      showNotification('success', 'Reel Deleted!', 'Reel has been removed successfully');
    } catch (error) {
      console.error('Delete reel error:', error);
      showNotification('error', 'Delete Failed', error.response?.data?.message || 'Failed to delete reel');
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

  // Check for notifications on load
  useEffect(() => {
    if (user && hasNewNotifications) {
      setTimeout(() => playNotificationSound(), 1000);
    }
  }, [user, hasNewNotifications]);

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

  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      setUser(userData);
      setProfileForm(userData);
      if (userData.profileImage) {
        setProfileImage(userData.profileImage);
      }
      
      // Always set default active tab to 'overview' for both superadmin and admin
      setActiveTab('overview');
    }
    fetchUserProfile();
    fetchInstructors();
    fetchCourses();
    fetchCategories();
    fetchContacts();
    fetchReviews();
    fetchUsers();
    fetchNotifications();
    fetchGenderDistribution();
    fetchSchedules();
    fetchScheduleRequests();
    fetchReels();
    fetchRecentActivities();
  }, []);

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

  const fetchInstructors = async () => {
    try {
      const response = await courseAPI.getInstructors();
      setInstructors(response.data.instructors);
    } catch (error) {
      console.error('Error fetching instructors:', error);
      showNotification('error', 'Error', 'Failed to fetch instructors');
    }
  };

  const fetchCourses = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== 'all') params.category = selectedCategory;
      
      const response = await courseAPI.getCourses(params);
      let filteredCourses = response.data.courses;
      
      // Debug: Log course data to see what fields are available
      
      // Map courses to ensure student count is available
      const coursesWithStudentCount = filteredCourses.map(course => ({
        ...course,
        studentCount: course.studentCount || course.enrollmentCount || course.enrollments?.length || course.students?.length || 0
      }));
      
      // Filter by status
      if (selectedStatus !== 'all') {
        filteredCourses = coursesWithStudentCount.filter(course => {
          const now = new Date();
          const startDate = course.startDate ? new Date(course.startDate) : null;
          const endDate = course.endDate ? new Date(course.endDate) : null;
          
          if (selectedStatus === 'active') {
            if (!startDate || !endDate) return true;
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            return now >= startDate && now <= endOfDay;
          } else if (selectedStatus === 'not_started') {
            return startDate && now < startDate;
          } else if (selectedStatus === 'closed') {
            if (!endDate) return false;
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            return now > endOfDay;
          }
          return true;
        });
      } else {
        filteredCourses = coursesWithStudentCount;
      }
      
      setCourses(filteredCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      showNotification('error', 'Error', 'Failed to fetch courses');
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [searchTerm, selectedCategory, selectedStatus]);

  const handleCourseFormChange = (field, value) => {
    setCourseForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUploadCourse = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCourseForm(prev => ({ ...prev, image: file }));
    }
  };

  const handleAddCourse = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.createCourse(courseForm);
      setCourses(prev => [response.data.course, ...prev]);
      setCourseForm({ title: '', description: '', about: '', price: '', category: '', instructor: '', image: null, startDate: '', endDate: '' });
      setShowAddCourse(false);
      showNotification('success', 'Course Added!', 'Course has been successfully created');
      // Refresh recent activities
      fetchRecentActivities();
    } catch (error) {
      showNotification('error', 'Error', error.response?.data?.message || 'Failed to add course');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      about: course.about,
      price: course.price.toString(),
      category: course.category,
      instructor: course.instructor._id,
      image: null,
      startDate: course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : '',
      endDate: course.endDate ? new Date(course.endDate).toISOString().split('T')[0] : ''
    });
    setShowEditCourse(true);
  };

  const handleUpdateCourse = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.updateCourse(editingCourse._id, courseForm);
      setCourses(prev => prev.map(course => 
        course._id === editingCourse._id ? response.data.course : course
      ));
      setCourseForm({ title: '', description: '', about: '', price: '', category: '', instructor: '', image: null, startDate: '', endDate: '' });
      setShowEditCourse(false);
      setEditingCourse(null);
      showNotification('success', 'Course Updated!', 'Course has been successfully updated');
      // Refresh recent activities
      fetchRecentActivities();
    } catch (error) {
      showNotification('error', 'Error', error.response?.data?.message || 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    
    try {
      await courseAPI.deleteCourse(courseId);
      setCourses(prev => prev.filter(course => course._id !== courseId));
      showNotification('success', 'Course Deleted!', 'Course has been removed successfully');
      // Refresh recent activities
      fetchRecentActivities();
    } catch (error) {
      showNotification('error', 'Error', error.response?.data?.message || 'Failed to delete course');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await contactAPI.getContacts();
      setContacts(response.data.contacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getAllReviews();
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleExport = async (format) => {
    try {
      const filteredUsers = users.filter(user => {
        if (selectedRole !== 'all' && user.role !== selectedRole) return false;
        return true;
      });

      const courseName = selectedCourseFilter !== 'all' 
        ? courses.find(c => c._id === selectedCourseFilter)?.title || 'Unknown Course'
        : 'All Courses';
      
      const fileName = `${selectedRole}s_${courseName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}`;

      if (format === 'pdf') {
        await exportToPDF(filteredUsers, fileName, courseName);
      } else {
        await exportToExcel(filteredUsers, fileName, courseName);
      }
    } catch (error) {
      showNotification('error', 'Export Failed', 'Failed to export data');
    }
  };

  const exportToPDF = async (data, fileName, courseName) => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(`${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}s Report`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Course: ${courseName}`, 20, 35);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
    doc.text(`Total Records: ${data.length}`, 20, 55);
    
    let yPos = 70;
    data.forEach((user, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${index + 1}. ${user.name} - ${user.email} - ${user.systemId || 'N/A'}`, 20, yPos);
      yPos += 10;
    });
    
    doc.save(`${fileName}.pdf`);
    showNotification('success', 'Export Complete', 'PDF downloaded successfully');
  };

  const exportToExcel = async (data, fileName, courseName) => {
    const XLSX = await import('xlsx');
    
    const worksheet = XLSX.utils.json_to_sheet(data.map(user => ({
      Name: user.name,
      Email: user.email,
      [selectedRole === 'student' ? 'Student ID' : 'Instructor ID']: user.systemId || 'N/A',
      Role: user.role,
      'Verification Status': user.isVerified ? 'Verified' : 'Pending',
      'Join Date': new Date(user.createdAt).toLocaleDateString(),
      Phone: user.phone || 'N/A',
      City: user.city || 'N/A'
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) + 's');
    
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    showNotification('success', 'Export Complete', 'Excel file downloaded successfully');
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const params = {};
      if (userSearchTerm) params.search = userSearchTerm;
      if (selectedRole !== 'all') params.role = selectedRole;
      if (selectedCourseFilter !== 'all') params.course = selectedCourseFilter;
      if (selectedGenderFilter !== 'all') params.gender = selectedGenderFilter;
      
      const response = await usersAPI.getUsers(params);
      const fetchedUsers = response.data.users || [];
      
      let realUsers = fetchedUsers.filter(user => user.email && user.name && user.createdAt);
      
      // Apply gender filter on frontend if not handled by backend
      if (selectedGenderFilter !== 'all') {
        realUsers = realUsers.filter(user => user.gender === selectedGenderFilter);
      }
      
      setUsers(realUsers);
      
      // Calculate total payments for students
      if (selectedRole === 'student') {
        const paymentsResponse = await paymentAPI.getPayments({
          course: selectedCourseFilter !== 'all' ? selectedCourseFilter : undefined
        });
        const total = paymentsResponse.data.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
        setTotalPayments(total);
      } else {
        setTotalPayments(0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('error', 'Error', 'Failed to fetch users');
      setUsers([]); // Set empty array on error
    } finally {
      setUsersLoading(false);
    }
  };

  const handleViewUser = async (userId) => {
    try {
      setLoading(true);
      const response = await usersAPI.getUserDetails(userId);
      setSelectedUser(response.data.user);
      setUserEnrollments(response.data.enrollments || []);
      setUserPayments(response.data.payments || []);
      setUserCourses(response.data.courses || []);
      setShowUserDetail(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      showNotification('error', 'Error', error.response?.data?.message || 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      await usersAPI.deleteUser(userId);
      setUsers(prev => prev.filter(user => user._id !== userId));
      showNotification('success', 'User Deleted!', 'User has been removed successfully');
      // Refresh recent activities
      fetchRecentActivities();
    } catch (error) {
      showNotification('error', 'Error', error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleViewUserReceipt = async (paymentId) => {
    try {
      setLoading(true);
      const response = await paymentAPI.getReceipt(paymentId);
      const payment = response.data.data;
      
      if (!payment) {
        showNotification('error', 'Error', 'Receipt not found');
        return;
      }
      
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
            .course-item { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
            .course-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
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
                    <span>${payment.user.systemId || payment.user._id.slice(-8).toUpperCase()}</span>
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
                <h3>${payment.isBulk ? 'Courses Details' : 'Course Details'}</h3>
                <div class="course-details">
                  ${payment.isBulk ? 
                    payment.courses.map(course => `
                      <div class="course-item">
                        <div class="course-header">
                          <div class="course-info">
                            <h4>${course.title}</h4>
                            <p>Instructor: ${course.instructor?.name || 'Instructor'}</p>
                            <p style="font-size: 14px; color: #6b7280;">Certificate of Completion Included</p>
                          </div>
                          <div class="course-price">
                            <div class="amount">${course.price} ETB</div>
                            <div class="type">Individual price</div>
                          </div>
                        </div>
                      </div>
                    `).join('') :
                    `<div class="course-header">
                      <div class="course-info">
                        <h4>${payment.course.title}</h4>
                        <p>Instructor: ${payment.course.instructor?.name || 'Instructor'}</p>
                        <p style="font-size: 14px; color: #6b7280;">Certificate of Completion Included</p>
                      </div>
                      <div class="course-price">
                        <div class="amount">${payment.amount} ETB</div>
                        <div class="type">One-time payment</div>
                      </div>
                    </div>`
                  }
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
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadUserReceipt = async (paymentId) => {
    try {
      setLoading(true);
      const response = await paymentAPI.getReceipt(paymentId);
      const payment = response.data.data;
      
      if (!payment) {
        showNotification('error', 'Error', 'Receipt not found');
        return;
      }
      
      const receiptElement = document.createElement('div');
      receiptElement.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background: white; position: relative;">
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 80px; font-weight: bold; color: rgba(34, 197, 94, 0.3); pointer-events: none; z-index: 10;">PAID</div>
          
          <div style="position: absolute; top: 20px; right: 20px; z-index: 20; text-align: center;">
            <img src="/assets/images/${payment.paymentMethod === 'telebirr' ? 'telebirrlogo.png' : 'cbe.png'}" alt="${payment.paymentMethod}" style="width: 40px; height: 40px; object-fit: contain; margin-bottom: 5px;">
            <p style="font-size: 12px; font-weight: bold; color: #374151; text-transform: uppercase; margin: 0;">${payment.paymentMethod === 'telebirr' ? 'Telebirr' : 'CBE'}</p>
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
                <div style="margin-bottom: 8px; display: flex; justify-content: space-between;"><span style="color: #6b7280;">Name:</span><span style="color: #000; font-weight: 500;">Elyas Yenealem</span></div>
                <div style="margin-bottom: 8px; display: flex; justify-content: space-between;"><span style="color: #6b7280;">Email:</span><span style="color: #000; font-weight: 500;">elyasat594@gmail.com</span></div>
                <div style="margin-bottom: 8px; display: flex; justify-content: space-between;"><span style="color: #6b7280;">Student ID:</span><span style="color: #000; font-weight: 500;">AAU/0001/26</span></div>
                <div style="margin-bottom: 8px; display: flex; justify-content: space-between;"><span style="color: #6b7280;">Gender:</span><span style="color: #000; font-weight: 500;">Male</span></div>
              </div>
              
              <div>
                <h3 style="font-size: 18px; font-weight: bold; color: #000; margin-bottom: 16px; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">Payment Information</h3>
                <div style="margin-bottom: 8px; display: flex; justify-content: space-between;"><span style="color: #6b7280;">Date:</span><span style="color: #000; font-weight: 500;">1/1/2026</span></div>
                <div style="margin-bottom: 8px; display: flex; justify-content: space-between;"><span style="color: #6b7280;">Method:</span><span style="color: #000; font-weight: 500;">cbe</span></div>
                <div style="margin-bottom: 8px; display: flex; justify-content: space-between;"><span style="color: #6b7280;">Transaction ID:</span><span style="color: #000; font-weight: 500;">demo_tx-1767255232584-205c7bbe-ba82-4034-8d2e-76a3136b96b6</span></div>
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
                            <p style="font-size: 14px; color: #6b7280; margin: 0;">Certificate of Completion Included</p>
                          </div>
                          <div style="text-align: right;">
                            <div style="font-size: 20px; font-weight: bold; color: #000;">${course.price} ETB</div>
                          </div>
                        </div>
                      </div>
                    `).join('') :
                    `<div style="display: flex; justify-content: space-between; align-items: flex-start;">
                      <div>
                        <h4 style="font-size: 18px; font-weight: bold; color: #000; margin: 0 0 8px 0;">${payment.course?.title || 'Course'}</h4>
                        <p style="color: #6b7280; margin: 0 0 8px 0;">Instructor: ${payment.course?.instructor?.name || 'Instructor'}</p>
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
      
      const opt = {
        margin: 0.5,
        filename: `receipt-${payment.receiptNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          allowTaint: true,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 800,
          windowHeight: 600
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf().set(opt).from(receiptElement).save();
      
      document.body.removeChild(receiptElement);
      
      showNotification('success', 'Downloaded', 'Receipt downloaded as PDF');
    } catch (error) {
      console.error('Download receipt error:', error);
      showNotification('error', 'Error', 'Failed to download receipt');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFormChange = (field, value) => {
    setCategoryForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name
    });
    setShowEditCategory(true);
  };

  const handleUpdateCategory = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.updateCategory(editingCategory._id, categoryForm);
      setCategories(prev => prev.map(cat => 
        cat._id === editingCategory._id ? response.data.category : cat
      ));
      setCategoryForm({ name: '' });
      setShowEditCategory(false);
      setEditingCategory(null);
      showNotification('success', 'Category Updated!', 'Category has been successfully updated');
    } catch (error) {
      showNotification('error', 'Error', error.response?.data?.message || 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.createCategory(categoryForm);
      setCategories(prev => [...prev, response.data.category]);
      setCategoryForm({ name: '' });
      setShowAddCategory(false);
      showNotification('success', 'Category Added!', 'Category has been successfully created');
    } catch (error) {
      showNotification('error', 'Error', error.response?.data?.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await categoryAPI.deleteCategory(categoryId);
      setCategories(prev => prev.filter(cat => cat._id !== categoryId));
      showNotification('success', 'Category Deleted!', 'Category has been removed successfully');
    } catch (error) {
      showNotification('error', 'Error', error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleReplyContact = async () => {
    try {
      setLoading(true);
      const response = await contactAPI.replyContact(selectedContact._id, { replyMessage });
      
      // Update the contact with the new reply
      setContacts(prev => prev.map(contact => 
        contact._id === selectedContact._id 
          ? response.data.contact
          : contact
      ));
      
      setShowReplyModal(false);
      setReplyMessage('');
      setSelectedContact(null);
      setShowContactDetail(false);
      showNotification('success', 'Reply Sent!', 'Your reply has been sent successfully');
    } catch (error) {
      showNotification('error', 'Error', error.response?.data?.message || 'Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (reviewId, action) => {
    try {
      setLoading(true);
      if (action === 'delete') {
        await reviewAPI.deleteReview(reviewId);
        setReviews(prev => prev.filter(review => review._id !== reviewId));
        showNotification('success', 'Review Deleted!', 'Review has been removed successfully');
      } else {
        const response = await reviewAPI.updateReviewStatus(reviewId, action);
        setReviews(prev => prev.map(review => 
          review._id === reviewId ? response.data.review : review
        ));
        showNotification('success', `Review ${action.charAt(0).toUpperCase() + action.slice(1)}!`, `Review has been ${action} successfully`);
      }
    } catch (error) {
      showNotification('error', 'Error', error.response?.data?.message || `Failed to ${action} review`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [userSearchTerm, selectedRole, selectedCourseFilter, selectedGenderFilter]);

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

  // Schedule management functions
  const handleScheduleFormChange = (field, value) => {
    setScheduleForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSessionChange = (index, field, value) => {
    setScheduleForm(prev => ({
      ...prev,
      sessions: prev.sessions.map((session, i) => 
        i === index ? { ...session, [field]: value } : session
      )
    }));
  };

  const addSession = () => {
    setScheduleForm(prev => ({
      ...prev,
      sessions: [...prev.sessions, { day: 'monday', startTime: '', endTime: '', room: '' }]
    }));
  };

  const removeSession = (index) => {
    setScheduleForm(prev => ({
      ...prev,
      sessions: prev.sessions.filter((_, i) => i !== index)
    }));
  };

  const fetchSchedules = async () => {
    try {
      const response = await scheduleAPI.getSchedules();
      if (response.data && response.data.schedules) {
        const fetchedSchedules = response.data.schedules.map(schedule => ({
          id: schedule._id,
          courseId: schedule.course?._id || schedule.course,
          courseTitle: schedule.course?.title || 'Unknown Course',
          sessions: schedule.sessions,
          createdAt: schedule.createdAt
        }));
        setSchedules(fetchedSchedules);
      }
    } catch (error) {
      setSchedules([]);
    }
  };

  const fetchScheduleRequests = async () => {
    try {
      const response = await scheduleUpdateRequestAPI.getRequests();
      if (response.data && response.data.requests) {
        setScheduleRequests(response.data.requests);
      }
    } catch (error) {
      console.error('Error fetching schedule requests:', error);
      setScheduleRequests([]);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      setLoading(true);
      await scheduleUpdateRequestAPI.approveRequest(requestId);
      setScheduleRequests(prev => prev.map(req => 
        req._id === requestId ? { ...req, status: 'approved' } : req
      ));
      fetchSchedules();
      showNotification('success', 'Request Approved!', 'Schedule has been updated successfully');
      setShowRequestDetail(false);
    } catch (error) {
      showNotification('error', 'Error', error.response?.data?.message || 'Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      showNotification('error', 'Error', 'Please provide a reason for rejection');
      return;
    }
    try {
      setLoading(true);
      await scheduleUpdateRequestAPI.rejectRequest(selectedRequest._id, rejectionReason);
      setScheduleRequests(prev => prev.map(req => 
        req._id === selectedRequest._id ? { ...req, status: 'rejected', rejectionReason } : req
      ));
      showNotification('success', 'Request Rejected!', 'Schedule update request has been rejected');
      setShowRejectModal(false);
      setShowRequestDetail(false);
      setRejectionReason('');
    } catch (error) {
      showNotification('error', 'Error', error.response?.data?.message || 'Failed to reject request');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
    if (!selectedCourseForSchedule || scheduleForm.sessions.some(s => !s.day || !s.startTime || !s.endTime)) {
      showNotification('error', 'Error', 'Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      if (scheduleForm.id) {
        const response = await scheduleAPI.updateSchedule(scheduleForm.id, {
          sessions: scheduleForm.sessions
        });
        setSchedules(prev => prev.map(schedule => 
          schedule.id === scheduleForm.id 
            ? {
                id: response.data.schedule._id,
                courseId: response.data.schedule.course?._id || response.data.schedule.course,
                courseTitle: response.data.schedule.course?.title || 'Unknown Course',
                sessions: response.data.schedule.sessions,
                createdAt: response.data.schedule.createdAt
              }
            : schedule
        ));
        showNotification('success', 'Schedule Updated!', 'Class schedule has been successfully updated');
      } else {
        const response = await scheduleAPI.createSchedule({
          course: selectedCourseForSchedule._id,
          sessions: scheduleForm.sessions
        });
        const newSchedule = {
          id: response.data.schedule._id,
          courseId: response.data.schedule.course?._id || response.data.schedule.course,
          courseTitle: response.data.schedule.course?.title || selectedCourseForSchedule.title,
          sessions: response.data.schedule.sessions,
          createdAt: response.data.schedule.createdAt
        };
        setSchedules(prev => [...prev, newSchedule]);
        showNotification('success', 'Schedule Created!', 'Class schedule has been successfully created');
      }

      setScheduleForm({ sessions: [{ day: 'monday', startTime: '', endTime: '', room: '' }] });
      setShowScheduleForm(false);
      // Refresh recent activities
      fetchRecentActivities();
    } catch (error) {
      showNotification('error', 'Error', 'Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      await scheduleAPI.deleteSchedule(scheduleId);
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
      showNotification('success', 'Schedule Deleted!', 'Schedule has been removed successfully');
    } catch (error) {
      showNotification('error', 'Error', 'Failed to delete schedule');
    }
  };

  // Settings functions
  const handleSettingsChange = (field, value) => {
    setPlatformSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = () => {
    showNotification('success', 'Settings Saved!', 'Platform settings have been updated successfully');
  };

  // Admin management functions
  const availablePermissions = [
    { id: 'overview', name: 'System Overview', description: 'View dashboard overview and statistics' },
    { id: 'users', name: 'All Users', description: 'View and manage all platform users' },
    { id: 'courses', name: 'Course Management', description: 'Create, edit, and delete courses' },
    { id: 'schedules', name: 'Assign Schedule', description: 'Create and manage course schedules' },
    { id: 'contacts', name: 'Contact Messages', description: 'View and reply to contact messages' },
    { id: 'reviews', name: 'Review Management', description: 'Moderate and manage user reviews' },
    { id: 'subscriptions', name: 'Email Subscriptions', description: 'Manage newsletter subscriptions' },
    { id: 'notifications', name: 'Send Notification', description: 'Send notifications to users' },
    { id: 'reels', name: 'Reel Management', description: 'Upload, edit, and manage video reels' },
    { id: 'settings', name: 'Global Settings', description: 'Access platform configuration settings' }
  ];

  const handleCreateAdmin = async () => {
    try {
      setLoading(true);
      if (editingAdmin) {
        // Admin updates not supported by backend
        showNotification('error', 'Update Not Supported', 'Admin updates are not currently supported. Please create a new admin instead.');
        return;
      }
      console.log('Creating admin with data:', adminForm); // Debug log
      const response = await usersAPI.createAdmin(adminForm);
      // Store the password temporarily for display
      const userWithPassword = { ...response.data.user, tempPassword: adminForm.password };
      setUsers(prev => [userWithPassword, ...prev.filter(u => u._id !== userWithPassword._id)]);
      // Refresh the users list to get updated data
      fetchUsers();
      
      // Show created admin credentials in alert
      alert(`Admin Created Successfully!\n\nEmail: ${adminForm.email}\nPassword: ${adminForm.password}\nRole: ${adminForm.role}\n\nPlease save these credentials securely.`);
      
      showNotification('success', 'Admin Created!', `${adminForm.role} account created successfully`);
      
      setAdminForm({ name: '', email: '', password: '', role: 'admin', permissions: [] });
      setShowCreateAdmin(false);
      setEditingAdmin(null);
      // Refresh recent activities
      fetchRecentActivities();
    } catch (error) {
      console.error('Admin operation error:', error);
      showNotification('error', 'Error', error.response?.data?.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePermissions = async () => {
    try {
      setLoading(true);
      // Update both role and permissions
      const response = await usersAPI.updatePermissions(selectedAdminForPermissions._id, adminPermissions, selectedAdminForPermissions.role);
      setUsers(prev => prev.map(user => 
        user._id === selectedAdminForPermissions._id ? response.data.user : user
      ));
      setShowPermissions(false);
      setSelectedAdminForPermissions(null);
      setAdminPermissions([]);
      showNotification('success', 'Updated Successfully!', 'Admin role and permissions have been updated successfully');
    } catch (error) {
      showNotification('error', 'Error', error.response?.data?.message || 'Failed to update permissions');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId) => {
    setAdminPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleAdminFormChange = (field, value) => {
    if (field === 'role' && value === 'superadmin') {
      // Auto-select all permissions for superadmin
      setAdminForm(prev => ({ 
        ...prev, 
        [field]: value,
        permissions: availablePermissions.map(p => p.id)
      }));
    } else if (field === 'role' && value === 'admin') {
      // Clear permissions when switching to admin
      setAdminForm(prev => ({ 
        ...prev, 
        [field]: value,
        permissions: []
      }));
    } else {
      setAdminForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleShowPermissions = (admin) => {
    setSelectedAdminForPermissions(admin);
    setAdminPermissions(admin.permissions || []);
    setShowPermissions(true);
  };

  // Generate initials from user name
  const getInitials = (name) => {
    if (!name) return 'SA';
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
    { id: 'overview', name: 'System Overview', icon: user?.role === 'superadmin' ? Crown : Shield },
    { id: 'users', name: 'All Users', icon: Users },
    { id: 'courses', name: 'Course Management', icon: BookOpen },
    { id: 'schedules', name: 'Assign Schedule', icon: Calendar },
    { id: 'contacts', name: 'Contact Messages', icon: MessageSquare },
    { id: 'reviews', name: 'Review Management', icon: Star },
    { id: 'subscriptions', name: 'Email Subscriptions', icon: Mail },
    { id: 'notifications', name: 'Send Notification', icon: Bell },
    { id: 'admins', name: 'Admin Management', icon: Shield },
    { id: 'settings', name: 'Global Settings', icon: Settings },
    { id: 'profile', name: 'My Profile', icon: User }
  ].filter(tab => {
    // Super admin sees everything
    if (user?.role === 'superadmin') return true;
    
    // Admin Management and Profile are always visible
    if (tab.id === 'profile') return true;
    
    // Admin Management only for superadmin
    if (tab.id === 'admins') return user?.role === 'superadmin';
    
    // Reel Management only for superadmin or admins with reel permission
    if (tab.id === 'reels') return user?.role === 'superadmin' || user?.permissions?.includes('reels');
    
    // Check permissions for other tabs
    return user?.permissions?.includes(tab.id) || false;
  });

  const renderOverview = () => (
    <div className="space-y-4 lg:space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-start sm:items-center mb-6 gap-3">
        <div className={`p-2 sm:p-3 rounded-xl mr-3 sm:mr-4 flex-shrink-0 ${
          user?.role === 'superadmin' 
            ? 'bg-purple-100 dark:bg-purple-900/30' 
            : 'bg-blue-100 dark:bg-blue-900/30'
        }`}>
          {user?.role === 'superadmin' ? (
            <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
          ) : (
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
            {user?.role === 'superadmin' ? 'Super Admin Dashboard' : 'Admin Dashboard'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
            Welcome back{user ? `, ${user.name}` : ''}, manage the platform
          </p>
        </div>
        {user?.role === 'admin' && (
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
        )}
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Users</p>
              <p className="text-2xl lg:text-3xl font-bold mt-2 text-gray-900 dark:text-white">{users.length || 0}</p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">All platform users</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
              <Users className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
            </div>
          </div>
        </div>
        
        {user?.role === 'superadmin' && (
          <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Admins</p>
                <p className="text-2xl lg:text-3xl font-bold mt-2 text-gray-900 dark:text-white">{(users || []).filter(u => u.role === 'admin' || u.role === 'superadmin').length || 0}</p>
                <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">System administrators</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl">
                <Shield className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600" />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Instructors</p>
              <p className="text-2xl lg:text-3xl font-bold mt-2 text-gray-900 dark:text-white">{(users || []).filter(u => u.role === 'instructor').length || 0}</p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Course instructors</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
              <BookOpen className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Students</p>
              <p className="text-2xl lg:text-3xl font-bold mt-2 text-gray-900 dark:text-white">{(users || []).filter(u => u.role === 'student').length || 0}</p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Enrolled students</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl">
              <User className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>





      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 lg:p-6">
        <div className="flex items-center mb-4 lg:mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
            <Activity className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
          </div>
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">Recent Admin Activities</h3>
        </div>
        <div className="space-y-3 lg:space-y-4">
          {recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No recent activities</p>
            </div>
          ) : (
            recentActivities.map((activity, index) => {
              const getActivityIcon = (action) => {
                switch (action) {
                  case 'login': return Shield;
                  case 'admin_created': return Users;
                  case 'user_created': case 'user_deleted': return Users;
                  case 'course_created': case 'course_updated': case 'course_deleted': return BookOpen;
                  case 'schedule_created': case 'schedule_updated': return Calendar;
                  case 'contact_replied': return MessageSquare;
                  case 'permissions_updated': return Shield;
                  case 'category_created': case 'category_updated': case 'category_deleted': return BookOpen;
                  case 'reel_uploaded': case 'reel_deleted': return Video;
                  default: return Activity;
                }
              };
              
              const getActivityColor = (action) => {
                switch (action) {
                  case 'login': return 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-500';
                  case 'admin_created': case 'user_created': return 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-500';
                  case 'course_created': case 'course_updated': return 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-500';
                  case 'contact_replied': return 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-500';
                  case 'user_deleted': case 'course_deleted': case 'reel_deleted': return 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-500';
                  default: return 'from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-500';
                }
              };
              
              const IconComponent = getActivityIcon(activity.action);
              const colorClass = getActivityColor(activity.action);
              
              return (
                <div key={activity._id || index} className={`flex items-center p-3 lg:p-4 bg-gradient-to-r ${colorClass} rounded-xl border-l-4`}>
                  <IconComponent className="h-5 w-5 text-blue-600 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.description}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      By {activity.admin?.name || 'Admin'} • {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Gender Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
              <Users className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
            </div>
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">Student Gender Distribution</h3>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" className="dark:stroke-gray-600" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="8" 
                  strokeDasharray={`${(genderStats.students.male / Math.max(genderStats.students.male + genderStats.students.female, 1)) * 251.2} 251.2`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="none" 
                  stroke="#ec4899" 
                  strokeWidth="8" 
                  strokeDasharray={`${(genderStats.students.female / Math.max(genderStats.students.male + genderStats.students.female, 1)) * 251.2} 251.2`}
                  strokeDashoffset={`-${(genderStats.students.male / Math.max(genderStats.students.male + genderStats.students.female, 1)) * 251.2}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{genderStats.students.male + genderStats.students.female}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Students</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Male ({genderStats.students.male})</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Female ({genderStats.students.female})</span>
            </div>
          </div>
        </div>

        {/* Instructor Gender Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center mb-6">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mr-3">
              <BookOpen className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
            </div>
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">Instructor Gender Distribution</h3>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" className="dark:stroke-gray-600" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="8" 
                  strokeDasharray={`${(genderStats.instructors.male / Math.max(genderStats.instructors.male + genderStats.instructors.female, 1)) * 251.2} 251.2`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="none" 
                  stroke="#f59e0b" 
                  strokeWidth="8" 
                  strokeDasharray={`${(genderStats.instructors.female / Math.max(genderStats.instructors.male + genderStats.instructors.female, 1)) * 251.2} 251.2`}
                  strokeDashoffset={`-${(genderStats.instructors.male / Math.max(genderStats.instructors.male + genderStats.instructors.female, 1)) * 251.2}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{genderStats.instructors.male + genderStats.instructors.female}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Instructors</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Male ({genderStats.instructors.male})</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Female ({genderStats.instructors.female})</span>
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
            {(courses || [])
              .sort((a, b) => (b.studentCount || 0) - (a.studentCount || 0))
              .slice(0, 3)
              .map((course, index) => {
                const maxStudents = Math.max(...(courses || []).map(c => c.studentCount || 0), 1);
                const percentage = ((course.studentCount || 0) / maxStudents) * 100;
                const colors = ['bg-yellow-500', 'bg-gray-400', 'bg-orange-500'];
                const bgColors = ['bg-yellow-100 dark:bg-yellow-900/20', 'bg-gray-100 dark:bg-gray-700/20', 'bg-orange-100 dark:bg-orange-900/20'];
                
                return (
                  <div key={course._id} className={`p-4 rounded-xl ${bgColors[index]}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full ${colors[index]} flex items-center justify-center mr-3`}>
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{course.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{course.instructor?.name || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">{course.studentCount || 0}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">students</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${colors[index]} transition-all duration-1000`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            }
            {(courses || []).length === 0 && (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No courses available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 lg:p-6">
        <div className="flex items-center mb-4 lg:mb-6">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-3">
            <Settings className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600" />
          </div>
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {/* View Reels - Always visible for superadmin */}
          {user?.role === 'superadmin' && (
            <button 
              onClick={() => {
                setActiveTab('reels');
              }}
              className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-900/30 dark:hover:to-red-900/30 transition-all duration-200 group border border-orange-200 dark:border-orange-700"
            >
              <Eye className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">View Reels</span>
            </button>
          )}

          {/* Create Admin - Only for superadmin */}
          {user?.role === 'superadmin' && (
            <button 
              onClick={() => setShowCreateAdmin(true)}
              className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-200 group border border-purple-200 dark:border-purple-700"
            >
              <Shield className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">Create Admin</span>
            </button>
          )}
          
          {/* Add Course - Show if user has permission */}
          {(user?.role === 'superadmin' || user?.permissions?.includes('courses')) && (
            <button 
              onClick={() => {
                setActiveTab('courses');
                setShowAddCourse(true);
              }}
              className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-200 group border border-green-200 dark:border-green-700"
            >
              <Plus className="h-6 w-6 lg:h-8 lg:w-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">Add Course</span>
            </button>
          )}
          
          {/* Assign Schedule - Show if user has permission */}
          {(user?.role === 'superadmin' || user?.permissions?.includes('schedules')) && (
            <button 
              onClick={() => setActiveTab('schedules')}
              className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 transition-all duration-200 group border border-indigo-200 dark:border-indigo-700"
            >
              <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">Assign Schedule</span>
            </button>
          )}
          
          {/* Global Settings - Show if user has permission */}
          {(user?.role === 'superadmin' || user?.permissions?.includes('settings')) && (
            <button 
              onClick={() => setActiveTab('settings')}
              className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-xl hover:from-gray-100 hover:to-slate-100 dark:hover:from-gray-900/30 dark:hover:to-slate-900/30 transition-all duration-200 group border border-gray-200 dark:border-gray-700"
            >
              <Settings className="h-6 w-6 lg:h-8 lg:w-8 text-gray-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">Global Settings</span>
            </button>
          )}
          
          {/* Send Notifications - Show if user has permission */}
          {(user?.role === 'superadmin' || user?.permissions?.includes('notifications')) && (
            <button 
              onClick={() => setActiveTab('notifications')}
              className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-200 group border border-blue-200 dark:border-blue-700"
            >
              <Bell className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">Send Notifications</span>
            </button>
          )}
          
          {/* Send Newsletter - Show if user has permission */}
          {(user?.role === 'superadmin' || user?.permissions?.includes('subscriptions')) && (
            <button 
              onClick={() => {
                setActiveTab('subscriptions');
                setShowNewsletterForm(true);
              }}
              className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl hover:from-teal-100 hover:to-cyan-100 dark:hover:from-teal-900/30 dark:hover:to-cyan-900/30 transition-all duration-200 group border border-teal-200 dark:border-teal-700"
            >
              <Mail className="h-6 w-6 lg:h-8 lg:w-8 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">Send Newsletter</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );

  const renderCourses = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Course Management</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button 
            onClick={() => setActiveTab('categories')}
            className="w-full sm:w-auto bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2 text-sm font-medium"
          >
            Categories
          </button>
          <button 
            onClick={() => setShowAddCourse(true)}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Course
          </button>
        </div>
      </div>
      
      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-2xl font-bold text-blue-600">{courses.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Courses</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-2xl font-bold text-green-600">{courses.reduce((sum, course) => sum + (course.studentCount || 0), 0)}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Enrollments</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-2xl font-bold text-purple-600">{instructors.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Instructors</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-2xl font-bold text-orange-600">{courses.reduce((sum, course) => sum + course.price, 0)} Birr</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="relative w-full sm:w-auto">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
                />
              </div>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="not_started">Not Started</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-2/5">Course</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/6">Instructor</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">Price</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-20">Status</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">Likes</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {courses.map((course) => (
                <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-3 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{course.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{categories.find(cat => cat.slug === course.category)?.name || course.category}</div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="text-sm text-gray-900 dark:text-white truncate">{course.instructor?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      👥 {course.studentCount || course.enrollmentCount || course.enrollments?.length || course.students?.length || 0}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{course.price}</span>
                  </td>
                  <td className="px-3 py-4">
                    {(() => {
                      if (!course.startDate && !course.endDate) {
                        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Active</span>;
                      }
                      const now = new Date();
                      const startDate = course.startDate ? new Date(course.startDate) : null;
                      const endDate = course.endDate ? new Date(course.endDate) : null;
                      
                      if (startDate && now < startDate) {
                        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">Not Started</span>;
                      } else if (endDate) {
                        const endOfDay = new Date(endDate);
                        endOfDay.setHours(23, 59, 59, 999);
                        if (now > endOfDay) {
                          return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Closed</span>;
                        }
                      }
                      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Active</span>;
                    })()
                    }
                  </td>
                  <td className="px-3 py-4">
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-red-500" />
                        <span>{course.stars?.length || 0}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => {
                          setSelectedCourse(course);
                          setShowCourseDetail(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditCourse(course)}
                        className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCourse(course._id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Courses Found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {courses.map((course) => (
                <div key={course._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  {/* Course Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {categories.find(cat => cat.slug === course.category)?.name || course.category}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        By {course.instructor?.name || 'Unknown'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{course.price} Birr</p>
                    </div>
                  </div>

                  {/* Course Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Heart className="h-3 w-3 text-red-500" />
                        <span className="text-xs font-medium text-gray-900 dark:text-white">{course.stars?.length || 0}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Likes</p>
                    </div>
                    <div className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                      <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">{course.studentCount || 0}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Students</p>
                    </div>
                    <div className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                      <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">
                        {new Date(course.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                    </div>
                  </div>

                  {/* Course Status */}
                  <div className="mb-4 flex justify-center">
                    {(() => {
                      if (!course.startDate && !course.endDate) {
                        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Active</span>;
                      }
                      const now = new Date();
                      const startDate = course.startDate ? new Date(course.startDate) : null;
                      const endDate = course.endDate ? new Date(course.endDate) : null;
                      
                      if (startDate && now < startDate) {
                        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">Not Started</span>;
                      } else if (endDate) {
                        const endOfDay = new Date(endDate);
                        endOfDay.setHours(23, 59, 59, 999);
                        if (now > endOfDay) {
                          return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Closed</span>;
                        }
                      }
                      return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Active</span>;
                    })()
                    }
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowCourseDetail(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-2 px-3 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 py-2 px-3 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm font-medium"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-2 px-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Course Modal */}
      {(showAddCourse || showEditCourse) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {showEditCourse ? 'Edit Course' : 'Add New Course'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddCourse(false);
                    setShowEditCourse(false);
                    setEditingCourse(null);
                    setCourseForm({ title: '', description: '', about: '', price: '', category: '', instructor: '', image: null, registrationStart: '', registrationEnd: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course Title</label>
                  <input
                    type="text"
                    value={courseForm.title}
                    onChange={(e) => handleCourseFormChange('title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Enter course title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <input
                    type="text"
                    value={courseForm.description}
                    onChange={(e) => handleCourseFormChange('description', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Brief course description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">About This Course</label>
                  <textarea
                    rows="3"
                    value={courseForm.about}
                    onChange={(e) => handleCourseFormChange('about', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Detailed course information"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price (Birr)</label>
                  <input
                    type="number"
                    value={courseForm.price}
                    onChange={(e) => handleCourseFormChange('price', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Course price"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course Start Date</label>
                    <input
                      type="date"
                      value={courseForm.startDate}
                      onChange={(e) => handleCourseFormChange('startDate', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Registration Deadline (End Date)</label>
                    <input
                      type="date"
                      value={courseForm.endDate}
                      onChange={(e) => handleCourseFormChange('endDate', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <select
                    value={courseForm.category}
                    onChange={(e) => handleCourseFormChange('category', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assign Instructor</label>
                  <select
                    value={courseForm.instructor}
                    onChange={(e) => handleCourseFormChange('instructor', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select an instructor</option>
                    {instructors.map((instructor) => (
                      <option key={instructor._id} value={instructor._id}>
                        {instructor.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course Image</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUploadCourse}
                      className="hidden"
                      id="courseImageUpload"
                    />
                    <label
                      htmlFor="courseImageUpload"
                      className="bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 flex-1"
                    >
                      {courseForm.image ? (
                        <div className="flex items-center justify-center">
                          <div className="relative">
                            <img
                              src={URL.createObjectURL(courseForm.image)}
                              alt="Preview"
                              className="h-20 w-20 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleCourseFormChange('image', null);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-4">Click to change image</span>
                        </div>
                      ) : (
                          <div>
                            <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload course image</p>
                          </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={showEditCourse ? handleUpdateCourse : handleAddCourse}
                  disabled={loading || !courseForm.title || !courseForm.instructor}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (showEditCourse ? 'Updating...' : 'Adding...') : (showEditCourse ? 'Update Course' : 'Add Course')}
                </button>
                <button
                  onClick={() => {
                    setShowAddCourse(false);
                    setShowEditCourse(false);
                    setEditingCourse(null);
                    setCourseForm({ title: '', description: '', about: '', price: '', category: '', instructor: '', image: null, registrationStart: '', registrationEnd: '' });
                  }}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Detail Modal */}
      {showCourseDetail && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Course Details</h3>
                <button
                  onClick={() => setShowCourseDetail(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
            </div>
            
            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                {/* Course Header with Image */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <img 
                    src={selectedCourse.image} 
                    alt={selectedCourse.title}
                    className="w-full sm:w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">{selectedCourse.title}</h4>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 break-words">{selectedCourse.description}</p>
                  </div>
                </div>
                
                {/* About Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">About This Course</label>
                  <div className="text-sm sm:text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg break-words whitespace-pre-wrap leading-relaxed max-h-40 sm:max-h-48 overflow-y-auto">
                    {selectedCourse.about}
                  </div>
                </div>
                
                {/* Price and Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price</label>
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{selectedCourse.price} Birr</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg break-words">{categories.find(cat => cat.slug === selectedCourse.category)?.name || selectedCourse.category}</p>
                  </div>
                </div>
                
                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course Start</label>
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {selectedCourse.startDate ? new Date(selectedCourse.startDate).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Registration Deadline</label>
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {selectedCourse.endDate ? new Date(selectedCourse.endDate).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>
                
                {/* Instructor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instructor</label>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg break-words">{selectedCourse.instructor?.name || 'Unknown Instructor'}</p>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Students Enrolled</label>
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{selectedCourse.studentCount || 0}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Created Date</label>
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{new Date(selectedCourse.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  const renderCategories = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Category Management</h2>
        <button 
          onClick={() => setShowAddCategory(true)}
          className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {categories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditCategory(category)}
                        className="text-green-600 hover:text-green-800 p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        title="Edit Category"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(category._id)}
                        className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="h-4 w-4" />
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
      <div className="lg:hidden">
        {categories.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="h-16 w-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Categories Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first category to get started.</p>
            <button 
              onClick={() => setShowAddCategory(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium"
            >
              Add Category
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Created: {new Date(category.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="flex items-center justify-center w-8 h-8 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                      title="Edit Category"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category._id)}
                      className="flex items-center justify-center w-8 h-8 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Category Modal */}
      {(showAddCategory || showEditCategory) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {showEditCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddCategory(false);
                    setShowEditCategory(false);
                    setEditingCategory(null);
                    setCategoryForm({ name: '', description: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category Name</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => handleCategoryFormChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="Enter category name"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={showEditCategory ? handleUpdateCategory : handleAddCategory}
                  disabled={loading || !categoryForm.name}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (showEditCategory ? 'Updating...' : 'Adding...') : (showEditCategory ? 'Update Category' : 'Add Category')}
                </button>
                <button
                  onClick={() => {
                    setShowAddCategory(false);
                    setShowEditCategory(false);
                    setEditingCategory(null);
                    setCategoryForm({ name: '', description: '' });
                  }}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  const renderSchedules = () => (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              Assign Schedule
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage course schedules and assignments
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg">
            <Calendar className="h-4 w-4" />
            <span>{schedules.length} total schedules</span>
          </div>
        </div>
      </div>

      {/* Schedule Update Requests Section */}
      {scheduleRequests.filter(req => req.status === 'pending').length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-4 lg:p-6 border-2 border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Bell className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Pending Schedule Update Requests
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {scheduleRequests.filter(req => req.status === 'pending').length} request(s) awaiting approval
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            {scheduleRequests.filter(req => req.status === 'pending').map((request) => (
              <div key={request._id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700 hover:shadow-lg transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {request.course?.title || 'Unknown Course'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Requested by: {request.requestedBy?.name || 'Unknown'} • {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {request.newSessions?.length || 0} session(s) proposed
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowRequestDetail(true);
                      }}
                      className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleApproveRequest(request._id)}
                      className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-4 py-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm font-medium"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowRejectModal(true);
                      }}
                      className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Courses Table with Schedule Management */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="relative w-full sm:w-auto">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
                />
              </div>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 w-full sm:w-auto border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Instructor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Schedules</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {courses.map((course) => {
                const courseSchedules = schedules.filter(s => s.courseId === course._id);
                return (
                  <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{course.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{categories.find(cat => cat.slug === course.category)?.name || course.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">{course.instructor?.name || 'Not assigned'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{course.studentCount || course.enrollmentCount || course.enrollments?.length || course.students?.length || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{courseSchedules.length}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        if (!course.startDate && !course.endDate) {
                          return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Active</span>;
                        }
                        const now = new Date();
                        const startDate = course.startDate ? new Date(course.startDate) : null;
                        const endDate = course.endDate ? new Date(course.endDate) : null;
                        
                        if (startDate && now < startDate) {
                          return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">Not Started</span>;
                        } else if (endDate) {
                          const endOfDay = new Date(endDate);
                          endOfDay.setHours(23, 59, 59, 999);
                          if (now > endOfDay) {
                            return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Closed</span>;
                          }
                        }
                        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Active</span>;
                      })()
                      }
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedCourseForSchedule(course);
                            setScheduleForm({ sessions: [{ day: 'monday', startTime: '', endTime: '', room: '' }] });
                            setShowScheduleForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Create Schedule"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedCourseForSchedule(course);
                            setShowCourseSchedules(true);
                          }}
                          className="text-green-600 hover:text-green-800 p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                          title="View Schedules"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {courseSchedules.length > 0 && (
                          <button 
                            onClick={() => {
                              setSelectedCourseForSchedule(course);
                              const latestSchedule = courseSchedules[courseSchedules.length - 1];
                              setScheduleForm(latestSchedule);
                              setShowScheduleForm(true);
                            }}
                            className="text-orange-600 hover:text-orange-800 p-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                            title="Edit Latest Schedule"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {courseSchedules.length > 0 && (
                          <button 
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete all schedules for ${course.title}?`)) {
                                courseSchedules.forEach(schedule => handleDeleteSchedule(schedule.id));
                              }
                            }}
                            className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete All Schedules"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Courses Found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {courses.map((course) => {
                const courseSchedules = schedules.filter(s => s.courseId === course._id);
                return (
                  <div key={course._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    {/* Course Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-1">
                          {course.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {categories.find(cat => cat.slug === course.category)?.name || course.category}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          By {course.instructor?.name || 'Not assigned'}
                        </p>
                      </div>
                    </div>

                    {/* Course Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="h-3 w-3 text-blue-500" />
                          <span className="text-xs font-medium text-gray-900 dark:text-white">{course.studentCount || course.enrollmentCount || course.enrollments?.length || course.students?.length || 0}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Students</p>
                      </div>
                      <div className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Calendar className="h-3 w-3 text-green-500" />
                          <span className="text-xs font-medium text-gray-900 dark:text-white">{courseSchedules.length}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Schedules</p>
                      </div>
                      <div className="text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                        <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">
                          {new Date(course.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                      </div>
                    </div>

                    {/* Course Status */}
                    <div className="mb-4 flex justify-center">
                      {(() => {
                        if (!course.startDate && !course.endDate) {
                          return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Active</span>;
                        }
                        const now = new Date();
                        const startDate = course.startDate ? new Date(course.startDate) : null;
                        const endDate = course.endDate ? new Date(course.endDate) : null;
                        
                        if (startDate && now < startDate) {
                          return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">Not Started</span>;
                        } else if (endDate) {
                          const endOfDay = new Date(endDate);
                          endOfDay.setHours(23, 59, 59, 999);
                          if (now > endOfDay) {
                            return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Closed</span>;
                          }
                        }
                        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Active</span>;
                      })()
                      }
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setSelectedCourseForSchedule(course);
                          setScheduleForm({ sessions: [{ day: 'monday', startTime: '', endTime: '', room: '' }] });
                          setShowScheduleForm(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-2 px-3 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
                      >
                        <Plus className="h-4 w-4" />
                        Create
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCourseForSchedule(course);
                          setShowCourseSchedules(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 py-2 px-3 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">View ({courseSchedules.length})</span>
                      </button>
                      {courseSchedules.length > 0 && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedCourseForSchedule(course);
                              const latestSchedule = courseSchedules[courseSchedules.length - 1];
                              setScheduleForm(latestSchedule);
                              setShowScheduleForm(true);
                            }}
                            className="flex items-center justify-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 py-2 px-3 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-sm font-medium"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete all schedules for ${course.title}?`)) {
                                courseSchedules.forEach(schedule => handleDeleteSchedule(schedule.id));
                              }
                            }}
                            className="flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-2 px-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Schedule Form Modal */}
      {showScheduleForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-[95vw] sm:max-w-2xl lg:max-w-4xl h-[95vh] flex flex-col border border-gray-200 dark:border-gray-700">
            {/* Modal Header - Fixed */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 sm:p-6 flex-shrink-0 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                      {scheduleForm.id ? 'Update Class Sessions' : 'Create Class Sessions'}
                    </h3>
                    <p className="text-blue-100 text-xs sm:text-sm lg:text-base truncate max-w-[200px] sm:max-w-[300px] lg:max-w-none">{selectedCourseForSchedule?.title}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowScheduleForm(false);
                    setScheduleForm({ sessions: [{ day: 'monday', startTime: '', endTime: '', room: '' }] });
                  }} 
                  className="p-2 sm:p-3 hover:bg-white/20 rounded-xl transition-all duration-200 group"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
            
            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Class Sessions</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Configure weekly class schedule</p>
                  </div>
                  <button
                    onClick={addSession}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-2 text-sm sm:text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    Add Session
                  </button>
                </div>
                
                <div className="space-y-4 sm:space-y-6 pb-4">
                  {scheduleForm.sessions.map((session, index) => (
                    <div key={index} className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/30 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base">
                            {index + 1}
                          </div>
                          <h5 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg lg:text-xl">Session {index + 1}</h5>
                        </div>
                        {scheduleForm.sessions.length > 1 && (
                          <button
                            onClick={() => removeSession(index)}
                            className="text-red-600 hover:text-red-800 p-2 sm:p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 group"
                            title="Remove Session"
                          >
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm sm:text-base font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                              Day of Week *
                            </label>
                            <select
                              value={session.day}
                              onChange={(e) => handleSessionChange(index, 'day', e.target.value)}
                              className="w-full px-4 py-3 sm:px-5 sm:py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium"
                            >
                              <option value="monday">📅 Monday</option>
                              <option value="tuesday">📅 Tuesday</option>
                              <option value="wednesday">📅 Wednesday</option>
                              <option value="thursday">📅 Thursday</option>
                              <option value="friday">📅 Friday</option>
                              <option value="saturday">📅 Saturday</option>
                              <option value="sunday">📅 Sunday</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm sm:text-base font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                              Room/Location
                            </label>
                            <input
                              type="text"
                              value={session.room}
                              onChange={(e) => handleSessionChange(index, 'room', e.target.value)}
                              className="w-full px-4 py-3 sm:px-5 sm:py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium"
                              placeholder="🏫 e.g., Room 101, Lab A, Online"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm sm:text-base font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                              Start Time *
                            </label>
                            <input
                              type="time"
                              value={session.startTime}
                              onChange={(e) => handleSessionChange(index, 'startTime', e.target.value)}
                              className="w-full px-4 py-3 sm:px-5 sm:py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm sm:text-base font-bold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                              End Time *
                            </label>
                            <input
                              type="time"
                              value={session.endTime}
                              onChange={(e) => handleSessionChange(index, 'endTime', e.target.value)}
                              className="w-full px-4 py-3 sm:px-5 sm:py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Modal Footer - Fixed at Bottom */}
            <div className="border-t-2 border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex-shrink-0 rounded-b-3xl">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button 
                  onClick={handleCreateSchedule}
                  className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-4 sm:py-5 px-6 sm:px-8 rounded-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 flex items-center justify-center gap-3 font-bold text-sm sm:text-base lg:text-lg transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95"
                >
                  <Save className="h-5 w-5 sm:h-6 sm:w-6" /> 
                  {scheduleForm.id ? '✨ Update Sessions' : '🚀 Create Sessions'}
                </button>
                <button 
                  onClick={() => {
                    setShowScheduleForm(false);
                    setScheduleForm({ sessions: [{ day: 'monday', startTime: '', endTime: '', room: '' }] });
                  }} 
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 sm:py-5 px-6 sm:px-8 rounded-2xl hover:from-gray-600 hover:to-gray-700 font-bold text-sm sm:text-base lg:text-lg transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95"
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Schedules View Modal */}
      {showCourseSchedules && selectedCourseForSchedule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Course Schedules
                    </h3>
                    <p className="text-blue-100 text-sm">{selectedCourseForSchedule.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setShowCourseSchedules(false);
                      setScheduleForm({ sessions: [{ day: 'monday', startTime: '', endTime: '', room: '' }] });
                      setShowScheduleForm(true);
                    }} 
                    className="bg-white/20 text-white px-3 py-2 rounded-lg hover:bg-white/30 text-sm font-medium transition-all duration-200 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Session
                  </button>
                  <button 
                    onClick={() => setShowCourseSchedules(false)} 
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
              {schedules.filter(s => s.courseId === selectedCourseForSchedule._id).length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Schedules Yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first schedule for this course to get started.</p>
                  <button 
                    onClick={() => {
                      setShowCourseSchedules(false);
                      setScheduleForm({ title: '', description: '', date: '', startTime: '', endTime: '', location: '', type: 'lecture' });
                      setShowScheduleForm(true);
                    }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto transition-all duration-200"
                  >
                    <Plus className="h-4 w-4" />
                    Create First Schedule
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {schedules.filter(s => s.courseId === selectedCourseForSchedule._id).map((schedule) => (
                    <div key={schedule.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-lg">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {schedule.courseTitle} - Class Schedule
                          </h5>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Created: {new Date(schedule.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleDeleteSchedule(schedule.id)} 
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete Schedule"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {schedule.sessions.map((session, index) => (
                          <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                            <div className="flex items-center gap-2 mb-3">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <span className="font-semibold text-blue-800 dark:text-blue-300 capitalize">
                                {session.day}
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-gray-500" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {session.startTime} - {session.endTime}
                                </span>
                              </div>
                              
                              {session.room && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3 w-3 text-gray-500" />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {session.room}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {showRequestDetail && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-3xl max-h-[95vh] overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">Schedule Update Request</h3>
                    <p className="text-yellow-100 text-sm">{selectedRequest.course?.title}</p>
                  </div>
                </div>
                <button onClick={() => setShowRequestDetail(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Requested By</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedRequest.requestedBy?.name}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Request Date</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Reason for Update</p>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedRequest.reason}</p>
                </div>

                <div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white mb-3">Proposed Sessions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedRequest.newSessions?.map((session, index) => (
                      <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold text-blue-800 dark:text-blue-300 capitalize">{session.day}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-gray-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{session.startTime} - {session.endTime}</span>
                          </div>
                          {session.room && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-gray-500" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{session.room}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
              <div className="flex gap-3">
                <button onClick={() => setShowRequestDetail(false)} className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 font-medium">
                  Close
                </button>
                <button onClick={() => { setShowRequestDetail(false); setShowRejectModal(true); }} className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2">
                  <X className="h-4 w-4" /> Reject
                </button>
                <button onClick={() => handleApproveRequest(selectedRequest._id)} className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Reject Request</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Please provide a reason for rejecting this schedule update request. The instructor will see this message.</p>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason for rejection *</label>
              <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows="4" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="Enter reason for rejection..."></textarea>
              {!rejectionReason.trim() && <p className="text-xs text-red-500 mt-1">Reason is required</p>}
              <div className="flex gap-3 mt-4">
                <button onClick={() => { setShowRejectModal(false); setRejectionReason(''); }} className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600">Cancel</button>
                <button onClick={handleRejectRequest} disabled={!rejectionReason.trim() || loading} className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Rejecting...' : 'Reject Request'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderReels = () => (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Video className="h-6 w-6 text-red-600" />
              Reel Management
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Upload and manage educational video reels
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setShowReelsList(true);
                fetchReels();
              }}
              className="bg-orange-600 text-white px-4 py-2 rounded-xl hover:bg-orange-700 flex items-center gap-2 text-sm font-medium"
            >
              <Eye className="h-4 w-4" />
              View Reels ({reels.length})
            </button>
            <button 
              onClick={() => setShowReelUpload(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 flex items-center gap-2 text-sm font-medium"
            >
              <Video className="h-4 w-4" />
              Upload Reel
            </button>
          </div>
        </div>
      </div>

      {/* Reels Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6">
          {reelsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading reels...</p>
            </div>
          ) : reels.length === 0 ? (
            <div className="text-center py-12">
              <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Reels Found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Upload your first reel to get started.</p>
              <button 
                onClick={() => setShowReelUpload(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 mx-auto"
              >
                <Video className="h-4 w-4" />
                Upload Reel
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reels.filter(reel => reel && reel._id && reel.title).map((reel) => (
                <div key={reel._id} className="bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200">
                  <div className="aspect-video bg-gray-200 dark:bg-gray-600 relative">
                    {reel.videoUrl ? (
                      <video 
                        src={reel.videoUrl} 
                        className="w-full h-full object-cover"
                        controls
                        preload="metadata"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
                        <Video className="h-12 w-12 text-gray-500" />
                        <span className="ml-2 text-gray-500">Video not available</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 break-words leading-tight">
                      {reel.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 break-words leading-relaxed whitespace-pre-wrap overflow-wrap-anywhere">
                      {reel.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <span>👁️ {reel.views || 0} views</span>
                      <span>❤️ {reel.likes?.length || 0} likes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(reel.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditReel(reel)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Edit Reel"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReel(reel._id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete Reel"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reel Upload Modal - Perfect Mobile Responsive */}
      {showReelUpload && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 w-full sm:max-w-lg sm:w-full h-full sm:h-auto sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Upload New Reel</h3>
                <button
                  onClick={() => {
                    setShowReelUpload(false);
                    setReelForm({ title: '', description: '', video: null });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-6">
                {/* Video Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Video Title
                  </label>
                  <input
                    type="text"
                    value={reelForm.title}
                    onChange={(e) => handleReelFormChange('title', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter video title"
                    maxLength={100}
                  />
                </div>
                
                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={reelForm.description}
                    onChange={(e) => handleReelFormChange('description', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter video description"
                    maxLength={500}
                  />
                </div>
                
                {/* Video Upload */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Video File
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleReelVideoUpload}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Footer - Fixed */}
            <div className="border-t-2 border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0 sm:rounded-b-3xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleUploadReel}
                  disabled={loading || !reelForm.title.trim() || !reelForm.description.trim() || !reelForm.video}
                  className="flex-1 bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 text-white py-4 px-6 rounded-2xl hover:from-red-600 hover:via-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-bold text-base transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Video className="h-5 w-5" />
                      <span>🚀 Upload Reel</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowReelUpload(false);
                    setReelForm({ title: '', description: '', video: null });
                  }}
                  disabled={loading}
                  className="flex-1 sm:flex-none sm:px-8 bg-gray-500 text-white py-4 px-6 rounded-2xl hover:bg-gray-600 disabled:opacity-50 font-bold text-base transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95"
                >
                  Cancel
                </button>
              </div>
              
              {/* Progress indicator for mobile */}
              <div className="mt-4 sm:hidden">
                <div className="flex justify-center space-x-2">
                  <div className={`w-2 h-2 rounded-full transition-colors ${
                    reelForm.title.trim() ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div className={`w-2 h-2 rounded-full transition-colors ${
                    reelForm.description.trim() ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div className={`w-2 h-2 rounded-full transition-colors ${
                    reelForm.video ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                </div>
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                  {reelForm.title.trim() && reelForm.description.trim() && reelForm.video 
                    ? '✅ Ready to upload!' 
                    : `${[reelForm.title.trim(), reelForm.description.trim(), reelForm.video].filter(Boolean).length}/3 completed`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Reel Modal - Perfect Mobile Responsive */}
      {showEditReel && editingReel && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 w-full sm:max-w-lg sm:w-full max-h-[95vh] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header - Fixed */}
            <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 p-4 sm:p-6 flex-shrink-0 sm:rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Edit className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Edit Reel
                    </h3>
                    <p className="text-blue-100 text-xs sm:text-sm">Update video details</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEditReel(false);
                    setEditingReel(null);
                    setReelForm({ title: '', description: '', video: null });
                  }}
                  className="p-2 sm:p-3 hover:bg-white/20 rounded-xl transition-all duration-200 group"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
            
            {/* Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-6">
                {/* Video Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    📝 Video Title *
                  </label>
                  <input
                    type="text"
                    value={reelForm.title}
                    onChange={(e) => handleReelFormChange('title', e.target.value)}
                    className="w-full px-4 py-3 sm:py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl dark:bg-gray-700 dark:text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                    placeholder="Enter an engaging video title..."
                    maxLength={100}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Make it catchy and descriptive</p>
                    <span className="text-xs text-gray-400">{reelForm.title.length}/100</span>
                  </div>
                </div>
                
                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    📄 Description *
                  </label>
                  <textarea
                    rows={4}
                    value={reelForm.description}
                    onChange={(e) => handleReelFormChange('description', e.target.value)}
                    className="w-full px-4 py-3 sm:py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl dark:bg-gray-700 dark:text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 resize-none"
                    placeholder="Describe what viewers will learn from this video..."
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Explain the educational value</p>
                    <span className="text-xs text-gray-400">{reelForm.description.length}/500</span>
                  </div>
                </div>
                
                {/* Current Video Info */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-3xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                      <Video className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-blue-800 dark:text-blue-300">
                        🎥 Current Video
                      </h4>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Video file cannot be changed
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          📹 Original Video
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Only title and description can be updated
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">✓</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-2xl p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600 text-sm">💡</span>
                      <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                {/* Video File - Optional Replace */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    🎬 Replace Video File <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleReelVideoUpload}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {reelForm.video ? (
                    <p className="text-xs text-green-600 dark:text-green-400">✅ New video selected: {reelForm.video.name}</p>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Leave empty to keep the current video.</p>
                  )}
                </div>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer - Fixed */}
            <div className="border-t-2 border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0 sm:rounded-b-3xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleUpdateReel}
                  disabled={loading || !reelForm.title.trim() || !reelForm.description.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white py-4 px-6 rounded-2xl hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-bold text-base transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Edit className="h-5 w-5" />
                      <span>✨ Update Reel</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowEditReel(false);
                    setEditingReel(null);
                    setReelForm({ title: '', description: '', video: null });
                  }}
                  disabled={loading}
                  className="flex-1 sm:flex-none sm:px-8 bg-gray-500 text-white py-4 px-6 rounded-2xl hover:bg-gray-600 disabled:opacity-50 font-bold text-base transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95"
                >
                  Cancel
                </button>
              </div>
              
              {/* Progress indicator for mobile */}
              <div className="mt-4 sm:hidden">
                <div className="flex justify-center space-x-2">
                  <div className={`w-2 h-2 rounded-full transition-colors ${
                    reelForm.title.trim() ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div className={`w-2 h-2 rounded-full transition-colors ${
                    reelForm.description.trim() ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                </div>
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                  {reelForm.title.trim() && reelForm.description.trim()
                    ? '✅ Ready to update!' 
                    : `${[reelForm.title.trim(), reelForm.description.trim()].filter(Boolean).length}/2 completed`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAdmins = () => {
    return (
      <div className="space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="h-6 w-6 text-purple-600" />
                Admin Management
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage administrator accounts and permissions
              </p>
            </div>
            <button 
              onClick={() => setShowCreateAdmin(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-indigo-700 flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-4 w-4" /> Create Admin
            </button>
          </div>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Admin</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Permissions</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.filter(u => u.role === 'admin' || u.role === 'superadmin').map((admin) => (
                  <tr key={admin._id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:from-purple-900/10 dark:hover:to-indigo-900/10 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mr-4 flex items-center justify-center overflow-hidden shadow-lg">
                          {admin.profileImage ? (
                            <img src={admin.profileImage} alt={admin.name} className="h-full w-full object-cover" />
                          ) : (
                            <Shield className="h-6 w-6 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{admin.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                        admin.role === 'superadmin' ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 dark:from-red-900/20 dark:to-pink-900/20 dark:text-red-300' :
                        'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 dark:from-purple-900/20 dark:to-indigo-900/20 dark:text-purple-300'
                      }`}>
                        {admin.role === 'superadmin' ? '👑 Super Admin' : '👤 Admin'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {admin.role === 'superadmin' ? (
                          <div className="flex items-center gap-1">
                            <Crown className="h-4 w-4 text-yellow-500" />
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">Full Access</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Settings className="h-4 w-4 text-gray-500" />
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded">
                              {admin.permissions?.length || 0} permissions
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(admin.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleShowPermissions(admin)}
                          className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Manage Permissions"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        {admin.role !== 'superadmin' && (
                          <button 
                            onClick={() => handleDeleteUser(admin._id)} 
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Revoke Access"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          {users.filter(u => u.role === 'admin' || u.role === 'superadmin').length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Admins Found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first admin account to get started.</p>
              <button 
                onClick={() => setShowCreateAdmin(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Create Admin
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {users.filter(u => u.role === 'admin' || u.role === 'superadmin').map((admin) => (
                <div key={admin._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  {/* Admin Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
                      {admin.profileImage ? (
                        <img src={admin.profileImage} alt={admin.name} className="h-full w-full object-cover" />
                      ) : (
                        <Shield className="h-7 w-7 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">
                        {admin.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 break-all">
                        {admin.email}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
                          admin.role === 'superadmin' ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 dark:from-red-900/20 dark:to-pink-900/20 dark:text-red-300' :
                          'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 dark:from-purple-900/20 dark:to-indigo-900/20 dark:text-purple-300'
                        }`}>
                          {admin.role === 'superadmin' ? '👑 Super Admin' : '👤 Admin'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(admin.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Admin Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Permissions</p>
                      <div className="flex items-center gap-2">
                        {admin.role === 'superadmin' ? (
                          <>
                            <Crown className="h-4 w-4 text-yellow-500" />
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Full Access</p>
                          </>
                        ) : (
                          <>
                            <Settings className="h-4 w-4 text-gray-500" />
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{admin.permissions?.length || 0} permissions</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Join Date</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {new Date(admin.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleShowPermissions(admin)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-600 dark:text-green-400 py-3 px-4 rounded-xl hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
                    >
                      <Settings className="h-4 w-4" />
                      {admin.role === 'superadmin' ? 'Manage Role' : 'Permissions'}
                    </button>
                    {admin.role !== 'superadmin' && (
                      <button
                        onClick={() => handleDeleteUser(admin._id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 text-red-600 dark:text-red-400 py-3 px-4 rounded-xl hover:from-red-100 hover:to-pink-100 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
                      >
                        <Trash2 className="h-4 w-4" />
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create/Update Admin Modal */}
        {showCreateAdmin && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">
                        {editingAdmin ? 'Update Admin' : 'Create Admin'}
                      </h3>
                      <p className="text-purple-100 text-sm">Manage administrator access</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateAdmin(false);
                      setEditingAdmin(null);
                      setAdminForm({ name: '', email: '', password: '', role: 'admin', permissions: [] });
                    }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </button>
                </div>
              </div>
              
              {/* Modal Body */}
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
                <div className="space-y-5">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Admin Name *
                    </label>
                    <input
                      type="text"
                      value={adminForm.name}
                      onChange={(e) => handleAdminFormChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm"
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={adminForm.email}
                      onChange={(e) => handleAdminFormChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm"
                      placeholder="admin@example.com"
                    />
                  </div>
                  
                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Role *
                    </label>
                    <select
                      value={adminForm.role}
                      onChange={(e) => handleAdminFormChange('role', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm"
                    >
                      <option value="admin">👤 Admin</option>
                      <option value="superadmin">👑 Super Admin</option>
                    </select>
                  </div>
                  
                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Password {editingAdmin ? '(optional)' : '*'}
                    </label>
                    <input
                      type="password"
                      value={adminForm.password}
                      onChange={(e) => handleAdminFormChange('password', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 text-sm"
                      placeholder={editingAdmin ? "Leave blank to keep current" : "Enter secure password"}
                    />
                    {editingAdmin && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Leave blank to keep current password</p>
                    )}
                  </div>

                  {/* Permissions Section */}
                  {adminForm.role === 'admin' ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Page Permissions
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 max-h-48 overflow-y-auto">
                        <div className="grid grid-cols-1 gap-3">
                          {availablePermissions.map((permission) => (
                            <label key={permission.id} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer border border-gray-200 dark:border-gray-600">
                              <input
                                type="checkbox"
                                checked={adminForm.permissions.includes(permission.id)}
                                onChange={() => {
                                  const newPermissions = adminForm.permissions.includes(permission.id)
                                    ? adminForm.permissions.filter(p => p !== permission.id)
                                    : [...adminForm.permissions, permission.id];
                                  handleAdminFormChange('permissions', newPermissions);
                                }}
                                className="mt-0.5 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {permission.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {permission.description}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <Crown className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Super Admin Access</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">Full access to all platform features and settings</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="sticky bottom-0 border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-white dark:bg-gray-800">
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowCreateAdmin(false);
                      setEditingAdmin(null);
                      setAdminForm({ name: '', email: '', password: '', role: 'admin', permissions: [] });
                    }}
                    disabled={loading}
                    className="w-full sm:flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl disabled:opacity-50 font-semibold transition-all duration-200 text-sm shadow-lg hover:shadow-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAdmin}
                    disabled={loading || !adminForm.name || !adminForm.email || (!editingAdmin && !adminForm.password)}
                    className="w-full sm:flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        {editingAdmin ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        {editingAdmin ? 'Update Admin' : 'Create Admin'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Permissions Modal */}
        {showPermissions && selectedAdminForPermissions && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Settings className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">
                        Manage {selectedAdminForPermissions.role === 'superadmin' ? 'Role & Permissions' : 'Permissions'}
                      </h3>
                      <p className="text-purple-100 text-sm">{selectedAdminForPermissions.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowPermissions(false);
                      setSelectedAdminForPermissions(null);
                      setAdminPermissions([]);
                    }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </button>
                </div>
              </div>
              
              {/* Modal Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                {/* Admin Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Email</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white break-all">{selectedAdminForPermissions.email}</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Current Role</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedAdminForPermissions.role}</p>
                  </div>
                </div>

                {selectedAdminForPermissions.tempPassword && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700 mb-6">
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Temporary Password</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white font-mono">{selectedAdminForPermissions.tempPassword}</p>
                  </div>
                )}
                
                {/* Role Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Role</label>
                  <select 
                    value={selectedAdminForPermissions.role}
                    onChange={(e) => {
                      setSelectedAdminForPermissions(prev => ({ ...prev, role: e.target.value }));
                      if (e.target.value === 'superadmin') {
                        setAdminPermissions(availablePermissions.map(p => p.id));
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  >
                    <option value="admin">👤 Admin</option>
                    <option value="superadmin">👑 Super Admin</option>
                  </select>
                </div>

                {/* Permissions Section */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Page Permissions
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 max-h-80 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-3">
                      {availablePermissions.map((permission) => (
                        <label key={permission.id} className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer border border-gray-200 dark:border-gray-600 group">
                          <input
                            type="checkbox"
                            checked={adminPermissions.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded flex-shrink-0 transition-colors"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {permission.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                              {permission.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="sticky bottom-0 border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-white dark:bg-gray-800">
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowPermissions(false);
                      setSelectedAdminForPermissions(null);
                      setAdminPermissions([]);
                    }}
                    disabled={loading}
                    className="w-full sm:flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl disabled:opacity-50 font-semibold transition-all duration-200 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdatePermissions}
                    disabled={loading}
                    className="w-full sm:flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Settings className="h-4 w-4" />
                        Update {selectedAdminForPermissions.role === 'superadmin' ? 'Role & Permissions' : 'Permissions'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSendNotification = () => (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="h-6 w-6 text-blue-600" />
              Send Notification
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Send notifications to users by role
            </p>
          </div>
        </div>
      </div>

      {/* Notification Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4 sm:space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Send To</label>
              <select
                value={notificationForm.role}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm sm:text-base"
              >
                {user?.role === 'superadmin' ? (
                  <>
                    <option value="all">All Users</option>
                    <option value="admin">Admins</option>
                    <option value="instructor">Instructors</option>
                    <option value="student">Students</option>
                  </>
                ) : (
                  <>
                    <option value="all">All Users (Students & Instructors)</option>
                    <option value="instructor">Instructors</option>
                    <option value="student">Students</option>
                  </>
                )}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Title</label>
              <input
                type="text"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Notification title"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm sm:text-base"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Message</label>
              <textarea
                rows="4"
                value={notificationForm.message}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Notification message"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none text-sm sm:text-base min-h-[100px] sm:min-h-[120px]"
              />
            </div>

            {/* Send Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    await notificationAPI.sendNotification({
                      title: notificationForm.title,
                      message: notificationForm.message,
                      role: notificationForm.role
                    });
                    
                    const roleText = user?.role === 'superadmin' 
                      ? (notificationForm.role === 'all' ? 'all users' : `${notificationForm.role}s`)
                      : (notificationForm.role === 'all' ? 'all users (students & instructors)' : `${notificationForm.role}s`);
                    
                    setNotificationForm({ title: '', message: '', role: 'all' });
                    showNotification('success', 'Notification Sent', `Notification sent to ${roleText}`);
                  } catch (error) {
                    console.error('Send notification error:', error);
                    showNotification('error', 'Send Failed', error.response?.data?.message || 'Failed to send notification');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={!notificationForm.title || !notificationForm.message || loading}
                className="flex-1 bg-blue-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? 'Sending...' : 'Send Notification'}
              </button>
              <button
                onClick={() => setNotificationForm({ title: '', message: '', role: 'all' })}
                disabled={loading}
                className="flex-1 bg-gray-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-gray-600 font-medium disabled:opacity-50 text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              All Users Management
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage and monitor all platform users
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg">
            <Users className="h-4 w-4" />
            <span>{users.length} users found</span>
          </div>
        </div>
      </div>
      
      {/* Stats Cards - Enhanced Mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
        <div className="bg-white dark:bg-gray-800 p-3 lg:p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-2">
            <User className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
          </div>
          <p className="text-lg lg:text-2xl font-bold text-blue-600 mb-1">{users.filter(u => u.role === 'student').length}</p>
          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Students</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 lg:p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-2">
            <BookOpen className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
          </div>
          <p className="text-lg lg:text-2xl font-bold text-green-600 mb-1">{users.filter(u => u.role === 'instructor').length}</p>
          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Instructors</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 lg:p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Shield className="h-4 w-4 lg:h-5 lg:w-5 text-purple-600" />
          </div>
          <p className="text-lg lg:text-2xl font-bold text-purple-600 mb-1">{users.filter(u => u.role === 'admin').length}</p>
          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Admins</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 lg:p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Crown className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600" />
          </div>
          <p className="text-lg lg:text-2xl font-bold text-orange-600 mb-1">{users.filter(u => u.role === 'superadmin').length}</p>
          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Super Admins</p>
        </div>
        {selectedRole === 'student' && (
          <div className="bg-white dark:bg-gray-800 p-3 lg:p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 col-span-2 sm:col-span-1">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </div>
            <p className="text-lg lg:text-2xl font-bold text-emerald-600 mb-1">{totalPayments}</p>
            <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Total Payments (Birr)</p>
          </div>
        )}
      </div>

      {/* Filters - Enhanced Mobile */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 lg:p-6 border border-gray-100 dark:border-gray-700">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="instructor">Instructors</option>
              <option value="admin">Admins</option>
              <option value="superadmin">Super Admins</option>
            </select>
            
            <select 
              value={selectedGenderFilter}
              onChange={(e) => setSelectedGenderFilter(e.target.value)}
              className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            
            {(selectedRole === 'student' || selectedRole === 'instructor') && (
              <select 
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">All Courses</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            )}
            
            {(selectedRole === 'student' || selectedRole === 'instructor') && (
              <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
                <button
                  onClick={() => handleExport('pdf')}
                  className="flex-1 px-3 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">PDF</span>
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="flex-1 px-3 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">Excel</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {usersLoading ? (
        <div className="flex justify-center items-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View - Enhanced */}
          <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Sex</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10 transition-all duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-4 overflow-hidden flex-shrink-0 shadow-lg">
                            {user.profileImage ? (
                              <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-sm font-bold text-white">
                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                          user.role === 'superadmin' ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 dark:from-red-900/20 dark:to-pink-900/20 dark:text-red-300' :
                          user.role === 'admin' ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 dark:from-purple-900/20 dark:to-indigo-900/20 dark:text-purple-300' :
                          user.role === 'instructor' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 dark:from-blue-900/20 dark:to-cyan-900/20 dark:text-blue-300' :
                          'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-300'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {user.systemId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {user.gender || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewUser(user._id)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 shadow-sm hover:shadow-md"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {user.role !== 'superadmin' && (
                            <button 
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 shadow-sm hover:shadow-md"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View - Enhanced */}
          <div className="lg:hidden">
            {users.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Users Found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your search or filters to find users.</p>
                <div className="flex justify-center">
                  <button 
                    onClick={() => {
                      setUserSearchTerm('');
                      setSelectedRole('all');
                      setSelectedCourseFilter('all');
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    {/* User Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-white">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">
                          {user.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 break-all">
                          {user.email}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
                            user.role === 'superadmin' ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 dark:from-red-900/20 dark:to-pink-900/20 dark:text-red-300' :
                            user.role === 'admin' ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 dark:from-purple-900/20 dark:to-indigo-900/20 dark:text-purple-300' :
                            user.role === 'instructor' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 dark:from-blue-900/20 dark:to-cyan-900/20 dark:text-blue-300' :
                            'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-300'
                          }`}>
                            {user.role}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
                            user.isVerified ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-300' :
                            'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 dark:from-yellow-900/20 dark:to-orange-900/20 dark:text-yellow-300'
                          }`}>
                            {user.isVerified ? '✓ Verified' : '⏳ Pending'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* User Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {user.systemId && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {user.role === 'student' ? 'Student ID' : 
                             user.role === 'instructor' ? 'Instructor ID' : 'System ID'}
                          </p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.systemId}</p>
                        </div>
                      )}
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Join Date</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleViewUser(user._id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 py-3 px-4 rounded-xl hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                      {user.role !== 'superadmin' && (
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 text-red-600 dark:text-red-400 py-3 px-4 rounded-xl hover:from-red-100 hover:to-pink-100 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">User Details</h3>
                <button
                  onClick={() => setShowUserDetail(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* User Profile Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                    {selectedUser.profileImage ? (
                      <img src={selectedUser.profileImage} alt={selectedUser.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                        {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{selectedUser.name}</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{selectedUser.email}</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedUser.role === 'superadmin' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                        selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' :
                        selectedUser.role === 'instructor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      }`}>
                        {selectedUser.role}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedUser.isVerified ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                      }`}>
                        {selectedUser.isVerified ? 'Verified' : 'Pending Verification'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Personal Information */}
                <div className="bg-white dark:bg-gray-700/50 rounded-xl p-4">
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h5>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedUser.role === 'student' ? 'Student ID' : 
                           selectedUser.role === 'instructor' ? 'Instructor ID' : 'System ID'}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.systemId || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Date of Birth</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">City</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.city || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.address || 'N/A'}</p>
                    </div>
                    {selectedUser.bio && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Bio</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.bio}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Academic/Professional Information */}
                <div className="bg-white dark:bg-gray-700/50 rounded-xl p-4">
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {selectedUser.role === 'student' ? 'Academic Information' : 
                     selectedUser.role === 'instructor' ? 'Professional Information' : 'System Information'}
                  </h5>
                  <div className="space-y-3">
                    {selectedUser.role === 'student' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Program</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.program || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Year of Study</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.yearOfStudy || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Field of Study</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.fieldOfStudy || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Institution</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.institution || 'N/A'}</p>
                          </div>
                        </div>
                      </>
                    )}
                    {selectedUser.role === 'instructor' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Department</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.department || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Specialization</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.specialization || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Experience</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.experience || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Institution</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.institution || 'N/A'}</p>
                          </div>
                        </div>
                      </>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Joined Date</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(selectedUser.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(selectedUser.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Specific Data */}
              {selectedUser.role === 'student' && (
                <>
                  {/* Enrolled Courses */}
                  {userEnrollments.length > 0 && (
                    <div className="mb-6">
                      <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Enrolled Courses ({userEnrollments.length})</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userEnrollments.map((enrollment) => (
                          <div key={enrollment._id} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                            <h6 className="font-medium text-gray-900 dark:text-white mb-1">{enrollment.course.title}</h6>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Instructor: {enrollment.course.instructor?.name}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}</span>
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{enrollment.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment History */}
                  {userPayments.length > 0 && (
                    <div className="mb-6">
                      <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment History ({userPayments.length})</h5>
                      <div className="bg-white dark:bg-gray-700/50 rounded-xl overflow-hidden">
                        <div className="max-h-64 overflow-y-auto">
                          {userPayments.map((payment) => (
                            <div key={payment._id} className="p-4 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-start gap-3">
                                    <img 
                                      src={payment.course?.image || payment.courses?.[0]?.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=50'}
                                      alt={payment.course?.title || 'Course'}
                                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-gray-900 dark:text-white">
                                        {payment.isBulk ? `${payment.courses?.length || 0} Courses Bundle` : payment.course?.title || 'Course'}
                                      </p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">Receipt: {payment.receiptNumber}</p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(payment.createdAt).toLocaleDateString()}</p>
                                      {payment.isBulk && payment.courses && (
                                        <div className="mt-2">
                                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Courses:</p>
                                          <div className="flex flex-wrap gap-1">
                                            {payment.courses.slice(0, 2).map((course, index) => (
                                              <span key={course._id} className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                                                {course.title}
                                              </span>
                                            ))}
                                            {payment.courses.length > 2 && (
                                              <span className="text-xs text-gray-500 dark:text-gray-400">+{payment.courses.length - 2} more</span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <p className="font-bold text-gray-900 dark:text-white">{payment.amount} Birr</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-2 py-1 rounded capitalize">{payment.paymentMethod}</span>
                                    <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">{payment.status}</span>
                                  </div>
                                  <div className="mt-2 flex gap-1">
                                    <button
                                      onClick={() => handleViewUserReceipt(payment._id)}
                                      disabled={loading}
                                      className="flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      title="View Receipt"
                                    >
                                      {loading ? (
                                        <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                                      ) : (
                                        <Eye className="h-3 w-3" />
                                      )}
                                      View
                                    </button>
                                    <button
                                      onClick={() => handleDownloadUserReceipt(payment._id)}
                                      disabled={loading}
                                      className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      title="Download Receipt"
                                    >
                                      {loading ? (
                                        <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                                      ) : (
                                        <Download className="h-3 w-3" />
                                      )}
                                      Download
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Instructor Specific Data */}
              {selectedUser.role === 'instructor' && userCourses.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Teaching Courses ({userCourses.length})</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userCourses.map((course) => (
                      <div key={course._id} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <h6 className="font-medium text-gray-900 dark:text-white mb-1">{course.title}</h6>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{course.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Students: {course.students?.length || 0}</span>
                          <span className="text-xs text-gray-500">Price: {course.price} Birr</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Global Settings</h2>
        <button onClick={handleSaveSettings} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Save className="h-4 w-4" /> Save Settings
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Platform Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform Name</label>
              <input type="text" value={platformSettings.platformName} onChange={(e) => handleSettingsChange('platformName', e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">System Email</label>
              <input type="email" value={platformSettings.systemEmail} onChange={(e) => handleSettingsChange('systemEmail', e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Upload Size (MB)</label>
              <input type="number" value={platformSettings.maxUploadSize} onChange={(e) => handleSettingsChange('maxUploadSize', e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Support Contact</label>
              <input type="email" defaultValue="support@aau-elearning.edu.et" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Language</label>
              <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                <option value="en">English</option>
                <option value="am">Amharic</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold mb-4 text-gray-900 dark:text-white">System Maintenance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Maintenance Mode</span>
              <button onClick={() => handleSettingsChange('maintenanceMode', !platformSettings.maintenanceMode)} className={`px-3 py-1 rounded text-sm font-medium ${platformSettings.maintenanceMode ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                {platformSettings.maintenanceMode ? 'Enabled' : 'Disabled'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Auto Backup</span>
              <button onClick={() => handleSettingsChange('autoBackup', !platformSettings.autoBackup)} className={`px-3 py-1 rounded text-sm font-medium ${platformSettings.autoBackup ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                {platformSettings.autoBackup ? 'Enabled' : 'Disabled'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Debug Mode</span>
              <button onClick={() => handleSettingsChange('debugMode', !platformSettings.debugMode)} className={`px-3 py-1 rounded text-sm font-medium ${platformSettings.debugMode ? 'bg-yellow-600 text-white' : 'bg-gray-600 text-white'}`}>
                {platformSettings.debugMode ? 'Development' : 'Production'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">User Registration</span>
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium">Open</button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Email Notifications</span>
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium">Enabled</button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Security & Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Session Timeout (minutes)</label>
              <input type="number" defaultValue="30" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password Min Length</label>
              <input type="number" defaultValue="8" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Login Attempts</label>
              <input type="number" defaultValue="5" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cache Duration (hours)</label>
              <input type="number" defaultValue="24" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
          </div>
        </div>
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
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
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
              <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl lg:text-4xl font-bold overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user ? getInitials(user.name) : 'SA'
                )}
              </div>
              {isEditing && (
                <>
                  <button 
                    onClick={() => setShowImageOptions(!showImageOptions)}
                    disabled={loading}
                    className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50"
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
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{user?.name || 'Super Administrator'}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-1">{user?.email || 'superadmin@aau.edu'}</p>
            <p className="text-purple-600 dark:text-purple-400 font-medium capitalize">{user?.role || 'Super Admin'}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-sm rounded-full">Verified Account</span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 text-sm rounded-full">Super Admin</span>
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
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input 
                type="email" 
                value={profileForm.email || ''} 
                onChange={(e) => handleFormChange('email', e.target.value)}
                disabled={!isEditing} 
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} 
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
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth</label>
              <input 
                type="date" 
                value={profileForm.dateOfBirth ? new Date(profileForm.dateOfBirth).toISOString().split('T')[0] : ''} 
                onChange={(e) => handleFormChange('dateOfBirth', e.target.value)}
                disabled={!isEditing} 
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} 
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
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} 
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
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} 
              />
            </div>
          </div>
        </div>

        {/* Administrative Information */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Administrative Information</h4>
          <div className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Access Level</label>
              <select 
                value={profileForm.accessLevel || ''} 
                onChange={(e) => handleFormChange('accessLevel', e.target.value)}
                disabled={!isEditing} 
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`}
              >
                <option value="">Select Access Level</option>
                <option value="Super Administrator">Super Administrator</option>
                <option value="System Administrator">System Administrator</option>
                <option value="Platform Administrator">Platform Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Institution</label>
              <input 
                type="text" 
                value={profileForm.institution || ''} 
                onChange={(e) => handleFormChange('institution', e.target.value)}
                placeholder="Addis Ababa University" 
                disabled={!isEditing} 
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
              <textarea 
                rows="3" 
                value={profileForm.bio || ''} 
                onChange={(e) => handleFormChange('bio', e.target.value)}
                placeholder="System administrator with full platform access..." 
                disabled={!isEditing} 
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`}
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
                    className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white" 
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
                        : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
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
                        : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
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
                <p className="text-lg font-semibold text-green-600">Maximum</p>
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

  const renderContacts = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Contact Messages</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <MessageSquare className="h-4 w-4" />
          <span>{contacts.filter(c => c.status === 'pending').length} pending messages</span>
        </div>
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {contacts.map((contact) => (
                <tr key={contact._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{contact.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{contact.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">{contact.subject}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      contact.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                      contact.status === 'seen' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                      contact.status === 'replied' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                    }`}>
                      {contact.status === 'pending' ? 'Pending' : contact.status === 'seen' ? 'Seen' : contact.status === 'replied' ? 'Replied' : contact.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={async () => {
                          setSelectedContact(contact);
                          setShowContactDetail(true);
                          if (contact.status === 'pending') {
                            try {
                              await contactAPI.markSeen(contact._id);
                              setContacts(prev => prev.map(c => c._id === contact._id ? { ...c, status: 'seen' } : c));
                            } catch {}
                          }
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {contact.status !== 'replied' && (
                        <button 
                          onClick={() => { setSelectedContact(contact); setShowReplyModal(true); }}
                          className="text-green-600 hover:text-green-800 p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                          title="Reply"
                        >
                          <Reply className="h-4 w-4" />
                        </button>
                      )}
                      {contact.status === 'replied' && (
                        <button 
                          onClick={() => { setSelectedContact(contact); setShowReplyModal(true); }}
                          className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Reply again"
                        >
                          <Reply className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden">
        {contacts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Messages Found</h3>
            <p className="text-gray-500 dark:text-gray-400">No contact messages received yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div key={contact._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
                {/* Contact Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                      {contact.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {contact.email}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      contact.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                      contact.status === 'seen' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                      contact.status === 'replied' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                    }`}>
                      {contact.status === 'pending' ? 'Pending' : contact.status === 'seen' ? 'Seen' : contact.status === 'replied' ? 'Replied' : contact.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(contact.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Subject */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Subject</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{contact.subject}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedContact(contact);
                      setShowContactDetail(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-2 px-3 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                  <button
                    onClick={() => {
                      setSelectedContact(contact);
                      setShowReplyModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 py-2 px-3 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm font-medium"
                  >
                    <Reply className="h-4 w-4" />
                    Reply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Detail Modal */}
      {showContactDetail && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Contact Message Details</h3>
                <button
                  onClick={() => setShowContactDetail(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{selectedContact.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{selectedContact.email}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{selectedContact.subject}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
                
                {selectedContact.replies && selectedContact.replies.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Replies ({selectedContact.replies.length})</label>
                    <div className="space-y-3">
                      {selectedContact.replies.map((reply, index) => (
                        <div key={index} className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{reply.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Reply #{index + 1} • {new Date(reply.repliedAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Reply to {selectedContact.name}</h3>
                <button
                  onClick={() => { setShowReplyModal(false); setReplyMessage(''); setSelectedContact(null); }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Original Message</label>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm">{selectedContact.message}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Reply</label>
                  <textarea
                    rows="6"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Type your reply here..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleReplyContact}
                  disabled={loading || !replyMessage.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Reply className="h-4 w-4" />
                  )}
                  {loading ? 'Sending...' : 'Send Reply'}
                </button>
                <button
                  onClick={() => { setShowReplyModal(false); setReplyMessage(''); setSelectedContact(null); }}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Review Management</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Star className="h-4 w-4" />
          <span>{reviews.filter(r => r.status === 'pending').length} pending reviews</span>
        </div>
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {reviews.map((review) => (
                <tr key={review._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mr-3 overflow-hidden flex-shrink-0">
                        {review.user?.profileImage ? (
                          <img src={review.user.profileImage} alt={review.user.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{review.user?.name || 'Unknown User'}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{review.user?.role || 'user'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{review.rating}/5</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs">
                      {review.message.length > 20 ? `${review.message.substring(0, 20)}...` : review.message}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      review.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                      review.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    }`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => {
                          setSelectedReview(review);
                          setShowReviewDetail(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {review.status !== 'approved' && (
                        <button 
                          onClick={() => handleReviewAction(review._id, 'approved')}
                          className="text-green-600 hover:text-green-800 p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                          title="Approve"
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                      )}
                      {review.status !== 'rejected' && (
                        <button 
                          onClick={() => handleReviewAction(review._id, 'rejected')}
                          className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Reject"
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleReviewAction(review._id, 'delete')}
                        className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
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
      <div className="lg:hidden">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Reviews Found</h3>
            <p className="text-gray-500 dark:text-gray-400">No reviews submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
                {/* Review Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {review.user?.profileImage ? (
                      <img src={review.user.profileImage} alt={review.user.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                      {review.user?.name || 'Unknown User'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-2">
                      {review.user?.role || 'user'}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      review.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                      review.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    }`}>
                      {review.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-3">
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">{review.rating}/5</span>
                  </div>
                </div>

                {/* Message Preview */}
                <div className="mb-4">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {review.message.length > 60 ? `${review.message.substring(0, 60)}...` : review.message}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedReview(review);
                      setShowReviewDetail(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-2 px-3 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                  {review.status !== 'approved' && (
                    <button
                      onClick={() => handleReviewAction(review._id, 'approved')}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 py-2 px-3 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm font-medium"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Approve
                    </button>
                  )}
                  {review.status !== 'rejected' && (
                    <button
                      onClick={() => handleReviewAction(review._id, 'rejected')}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-2 px-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => handleReviewAction(review._id, 'delete')}
                    className="flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-2 px-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      {showReviewDetail && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Review Details</h3>
                <button
                  onClick={() => setShowReviewDetail(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mr-4 overflow-hidden">
                    {selectedReview.user?.profileImage ? (
                      <img src={selectedReview.user.profileImage} alt={selectedReview.user.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                        {selectedReview.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedReview.user?.name || 'Unknown User'}</h4>
                    <p className="text-gray-600 dark:text-gray-400 capitalize">{selectedReview.user?.role || 'user'}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 ${
                          star <= selectedReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedReview.rating} out of 5 stars</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Review Message</label>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-4 rounded-lg break-words">{selectedReview.message}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      selectedReview.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                      selectedReview.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    }`}>
                      {selectedReview.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Submitted</label>
                    <p className="text-gray-900 dark:text-white">{new Date(selectedReview.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {selectedReview.reviewedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reviewed</label>
                    <p className="text-gray-900 dark:text-white">{new Date(selectedReview.reviewedAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
              
              {selectedReview.status !== 'approved' && selectedReview.status !== 'rejected' ? (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      handleReviewAction(selectedReview._id, 'approved');
                      setShowReviewDetail(false);
                    }}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleReviewAction(selectedReview._id, 'rejected');
                      setShowReviewDetail(false);
                    }}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 mt-6">
                  {selectedReview.status === 'approved' && (
                    <button
                      onClick={() => {
                        handleReviewAction(selectedReview._id, 'rejected');
                        setShowReviewDetail(false);
                      }}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      Reject
                    </button>
                  )}
                  {selectedReview.status === 'rejected' && (
                    <button
                      onClick={() => {
                        handleReviewAction(selectedReview._id, 'approved');
                        setShowReviewDetail(false);
                      }}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Approve
                    </button>
                  )}
                </div>
              )}
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
      case 'categories': return renderCategories();
      case 'schedules': return renderSchedules();
      case 'contacts': return renderContacts();
      case 'reviews': return renderReviews();
      case 'subscriptions': return <SubscriptionManagement showNewsletterForm={showNewsletterForm} setShowNewsletterForm={setShowNewsletterForm} />;
      case 'notifications': return renderSendNotification();
      case 'reels': return renderReels();
      case 'admins': return renderAdmins();
      case 'users': return renderUsers();
      case 'settings': return renderSettings();
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
        <div className="flex items-center justify-between h-16 lg:h-20 px-4 lg:px-6 bg-gradient-to-r from-purple-600 to-indigo-600 border-b border-purple-500 flex-shrink-0">
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
                <span className="text-white font-bold text-sm lg:text-lg">{user ? getInitials(user.name) : 'SA'}</span>
              )}
            </div>
            <div className="min-w-0 flex-1 text-center">
              <h1 className="text-sm lg:text-lg font-bold truncate text-white">{user ? user.name : 'Super Admin'}</h1>
              <p className="text-purple-50 text-xs lg:text-sm flex items-center justify-center">
                {user?.role === 'superadmin' ? (
                  <Crown className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                ) : (
                  <Shield className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                )}
                <span className="truncate">{user ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Super Admin'}</span>
              </p>
              {user?.bio && (
                <p className="text-purple-50/90 text-xs mt-1 truncate italic">
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
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all duration-200 group ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
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

export default SuperAdminDashboard;