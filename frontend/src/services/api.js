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

export default api;