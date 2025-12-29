import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader, RefreshCw } from 'lucide-react';
import axios from 'axios';
import Notification from '../components/Notification';
import logo from '/assets/images/aaulogo.png';


const VerifyOTP = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const userId = searchParams.get('userId');
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [notification, setNotification] = useState({
    isVisible: false,
    type: 'success',
    title: '',
    message: ''
  });

  useEffect(() => {
    if (!email || !userId) {
      navigate('/forgot-password');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, userId, navigate]);

  const showNotification = (type, title, message) => {
    setNotification({ isVisible: true, type, title, message });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, {
        userId,
        otp
      });

      showNotification('success', '', t('forgotPassword.otpVerified'));
      
      setTimeout(() => {
        navigate(`/reset-password?userId=${userId}&otp=${otp}`);
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || t('forgotPassword.invalidOtp');
      showNotification('error', '', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/resend-password-otp`, {
        email
      });

      showNotification('success', '', t('forgotPassword.otpResent'));
      setTimeLeft(60);
      setCanResend(false);
      
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || t('forgotPassword.resendFailed');
      showNotification('error', '', errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
              {t('forgotPassword.verifyCode')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('forgotPassword.codeSentTo')} {email}
            </p>
          </div>

          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('forgotPassword.verificationCode')}
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

            <div className="text-center">
              {!canResend ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('forgotPassword.resendIn')} {formatTime(timeLeft)}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium flex items-center justify-center mx-auto disabled:opacity-50"
                >
                  {resendLoading ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      {t('forgotPassword.resending')}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {t('forgotPassword.resendCode')}
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
                  {t('forgotPassword.verifying')}
                </>
              ) : (
                t('forgotPassword.verifyCode')
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

export default VerifyOTP;