import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
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

export default api;