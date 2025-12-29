import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader, CheckCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';
import Notification from '../components/Notification';
import logo from '/assets/images/aaulogo.png';


const VerifyEmail = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [initialOtpSent, setInitialOtpSent] = useState(false);
  const timerRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [notification, setNotification] = useState({
    isVisible: false,
    type: 'success',
    title: '',
    message: ''
  });
  const userId = searchParams.get('userId');

  const showNotification = (type, title, message) => {
    setNotification({ isVisible: true, type, title, message });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const startTimer = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setTimeLeft(60);
    setCanResend(false);
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-send OTP when component mounts (only if not coming from register or login flow)
  useEffect(() => {
    const fromRegister = searchParams.get('fromRegister');
    const fromLogin = searchParams.get('fromLogin');
    
    if (userId && !initialOtpSent && !fromRegister && !fromLogin) {
      sendInitialOTP();
      setInitialOtpSent(true);
    } else if (fromRegister) {
      // If coming from register, start timer since OTP was sent from register page
      startTimer();
      setInitialOtpSent(true);
    } else if (fromLogin) {
      // If coming from login, start timer since OTP was sent from login page
      startTimer();
      setInitialOtpSent(true);
    }
  }, [userId, initialOtpSent, searchParams]);

  const sendInitialOTP = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/resend-otp`, {
        userId
      });
      showNotification('success', '', t('verifyEmail.otpSent'));
      startTimer();
    } catch (error) {
      const errorMessage = error.response?.data?.message || t('verifyEmail.resendFailed');
      showNotification('error', '', errorMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      showNotification('error', '', t('verifyEmail.enterSixDigits'));
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-email`, {
        userId,
        otp
      });

      showNotification('success', '', t('verifyEmail.emailVerified'));
      setVerified(true);
      
      // Store token and redirect to login after 3 seconds
      localStorage.setItem('token', response.data.token);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || t('verifyEmail.verificationFailed');
      showNotification('error', '', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/resend-otp`, {
        userId
      });
      showNotification('success', '', t('verifyEmail.otpSent'));
      startTimer();
    } catch (error) {
      const errorMessage = error.response?.data?.message || t('verifyEmail.resendFailed');
      showNotification('error', '', errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  if (verified) {
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
              {t('verifyEmail.emailVerified')}
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('verifyEmail.verificationSuccess')}
            </p>
            
            <Link 
              to="/login"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 font-medium inline-block"
            >
              {t('verifyEmail.goToLogin')}
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
          <Link to="/register" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors">
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
              {t('verifyEmail.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {searchParams.get('fromLogin') 
                ? t('verifyEmail.descriptionFromLogin')
                : t('verifyEmail.description')
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('verifyEmail.verificationCode')}
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors text-center text-2xl font-mono tracking-widest"
                placeholder="000000"
              />
            </div>

            <div className="text-center mb-4">
              {!canResend ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('verifyEmail.resendIn')} {formatTime(timeLeft)}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendLoading}
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium flex items-center justify-center mx-auto disabled:opacity-50"
                >
                  {resendLoading ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      {t('verifyEmail.resending')}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {t('verifyEmail.resendCode')}
                    </>
                  )}
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={otp.length !== 6 || loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  {t('verifyEmail.verifying')}
                </>
              ) : (
                t('verifyEmail.verifyEmail')
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
        autoClose={true}
      />
    </div>
  );
};

export default VerifyEmail;