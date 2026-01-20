import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: function (status) {
    // Don't throw errors for schedule endpoints
    return status < 600;
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors silently for schedules and chat
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.config?.url?.includes('/schedules') || error.config?.url?.includes('/messages/file')) {
      return { data: { success: true, schedules: [] } };
    }
    return Promise.reject(error);
  }
);

// Profile API functions
export const profileAPI = {
  // Get user profile
  getProfile: () => api.get('/profile/me'),
  
  // Update profile
  updateProfile: (profileData) => api.put('/profile/update', profileData),
  
  // Upload profile image
  uploadImage: (imageFile) => {
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    return api.post('/profile/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Remove profile image
  removeImage: () => api.delete('/profile/remove-image'),
  
  // Change password
  changePassword: (passwordData) => api.put('/profile/change-password', passwordData),
};

// Course API functions
export const courseAPI = {
  // Get all courses
  getCourses: (params = {}) => api.get('/courses', { params }),
  
  // Get featured courses (top 3)
  getFeaturedCourses: () => api.get('/courses/featured'),
  
  // Get instructor's assigned courses
  getInstructorCourses: () => api.get('/courses/instructor/courses'),
  
  // Get instructors
  getInstructors: () => api.get('/courses/instructors'),
  
  // Create course
  createCourse: (courseData) => {
    const formData = new FormData();
    Object.keys(courseData).forEach(key => {
      if (courseData[key] !== null && courseData[key] !== undefined) {
        formData.append(key, courseData[key]);
      }
    });
    return api.post('/courses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Get single course
  getCourse: (id) => api.get(`/courses/${id}`),
  
  // Update course
  updateCourse: (id, courseData) => {
    const formData = new FormData();
    Object.keys(courseData).forEach(key => {
      if (courseData[key] !== null && courseData[key] !== undefined) {
        formData.append(key, courseData[key]);
      }
    });
    return api.put(`/courses/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Delete course
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  
  // Star/Unstar course
  starCourse: (id) => api.post(`/courses/${id}/star`),
};

// Category API functions
export const categoryAPI = {
  // Get all categories
  getCategories: () => api.get('/categories'),
  
  // Create category
  createCategory: (categoryData) => api.post('/categories', categoryData),
  
  // Update category
  updateCategory: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  
  // Delete category
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

// Stats API functions
export const statsAPI = {
  // Get platform statistics
  getStats: () => api.get('/stats'),
  
  // Get gender distribution statistics
  getGenderDistribution: () => api.get('/stats/gender-distribution'),
};

// Contact API functions
export const contactAPI = {
  // Submit contact form
  submitContact: (contactData) => api.post('/contact', contactData),
  
  // Get all contacts (SuperAdmin)
  getContacts: () => api.get('/contact'),
  
  // Reply to contact
  replyContact: (id, replyData) => api.post(`/contact/${id}/reply`, replyData),
};

// Review API functions
export const reviewAPI = {
  // Submit review
  submitReview: (reviewData) => api.post('/reviews', reviewData),
  
  // Get user's own review
  getMyReview: () => api.get('/reviews/my-review'),
  
  // Delete user's own review
  deleteMyReview: () => api.delete('/reviews/my-review'),
  
  // Get all reviews (SuperAdmin)
  getAllReviews: () => api.get('/reviews'),
  
  // Get approved reviews for public display
  getApprovedReviews: () => api.get('/reviews/approved'),
  
  // Update review status (SuperAdmin)
  updateReviewStatus: (reviewId, status) => api.patch(`/reviews/${reviewId}/status`, { status }),
  
  // Delete review (SuperAdmin)
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

// Payment API functions
export const paymentAPI = {
  // Initialize payment
  initializePayment: (paymentData) => api.post('/payments/initialize', paymentData),
  
  // Initialize bulk payment
  initializeBulkPayment: (paymentData) => api.post('/payments/initialize-bulk', paymentData),
  
  // Verify payment
  verifyPayment: (txRef) => api.post(`/payments/verify/${txRef}`),
  
  // Get payment receipt
  getReceipt: (paymentId) => api.get(`/payments/receipt/${paymentId}`),
  
  // Get all payments (Admin only)
  getPayments: (params = {}) => api.get('/payments', { params }),
  
  // Get public receipt (no auth required)
  getPublicReceipt: (txRef) => axios.get(`${API_BASE_URL}/payments/public-receipt/${txRef}`),
  
  // Get user payments
  getMyPayments: () => api.get('/payments/my-payments'),
};

// Enrollment API functions
export const enrollmentAPI = {
  // Get user's enrolled courses
  getMyCourses: () => api.get('/enrollments/my-courses'),
  
  // Get user enrollments
  getMyEnrollments: () => api.get('/enrollments/my-enrollments'),
  
  // Check enrollment status
  checkEnrollment: (courseId) => api.get(`/enrollments/check/${courseId}`),
};

// Users API functions
export const instructorAPI = {
  getStudents: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/instructors/students${queryString ? `?${queryString}` : ''}`);
  }
};

export const usersAPI = {
  // Get all users with filtering
  getUsers: (params = {}) => api.get('/users', { params }),
  
  // Get user details
  getUserDetails: (id) => api.get(`/users/${id}`),
  
  // Delete user
  deleteUser: (id) => api.delete(`/users/${id}`),
  
  // Create admin user
  createAdmin: (adminData) => api.post('/users/create-admin', adminData),
  
  // Update admin user
  updateAdmin: (id, adminData) => api.post(`/users/create-admin`, { ...adminData, userId: id }),
  
  // Update admin permissions and role
  updatePermissions: (id, permissions, role) => api.put(`/users/${id}/permissions`, { permissions, role }),
};

// Subscription API functions
export const subscriptionAPI = {
  // Subscribe to newsletter
  subscribe: (email) => api.post('/subscriptions/subscribe', { email }),
  
  // Unsubscribe from newsletter
  unsubscribe: (email) => api.post('/subscriptions/unsubscribe', { email }),
  
  // Get subscription status
  getStatus: () => api.get('/subscriptions/status'),
  
  // Get all subscriptions (Admin only)
  getAllSubscriptions: () => api.get('/subscriptions/admin/all'),
  
  // Send newsletter
  sendNewsletter: (data) => api.post('/subscriptions/newsletter', data),
};

// Comment API functions
export const commentAPI = {
  // Get comments for a course
  getCourseComments: (courseId, params = {}) => api.get(`/comments/course/${courseId}`, { params }),
  
  // Add a comment
  addComment: (commentData) => api.post('/comments', commentData),
  
  // Like/unlike a comment
  likeComment: (commentId) => api.post(`/comments/${commentId}/like`),
  
  // Delete a comment
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
};

// Notification API functions
export const notificationAPI = {
  // Send notification (Admin/SuperAdmin only)
  sendNotification: (notificationData) => api.post('/notifications/send', notificationData),
  
  // Get user's notifications
  getMyNotifications: (params = {}) => api.get('/notifications/my-notifications', { params }),
  
  // Mark notification as read
  markAsRead: (notificationId) => api.patch(`/notifications/${notificationId}/read`),
  
  // Mark all notifications as read
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  
  // Delete notification
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
};

// Chat History API functions
export const chatHistoryAPI = {
  // Get all chat sessions
  getChatSessions: () => api.get('/chat-history'),
  
  // Get specific chat session
  getChatSession: (sessionId) => api.get(`/chat-history/${sessionId}`),
  
  // Create new chat session
  createChatSession: (sessionData) => api.post('/chat-history', sessionData),
  
  // Add message to chat session
  addMessage: (sessionId, message) => api.post(`/chat-history/${sessionId}/messages`, { message }),
  
  // Update chat session title
  updateTitle: (sessionId, title) => api.put(`/chat-history/${sessionId}/title`, { title }),
  
  // Delete specific chat session
  deleteChatSession: (sessionId) => api.delete(`/chat-history/${sessionId}`),
  
  // Delete all chat sessions
  deleteAllSessions: () => api.delete('/chat-history'),
};

// Schedule API functions
export const scheduleAPI = {
  // Get all schedules
  getSchedules: async (params = {}) => {
    const response = await api.get('/schedules', { params });
    if (response.status !== 200) {
      return { data: { success: true, schedules: [] } };
    }
    return response;
  },
  
  // Get schedule by ID
  getSchedule: (id) => api.get(`/schedules/${id}`),
  
  // Create schedule
  createSchedule: async (scheduleData) => {
    try {
      return await api.post('/schedules', scheduleData);
    } catch (error) {
      throw error;
    }
  },
  
  // Update schedule
  updateSchedule: async (id, scheduleData) => {
    try {
      return await api.put(`/schedules/${id}`, scheduleData);
    } catch (error) {
      throw error;
    }
  },
  
  // Delete schedule
  deleteSchedule: async (id) => {
    try {
      return await api.delete(`/schedules/${id}`);
    } catch (error) {
      throw error;
    }
  },
  
  // Delete all schedules for a course
  deleteCourseSchedules: (courseId) => api.delete(`/schedules/course/${courseId}`),
  
  // Add session link
  addSessionLink: (scheduleId, sessionData) => api.put(`/schedules/${scheduleId}/session-link`, sessionData),
  
  // Remove session link
  removeSessionLink: (scheduleId, sessionData) => api.delete(`/schedules/${scheduleId}/session-link`, { data: sessionData }),
};

// Schedule Update Request API functions
export const scheduleUpdateRequestAPI = {
  // Create update request
  createRequest: (requestData) => api.post('/schedule-update-requests', requestData),
  
  // Get all requests (Admin)
  getRequests: () => api.get('/schedule-update-requests'),
  
  // Get instructor's own requests
  getMyRequests: () => api.get('/schedule-update-requests/my-requests'),
  
  // Approve request
  approveRequest: (id) => api.put(`/schedule-update-requests/${id}/approve`),
  
  // Reject request
  rejectRequest: (id, reason) => api.put(`/schedule-update-requests/${id}/reject`, { reason }),
  
  // Dismiss request
  dismissRequest: (id) => api.put(`/schedule-update-requests/${id}/dismiss`),
};

// Material API functions
export const materialAPI = {
  // Get materials for a course
  getCourseMaterials: (courseId) => api.get(`/materials/course/${courseId}`),
  
  // Get materials for student's enrolled courses
  getStudentMaterials: () => api.get('/materials/student/courses'),
  
  // Download material
  downloadMaterial: (materialId) => api.get(`/materials/download/${materialId}`),
  
  // Upload material
  uploadMaterial: (materialData) => {
    const formData = new FormData();
    Object.keys(materialData).forEach(key => {
      if (materialData[key] !== null && materialData[key] !== undefined) {
        formData.append(key, materialData[key]);
      }
    });
    return api.post('/materials/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Update material
  updateMaterial: (id, materialData) => api.put(`/materials/${id}`, materialData),
  
  // Delete material
  deleteMaterial: (id) => api.delete(`/materials/${id}`),
};

// Chat API functions
export const chatAPI = {
  // Get all chats for current user
  getChats: () => api.get('/chat'),
  
  // Get unread message count
  getUnreadCount: () => api.get('/chat/unread-count'),
  
  // Get or create chat with specific user
  startChat: (participantId) => api.post('/chat/start', { participantId }),
  
  // Send message
  sendMessage: (chatId, content) => api.post(`/chat/${chatId}/messages`, { content }),
  
  // Update message
  updateMessage: (messageId, content) => api.put(`/chat/messages/${messageId}`, { content }),
  
  // Delete message
  deleteMessage: (messageId) => api.delete(`/chat/messages/${messageId}`),
  
  // Delete entire chat
  deleteChat: (chatId) => api.delete(`/chat/${chatId}`),
  
  // Mark messages as read
  markAsRead: (chatId) => api.put(`/chat/${chatId}/read`),
  
  // Get chat messages
  getMessages: (chatId) => api.get(`/chat/${chatId}/messages`),
  
  // Get users to start chat with
  getUsers: () => api.get('/chat/users'),
};

// Reel API functions
export const reelAPI = {
  // Get all reels
  getReels: () => api.get('/reels'),
  
  // Get single reel
  getReel: (id) => api.get(`/reels/${id}`),
  
  // Upload reel
  uploadReel: (reelData) => {
    const formData = new FormData();
    Object.keys(reelData).forEach(key => {
      if (reelData[key] !== null && reelData[key] !== undefined) {
        formData.append(key, reelData[key]);
      }
    });
    return api.post('/reels/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Update reel
  updateReel: (id, reelData) => api.put(`/reels/${id}`, reelData),
  
  // Delete reel
  deleteReel: (id) => api.delete(`/reels/${id}`),
  
  // Like/unlike reel
  likeReel: (id) => api.post(`/reels/${id}/like`),
  
  // Get comments
  getComments: (id) => api.get(`/reels/${id}/comments`),
  
  // Add comment
  addComment: (id, comment, parentCommentId = null) => api.post(`/reels/${id}/comments`, { comment, parentCommentId }),
  
  // Delete comment
  deleteComment: (commentId) => api.delete(`/reels/comments/${commentId}`),
  
  // Increment view count
  incrementView: (id, viewData = {}) => api.post(`/reels/${id}/view`, viewData),
};

// Assignment API functions
export const assignmentAPI = {
  // Get assignments for instructor
  getInstructorAssignments: (params = {}) => api.get('/assignments/instructor', { params }),
  
  // Get assignments for student
  getStudentAssignments: () => api.get('/assignments/student'),
  
  // Create assignment
  createAssignment: (assignmentData) => {
    const formData = new FormData();
    Object.keys(assignmentData).forEach(key => {
      if (assignmentData[key] !== null && assignmentData[key] !== undefined) {
        formData.append(key, assignmentData[key]);
      }
    });
    return api.post('/assignments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Send assignment to students
  sendAssignment: (id) => api.post(`/assignments/${id}/send`),
  
  // Update assignment
  updateAssignment: (id, assignmentData) => {
    const formData = new FormData();
    Object.keys(assignmentData).forEach(key => {
      if (assignmentData[key] !== null && assignmentData[key] !== undefined) {
        formData.append(key, assignmentData[key]);
      }
    });
    return api.put(`/assignments/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Delete assignment
  deleteAssignment: (id) => api.delete(`/assignments/${id}`),
  
  // Submit assignment (student)
  submitAssignment: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/assignments/${id}/submit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Grade assignment submission (instructor)
  gradeSubmission: (assignmentId, submissionId, gradeData) => 
    api.put(`/assignments/${assignmentId}/grade/${submissionId}`, gradeData),
};

export default api;