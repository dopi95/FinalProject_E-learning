import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, ArrowLeft, Loader, Mail } from 'lucide-react';
import axios from 'axios';
import Notification from '../components/Notification';
import logo from '../../public/assets/images/aaulogo.png';


const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notification, setNotification] = useState({
    isVisible: false,
    type: 'success',
    title: '',
    message: ''
  });
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeLeft, setBlockTimeLeft] = useState(0);
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkLoginAttempts();
  }, []);

  useEffect(() => {
    const isValid = formData.email.trim() !== '' && formData.password.trim() !== '';
    setIsFormValid(isValid && !isBlocked);
  }, [formData.email, formData.password, isBlocked]);

  const checkLoginAttempts = () => {
    const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '[]');
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const recentAttempts = attempts.filter(attempt => attempt > oneHourAgo);
    
    if (recentAttempts.length >= 5) {
      setIsBlocked(true);
      const oldestAttempt = Math.min(...recentAttempts);
      const unblockTime = oldestAttempt + (60 * 60 * 1000);
      const timeLeft = Math.ceil((unblockTime - now) / 1000 / 60);
      setBlockTimeLeft(timeLeft);
      
        showNotification('error', '', t('login.accountBlocked'));
    } else {
      setLoginAttempts(recentAttempts.length);
    }
    
    localStorage.setItem('loginAttempts', JSON.stringify(recentAttempts));
  };

  const recordFailedAttempt = () => {
    const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '[]');
    attempts.push(Date.now());
    localStorage.setItem('loginAttempts', JSON.stringify(attempts));
    checkLoginAttempts();
  };

  const clearLoginAttempts = () => {
    localStorage.removeItem('loginAttempts');
    setLoginAttempts(0);
    setIsBlocked(false);
    setBlockTimeLeft(0);
  };

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleInvalidSubmit = () => {
    if (!isFormValid) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleVerifyEmailClick = async () => {
    setSendingOtp(true);
    
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/resend-otp`, {
        userId: unverifiedUser.userId
      });
      
      showNotification('success', '', t('login.otpSent'));
      setTimeout(() => {
        navigate(`/verify-email?userId=${unverifiedUser.userId}&fromLogin=true`);
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || t('login.otpSendFailed');
      showNotification('error', '', errorMessage);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isBlocked) {
      showNotification('error', '', t('login.pleaseWait'));
      return;
    }
    
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email: formData.email,
        password: formData.password
      });

      clearLoginAttempts();
      
      showNotification('success', '', t('login.loginSuccess'));

      if (formData.rememberMe) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('rememberMe', 'true');
      } else {
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.removeItem('rememberMe');
      }

      setTimeout(() => {
        const userRole = response.data.user.role;
        if (userRole === 'admin') {
          navigate('/admin-dashboard');
        } else if (userRole === 'instructor') {
          navigate('/instructor-dashboard');
        } else {
          navigate('/student-dashboard');
        }
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || t('login.loginFailed');
      
      if (error.response?.data?.needsVerification) {
        const userId = error.response.data.userId;
        setUnverifiedUser({ userId, email: formData.email });
        setShowVerifyEmail(true);
        return;
      }
      
      recordFailedAttempt();
      const newAttempts = loginAttempts + 1;
      const attemptsLeft = 5 - newAttempts;
      
      if (attemptsLeft > 0) {
        showNotification('error', '', t('login.invalidCredentials'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (showVerifyEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700 text-center">
            <button onClick={() => setShowVerifyEmail(false)} className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </button>

            <div className="flex justify-center mb-6">
              <div className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded-full">
                <Mail className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('login.verifyEmailTitle')}
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('login.verifyEmailMessage', { email: unverifiedUser?.email })}
            </p>
            
            <button
              onClick={handleVerifyEmailClick}
              disabled={sendingOtp}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {sendingOtp ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  {t('login.sendingOtp')}
                </>
              ) : (
                t('login.verifyEmailNow')
              )}
            </button>
          </div>
        </div>
        
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          isVisible={notification.isVisible}
          onClose={hideNotification}
          autoClose={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 overflow-hidden">
      <div className="max-w-md w-full">
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700 transform transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Link to="/" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.backToHome')}
          </Link>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className={`transform transition-all duration-1000 ${mounted ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
                <img 
                  src={logo}
                  alt="AAU Logo" 
                  className="h-24 w-24 object-contain"
                />
              </div>
            </div>
            <h1 className={`text-3xl font-bold text-gray-900 dark:text-white mb-2 transform transition-all duration-700 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
              {t('login.welcomeBack')}
            </h1>
            <p className={`text-gray-600 dark:text-gray-400 transform transition-all duration-700 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
              {t('login.signInMessage')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className={`space-y-6 transform transition-all duration-700 delay-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('login.emailAddress')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                placeholder={t('login.enterEmail')}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('login.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  placeholder={t('login.enterPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input 
                  type="checkbox" 
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all duration-200 group-hover:scale-110" 
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-600 transition-colors duration-200">
                  {t('login.rememberMe')}
                </span>
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors duration-200">
                {t('login.forgotPassword')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              onClick={!isFormValid ? handleInvalidSubmit : undefined}
              className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-all duration-300 transform ${
                isFormValid
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-105 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              } ${
                shake ? 'animate-shake' : ''
              } disabled:opacity-50`}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  {t('login.signingIn')}
                </>
              ) : (
                t('login.signIn')
              )}
            </button>
          </form>

          <div className={`mt-6 text-center transform transition-all duration-700 delay-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
            <p className="text-gray-600 dark:text-gray-400">
              {t('login.noAccount')}{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium transition-colors duration-200 hover:underline">
                {t('login.signUpHere')}
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
        autoClose={true}
      />
    </div>
  );
};

export default Login;