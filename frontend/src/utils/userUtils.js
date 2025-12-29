// Utility functions for user data management

export const saveUserData = (userData, rememberMe = false) => {
  const userDataString = JSON.stringify(userData);
  
  if (rememberMe) {
    localStorage.setItem('user', userDataString);
    // Clear sessionStorage if using localStorage
    sessionStorage.removeItem('user');
  } else {
    sessionStorage.setItem('user', userDataString);
    // Also update localStorage if it exists (for remember me users)
    if (localStorage.getItem('user')) {
      localStorage.setItem('user', userDataString);
    }
  }
};

export const getUserData = () => {
  const localData = localStorage.getItem('user');
  const sessionData = sessionStorage.getItem('user');
  
  // Prefer localStorage data if available (remember me users)
  const userData = localData || sessionData;
  
  return userData ? JSON.parse(userData) : null;
};

export const updateUserData = (updatedFields) => {
  const currentUser = getUserData();
  if (!currentUser) return null;
  
  const updatedUser = { ...currentUser, ...updatedFields };
  
  // Update both storages if they exist
  if (localStorage.getItem('user')) {
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }
  if (sessionStorage.getItem('user')) {
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
  }
  
  return updatedUser;
};

export const clearUserData = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('token');
};