import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, ArrowLeft, Loader, Mail } from 'lucide-react';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import Notification from '../components/Notification';
import logo from '/assets/images/aaulogo.png';


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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState(null);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [googleRole, setGoogleRole] = useState('student');

  const completeGoogleLogin = async (tokenResponse, role) => {
    setGoogleLoading(true);
    try {
      // Get user info from Google
      const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
      });
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google-token`, {
        googleId: userInfo.data.sub,
        email: userInfo.data.email,
        name: userInfo.data.name,
        picture: userInfo.data.picture,
        role
      });
      clearLoginAttempts();
      showNotification('success', '', 'Google sign-in successful!');
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setTimeout(() => {
        const r = response.data.user.role;
        if (r === 'superadmin') navigate('/super-admin-dashboard');
        else if (r === 'admin') navigate('/admin-dashboard');
        else if (r === 'instructor') navigate('/instructor-dashboard');
        else navigate('/student-dashboard');
      }, 1500);
    } catch (error) {
      showNotification('error', '', error.response?.data?.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
      setShowRolePicker(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const check = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/check-email?email=${encodeURIComponent(userInfo.data.email)}`);
        if (check.data.exists) {
          await completeGoogleLogin(tokenResponse, null);
        } else {
          setPendingGoogleCredential(tokenResponse);
          setShowRolePicker(true);
        }
      } catch {
        await completeGoogleLogin(tokenResponse, 'student');
      }
    },
    onError: () => showNotification('error', '', 'Google sign-in failed')
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
        if (userRole === 'superadmin') {
          navigate('/super-admin-dashboard');
        } else if (userRole === 'admin') {
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
              className="w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-all duration-300 transform bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-105 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 shadow-lg hover:shadow-xl disabled:opacity-50"
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

          <div className={`mt-6 transform transition-all duration-700 delay-900 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
            <div className="relative flex items-center my-2">
              <div className="flex-grow border-t border-gray-200 dark:border-gray-600" />
              <span className="mx-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">or continue with</span>
              <div className="flex-grow border-t border-gray-200 dark:border-gray-600" />
            </div>
            <button
              type="button"
              onClick={() => googleLogin()}
              disabled={googleLoading}
              className="mt-3 w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <Loader className="animate-spin h-5 w-5 text-blue-500" />
              ) : (
                <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {googleLoading ? 'Signing in...' : 'Continue with Google'}
              </span>
            </button>
          </div>

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

      {showRolePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">Join as</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">How will you use the platform?</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setGoogleRole('student')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  googleRole === 'student'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-300'
                }`}
              >
                <span className="text-2xl">🎓</span>
                <span className="font-medium text-sm">Student</span>
              </button>
              <button
                onClick={() => setGoogleRole('instructor')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  googleRole === 'instructor'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-300'
                }`}
              >
                <span className="text-2xl">📚</span>
                <span className="font-medium text-sm">Instructor</span>
              </button>
            </div>
            <button
              onClick={() => completeGoogleLogin(pendingGoogleCredential, googleRole)}
              disabled={googleLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {googleLoading ? <><Loader className="animate-spin h-4 w-4 mr-2" /> Please wait...</> : 'Continue with Google'}
            </button>
            <button
              onClick={() => setShowRolePicker(false)}
              className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;