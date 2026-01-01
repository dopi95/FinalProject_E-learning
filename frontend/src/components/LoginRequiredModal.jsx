import React from 'react';
import { X, User, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LoginRequiredModal = ({ isVisible, onClose, onLogin, onRegister, message, actionType = 'subscribe' }) => {
  const { t } = useTranslation();
  
  if (!isVisible) return null;

  // Determine button text based on action type
  const getLoginButtonText = () => {
    switch (actionType) {
      case 'enroll':
        return t('loginModal.loginToEnroll');
      case 'like':
        return t('loginModal.loginToLike');
      default:
        return t('loginModal.loginToSubscribe');
    }
  };

  const handleLogin = () => {
    onClose();
    if (onLogin) {
      onLogin();
    } else {
      window.location.href = '/login';
    }
  };

  const handleRegister = () => {
    onClose();
    if (onRegister) {
      onRegister();
    } else {
      window.location.href = '/register';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('loginModal.title')}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {message || t('loginModal.message')}
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              <User className="h-4 w-4" />
              {getLoginButtonText()}
            </button>
            <button
              onClick={handleRegister}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              <UserPlus className="h-4 w-4" />
              {t('loginModal.createAccount')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;