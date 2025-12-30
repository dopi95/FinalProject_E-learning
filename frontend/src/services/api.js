import axios from 'axios';

const API_BASE_URL = 'http://localhost:9000/api';

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

export default api;