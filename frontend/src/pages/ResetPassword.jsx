import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader, Eye, EyeOff, CheckCircle } from 'lucide-react';
import axios from 'axios';
import Notification from '../components/Notification';
import logo from '/assets/images/aaulogo.png';


const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const otp = searchParams.get('otp');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notification, setNotification] = useState({
    isVisible: false,
    type: 'success',
    title: '',
    message: ''
  });

  useEffect(() => {
    if (!userId || !otp) {
      navigate('/forgot-password');
    }
  }, [userId, otp, navigate]);

  const showNotification = (type, title, message) => {
    setNotification({ isVisible: true, type, title, message });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const validatePassword = () => {
    if (newPassword.length < 8) {
      showNotification('error', '', 'Password must be at least 8 characters.');
      return false;
    }
    if (!/[A-Z]/.test(newPassword)) {
      showNotification('error', '', 'Password must contain at least one uppercase letter.');
      return false;
    }
    if (!/[a-z]/.test(newPassword)) {
      showNotification('error', '', 'Password must contain at least one lowercase letter.');
      return false;
    }
    if (!/[0-9]/.test(newPassword)) {
      showNotification('error', '', 'Password must contain at least one number.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      showNotification('error', '', t('forgotPassword.passwordMismatch'));
      return false;
    }
    return true;
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) return;

    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        userId,
        otp,
        newPassword
      });

      showNotification('success', '', t('forgotPassword.passwordResetSuccess'));
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || t('forgotPassword.resetFailed');
      showNotification('error', '', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('forgotPassword.successTitle')}
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('forgotPassword.successMessage')}
            </p>
            
            <Link 
              to="/login"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 font-medium inline-block"
            >
              {t('forgotPassword.goToLogin')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
          <Link to="/forgot-password" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Link>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src={logo}
                alt="AAU Logo" 
                className="h-16 w-16 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('forgotPassword.resetPassword')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('forgotPassword.enterNewPassword')}
            </p>
          </div>

          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('forgotPassword.newPassword')}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  placeholder={t('forgotPassword.enterNewPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('forgotPassword.confirmPassword')}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  placeholder={t('forgotPassword.confirmNewPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {newPassword && (
                <ul className="space-y-1">
                  <li className={newPassword.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>
                    {newPassword.length >= 8 ? '✓' : '✗'} At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>
                    {/[A-Z]/.test(newPassword) ? '✓' : '✗'} At least one uppercase letter
                  </li>
                  <li className={/[a-z]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>
                    {/[a-z]/.test(newPassword) ? '✓' : '✗'} At least one lowercase letter
                  </li>
                  <li className={/[0-9]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>
                    {/[0-9]/.test(newPassword) ? '✓' : '✗'} At least one number
                  </li>
                </ul>
              )}
            </div>

            <button
              type="submit"
              disabled={!newPassword || !confirmPassword || loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  {t('forgotPassword.resetting')}
                </>
              ) : (
                t('forgotPassword.resetPassword')
              )}
            </button>
          </form>
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

export default ResetPassword;