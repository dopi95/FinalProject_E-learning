import React, { useState, useEffect } from 'react';
import { Crown, Users, Shield, Settings, LogOut, Database, Activity, AlertTriangle, Server, Globe, Lock, Home, User, Camera, X, CheckCircle, Eye, EyeOff, BookOpen, Plus, Edit, Trash2, Search, Filter, Star, Mail, MessageSquare, Reply, ThumbsUp, ThumbsDown } from 'lucide-react';
import { profileAPI, courseAPI, categoryAPI, contactAPI, reviewAPI, usersAPI, paymentAPI } from '../services/api';
import PopupNotification from '../components/PopupNotification';
import SubscriptionManagement from '../components/SubscriptionManagement';
import { getUserData, updateUserData, clearUserData } from '../utils/userUtils';

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
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    about: '',
    price: '',
    category: '',
    instructor: '',
    image: null
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
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [userEnrollments, setUserEnrollments] = useState([]);
  const [userPayments, setUserPayments] = useState([]);
  const [userCourses, setUserCourses] = useState([]);

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
    fetchInstructors();
    fetchCourses();
    fetchCategories();
    fetchContacts();
    fetchReviews();
    fetchUsers();
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
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      showNotification('error', 'Error', 'Failed to fetch courses');
    }
  };

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
      setCourseForm({ title: '', description: '', about: '', price: '', category: '', instructor: '', image: null });
      setShowAddCourse(false);
      showNotification('success', 'Course Added!', 'Course has been successfully created');
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
      image: null
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
      setCourseForm({ title: '', description: '', about: '', price: '', category: '', instructor: '', image: null });
      setShowEditCourse(false);
      setEditingCourse(null);
      showNotification('success', 'Course Updated!', 'Course has been successfully updated');
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
      
      const response = await usersAPI.getUsers(params);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('error', 'Error', 'Failed to fetch users');
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
    } catch (error) {
      showNotification('error', 'Error', error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleViewUserReceipt = async (paymentId) => {
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

  const handleDownloadUserReceipt = async (paymentId) => {
    try {
      const response = await paymentAPI.getReceipt(paymentId);
      const payment = response.data.data;
      
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
  }, [userSearchTerm, selectedRole, selectedCourseFilter]);

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
    { id: 'overview', name: 'System Overview', icon: Crown },
    { id: 'users', name: 'All Users', icon: Users },
    { id: 'courses', name: 'Course Management', icon: BookOpen },
    { id: 'contacts', name: 'Contact Messages', icon: MessageSquare },
    { id: 'reviews', name: 'Review Management', icon: Star },
    { id: 'subscriptions', name: 'Email Subscriptions', icon: Mail },
    { id: 'admins', name: 'Admin Management', icon: Shield },
    { id: 'settings', name: 'Global Settings', icon: Settings },
    { id: 'profile', name: 'My Profile', icon: User }
  ];

  const renderOverview = () => (
    <div className="space-y-4 lg:space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center mb-6">
        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl mr-4">
          <Crown className="h-8 w-8 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Super Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back{user ? `, ${user.name}` : ''}, manage the entire platform</p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Users</p>
              <p className="text-2xl lg:text-3xl font-bold mt-2 text-gray-900 dark:text-white">2,847</p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">All platform users</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
              <Users className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Admins</p>
              <p className="text-2xl lg:text-3xl font-bold mt-2 text-gray-900 dark:text-white">12</p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">System administrators</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl">
              <Shield className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">System Uptime</p>
              <p className="text-2xl lg:text-3xl font-bold mt-2 text-gray-900 dark:text-white">99.9%</p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Server availability</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
              <Server className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Sessions</p>
              <p className="text-2xl lg:text-3xl font-bold mt-2 text-gray-900 dark:text-white">1,234</p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Current users online</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl">
              <Activity className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 lg:p-6">
        <div className="flex items-center mb-4 lg:mb-6">
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mr-3">
            <Activity className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
          </div>
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">System Health</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center p-3 lg:p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-l-4 border-green-500">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">API Server</h4>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">Response time: 45ms</p>
            </div>
            <span className="px-2 lg:px-3 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
              Healthy
            </span>
          </div>
          
          <div className="flex items-center p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-l-4 border-blue-500">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Database</h4>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">Connections: 8/20</p>
            </div>
            <span className="px-2 lg:px-3 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
              Connected
            </span>
          </div>

          <div className="flex items-center p-3 lg:p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-l-4 border-purple-500">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">File Storage</h4>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">Usage: 2.3GB/10GB</p>
            </div>
            <span className="px-2 lg:px-3 py-1 bg-purple-500 text-white text-xs rounded-full font-medium">
              Available
            </span>
          </div>

          <div className="flex items-center p-3 lg:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border-l-4 border-yellow-500">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Email Service</h4>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">Queue: 23 pending</p>
            </div>
            <span className="px-2 lg:px-3 py-1 bg-yellow-500 text-white text-xs rounded-full font-medium">
              Warning
            </span>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <button 
            onClick={() => setActiveTab('admins')}
            className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-200 group border border-purple-200 dark:border-purple-700"
          >
            <Shield className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">Manage Admins</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('users')}
            className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-200 group border border-blue-200 dark:border-blue-700"
          >
            <Users className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">All Users</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('system')}
            className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-200 group border border-green-200 dark:border-green-700"
          >
            <Server className="h-6 w-6 lg:h-8 lg:w-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">System Control</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('security')}
            className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 transition-all duration-200 group border border-red-200 dark:border-red-700"
          >
            <Lock className="h-6 w-6 lg:h-8 lg:w-8 text-red-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">Security Center</span>
          </button>
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
          <div className="flex items-center p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-l-4 border-blue-500">
            <Shield className="h-5 w-5 text-blue-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">New admin created</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Admin John Doe was granted access • 2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 lg:p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border-l-4 border-red-500">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Security alert</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Multiple failed login attempts detected • 4 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 lg:p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-l-4 border-green-500">
            <Database className="h-5 w-5 text-green-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Database backup completed</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Automated backup successful • 6 hours ago</p>
            </div>
          </div>
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
            </div>
          </div>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Instructor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stars</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {courses.map((course) => (
                <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img className="h-12 w-12 rounded-lg object-cover mr-4 flex-shrink-0" src={course.image} alt={course.title} />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{course.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{course.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">{course.instructor?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{course.instructor?.email || 'No email'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{course.price} Birr</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-900 dark:text-white">{course.stars?.length || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900 dark:text-white">{course.studentCount || 0}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => {
                          setSelectedCourse(course);
                          setShowCourseDetail(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditCourse(course)}
                        className="text-green-600 hover:text-green-800 p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        title="Edit Course"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCourse(course._id)}
                        className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete Course"
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
                    <img 
                      className="h-16 w-16 rounded-xl object-cover flex-shrink-0" 
                      src={course.image} 
                      alt={course.title} 
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 capitalize">
                        {course.category}
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
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs font-medium text-gray-900 dark:text-white">{course.stars?.length || 0}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Stars</p>
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
                    setCourseForm({ title: '', description: '', about: '', price: '', category: '', instructor: '', image: null });
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
                    setCourseForm({ title: '', description: '', about: '', price: '', category: '', instructor: '', image: null });
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Course Details</h3>
                <button
                  onClick={() => setShowCourseDetail(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <img className="h-20 w-20 rounded-lg object-cover mr-4" src={selectedCourse.image} alt={selectedCourse.title} />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedCourse.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedCourse.description}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">About This Course</label>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{selectedCourse.about}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price</label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{selectedCourse.price} Birr</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg capitalize">{selectedCourse.category}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instructor</label>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{selectedCourse.instructor?.name || 'Unknown Instructor'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Students Enrolled</label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{selectedCourse.studentCount || 0}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Created Date</label>
                    <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{new Date(selectedCourse.createdAt).toLocaleDateString()}</p>
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Category Management</h2>
        <button 
          onClick={() => setShowAddCategory(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {categories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{category.slug}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{category.description || 'No description'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditCategory(category)}
                        className="text-green-600 hover:text-green-800 p-1 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(category._id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded"
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
  const renderAdmins = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Management</h2>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
          Create Admin
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[1, 2, 3, 4, 5].map((admin) => (
            <div key={admin} className="p-6 flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-full mr-4 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Admin {admin}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">admin{admin}@aau.edu</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last active: 2 hours ago</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800">Edit</button>
                <button className="text-red-600 hover:text-red-800">Revoke</button>
                <button className="text-green-600 hover:text-green-800">Permissions</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">All Users Management</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Users className="h-4 w-4" />
          <span>{users.length} users found</span>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow text-center">
          <p className="text-lg lg:text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'student').length}</p>
          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Students</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow text-center">
          <p className="text-lg lg:text-2xl font-bold text-green-600">{users.filter(u => u.role === 'instructor').length}</p>
          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Instructors</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow text-center">
          <p className="text-lg lg:text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'admin').length}</p>
          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Admins</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow text-center">
          <p className="text-lg lg:text-2xl font-bold text-orange-600">{users.filter(u => u.role === 'superadmin').length}</p>
          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Super Admins</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
            />
          </div>
          <select 
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="instructor">Instructors</option>
            <option value="admin">Admins</option>
            <option value="superadmin">Super Admins</option>
          </select>
          {(selectedRole === 'student' || selectedRole === 'instructor') && (
            <select 
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
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
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('pdf')}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                PDF
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {usersLoading ? (
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mr-3 overflow-hidden flex-shrink-0">
                            {user.profileImage ? (
                              <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'superadmin' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' :
                          user.role === 'instructor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                          'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {user.systemId || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isVerified ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                        }`}>
                          {user.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewUser(user._id)}
                            className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {user.role !== 'superadmin' && (
                            <button 
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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

          {/* Mobile Card View */}
          <div className="lg:hidden">
            {users.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Users Found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
                    {/* User Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                          {user.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {user.email}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'superadmin' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' :
                            user.role === 'instructor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          }`}>
                            {user.role}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.isVerified ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                          }`}>
                            {user.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* User ID */}
                    {user.systemId && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {user.role === 'student' ? 'Student ID' : 
                           user.role === 'instructor' ? 'Instructor ID' : 'System ID'}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.systemId}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewUser(user._id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-2 px-3 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                      {user.role !== 'superadmin' && (
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-2 px-3 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
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
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{payment.course?.title}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Receipt: {payment.receiptNumber}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(payment.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900 dark:text-white">{payment.amount} Birr</p>
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded capitalize">{payment.paymentMethod}</span>
                                  <div className="mt-2 flex gap-1">
                                    <button
                                      onClick={() => handleViewUserReceipt(payment._id)}
                                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                                    >
                                      View
                                    </button>
                                    <button
                                      onClick={() => handleDownloadUserReceipt(payment._id)}
                                      className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                                    >
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
      <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Global Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Platform Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform Name</label>
              <input type="text" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700" defaultValue="AAU E-Learning Platform" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">System Email</label>
              <input type="email" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700" defaultValue="system@aau.edu" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Upload Size (MB)</label>
              <input type="number" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700" defaultValue="500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold mb-4 text-gray-900 dark:text-white">System Maintenance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Maintenance Mode</span>
              <button className="bg-red-600 text-white px-3 py-1 rounded text-sm">Disabled</button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Auto Backup</span>
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">Enabled</button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Debug Mode</span>
              <button className="bg-yellow-600 text-white px-3 py-1 rounded text-sm">Development</button>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {user?.role === 'student' ? 'Student ID' : 
                 user?.role === 'instructor' ? 'Instructor ID' : 'System ID'}
              </label>
              <input 
                type="text" 
                value={profileForm.systemId || ''} 
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 cursor-not-allowed dark:text-white" 
              />
            </div>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
              <input 
                type="text" 
                value={profileForm.department || ''} 
                onChange={(e) => handleFormChange('department', e.target.value)}
                placeholder="IT Administration" 
                disabled={!isEditing} 
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} 
              />
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Experience</label>
              <select 
                value={profileForm.experience || ''} 
                onChange={(e) => handleFormChange('experience', e.target.value)}
                disabled={!isEditing} 
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`}
              >
                <option value="">Select Experience</option>
                <option value="0-2 years">0-2 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="6-10 years">6-10 years</option>
                <option value="10+ years">10+ years</option>
              </select>
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
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      contact.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                      contact.status === 'replied' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                    }`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedContact(contact);
                          setShowContactDetail(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {contact.status === 'pending' && (
                        <button 
                          onClick={() => {
                            setSelectedContact(contact);
                            setShowReplyModal(true);
                          }}
                          className="text-green-600 hover:text-green-800 p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                          title="Reply"
                        >
                          <Reply className="h-4 w-4" />
                        </button>
                      )}
                      {contact.status === 'replied' && (
                        <button 
                          onClick={() => {
                            setSelectedContact(contact);
                            setShowReplyModal(true);
                          }}
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
                      contact.status === 'replied' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                    }`}>
                      {contact.status}
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
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyMessage('');
                  }}
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
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyMessage('');
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
      case 'contacts': return renderContacts();
      case 'reviews': return renderReviews();
      case 'subscriptions': return <SubscriptionManagement />;
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
            onClick={() => setActiveTab('profile')}
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
                <Crown className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
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