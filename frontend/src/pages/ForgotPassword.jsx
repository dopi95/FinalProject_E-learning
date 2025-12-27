import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader } from 'lucide-react';
import axios from 'axios';
import Notification from '../components/Notification';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [notification, setNotification] = useState({
    isVisible: false,
    type: 'success',
    title: '',
    message: ''
  });

  const showNotification = (type, title, message) => {
    setNotification({ isVisible: true, type, title, message });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        email
      });

      showNotification('success', '', t('forgotPassword.codeSent'));
      
      setTimeout(() => {
        navigate(`/verify-otp?email=${encodeURIComponent(email)}&userId=${response.data.userId}`);
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || t('forgotPassword.sendFailed');
      showNotification('error', '', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
          <Link to="/login" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.backToLogin')}
          </Link>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src="/assets/images/logo.png" 
                alt="AAU Logo" 
                className="h-16 w-16 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('forgotPassword.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('forgotPassword.description')}
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('forgotPassword.emailAddress')}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                placeholder={t('forgotPassword.enterEmail')}
              />
            </div>

            <button
              type="submit"
              disabled={!email || loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  {t('forgotPassword.sending')}
                </>
              ) : (
                t('forgotPassword.sendCode')
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {t('forgotPassword.rememberPassword')}{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium">
                {t('forgotPassword.signInHere')}
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      <Notification
        type={notification.type}
        title={notification.title}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </div>
  );
};

export default ForgotPassword;