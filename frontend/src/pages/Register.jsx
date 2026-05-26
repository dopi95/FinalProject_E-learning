import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, ArrowLeft, Check, Mail, Loader, User, BookOpen } from 'lucide-react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import Notification from '../components/Notification';
import logo from '/assets/images/aaulogo.png';


const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('register'); // 'register', 'success'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    gender: '',
    agreeToTerms: false
  });
  const [registrationData, setRegistrationData] = useState(null);
  const [notification, setNotification] = useState({
    isVisible: false,
    type: 'success',
    title: '',
    message: ''
  });
  const [otpLoading, setOtpLoading] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleCredential = async (credentialResponse) => {
    setGoogleLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        credential: credentialResponse.credential,
        role: formData.role
      });
      showNotification('success', '', 'Google sign-up successful!');
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setTimeout(() => {
        const role = response.data.user.role;
        if (role === 'instructor') navigate('/instructor-dashboard');
        else navigate('/student-dashboard');
      }, 1500);
    } catch (error) {
      showNotification('error', '', error.response?.data?.message || 'Google sign-up failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const showNotification = (type, title, message) => {
    setNotification({ isVisible: true, type, title, message });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showNotification('error', '', t('register.passwordMismatch'));
      return;
    }

    if (formData.password.length < 8) {
      showNotification('error', '', 'Password must be at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      showNotification('error', '', 'Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[a-z]/.test(formData.password)) {
      showNotification('error', '', 'Password must contain at least one lowercase letter.');
      return;
    }
    if (!/[0-9]/.test(formData.password)) {
      showNotification('error', '', 'Password must contain at least one number.');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(formData.password)) {
      showNotification('error', '', 'Password must contain at least one special character.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        gender: formData.gender
      });

      showNotification('success', '', t('register.registrationSuccess'));
      
      setRegistrationData({
        message: response.data.message,
        userId: response.data.userId,
        email: formData.email,
        name: formData.name
      });
      
      setTimeout(() => {
        setStep('success');
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          t('register.registrationFailed');
      showNotification('error', '', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailClick = async () => {
    setOtpLoading(true);
    
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/resend-otp`, {
        userId: registrationData.userId
      });
      
      showNotification('success', '', t('register.otpSent'));
      setTimeout(() => {
        navigate(`/verify-email?userId=${registrationData.userId}&fromRegister=true`);
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || t('register.otpSendFailed');
      showNotification('error', '', errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };



  const passwordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 0:
      case 1: return 'bg-red-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getStrengthText = (strength) => {
    switch (strength) {
      case 0:
      case 1: return t('register.weak');
      case 2: return t('register.fair');
      case 3: return t('register.good');
      case 4: return t('register.strong');
      default: return '';
    }
  };



  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700 text-center">
            <button onClick={() => setStep('register')} className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors">
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
              {t('login.verifyEmailMessage', { email: registrationData?.email })}
            </p>
            
            <button
              onClick={handleVerifyEmailClick}
              disabled={otpLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {otpLoading ? (
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
          <Link to="/" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.backToHome')}
          </Link>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img 
                src={logo}
                alt="AAU Logo" 
                className="h-24 w-24 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('register.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('register.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('register.accountType')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'student'})}
                  className={`p-3 rounded-lg border-2 transition-all duration-300 flex items-center space-x-2 group ${
                    formData.role === 'student'
                      ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 shadow-md'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  <div className={`p-2 rounded-full transition-all duration-300 ${
                    formData.role === 'student'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                  }`}>
                    <User className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-sm">{t('register.student')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'instructor'})}
                  className={`p-3 rounded-lg border-2 transition-all duration-300 flex items-center space-x-2 group ${
                    formData.role === 'instructor'
                      ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 shadow-md'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  <div className={`p-2 rounded-full transition-all duration-300 ${
                    formData.role === 'instructor'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                  }`}>
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-sm">{t('register.instructor')}</span>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('register.fullName')} (with your grandfather name)
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                placeholder="e.g. Abebe Belay Damtie"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('register.emailAddress')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                placeholder={t('register.enterEmail')}
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('register.password')}
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
                  placeholder={t('register.createPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${getStrengthColor(passwordStrength(formData.password))}`}
                        style={{ width: `${(passwordStrength(formData.password) / 4) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {getStrengthText(passwordStrength(formData.password))}
                    </span>
                  </div>
                  <ul className="mt-2 text-xs space-y-1">
                    <li className={formData.password.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>
                      {formData.password.length >= 8 ? '✓' : '✗'} At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>
                      {/[A-Z]/.test(formData.password) ? '✓' : '✗'} At least one uppercase letter
                    </li>
                    <li className={/[a-z]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>
                      {/[a-z]/.test(formData.password) ? '✓' : '✗'} At least one lowercase letter
                    </li>
                    <li className={/[0-9]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>
                      {/[0-9]/.test(formData.password) ? '✓' : '✗'} At least one number
                    </li>
                    <li className={/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-red-500'}>
                      {/[^A-Za-z0-9]/.test(formData.password) ? '✓' : '✗'} At least one special character
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('register.confirmPassword')}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  placeholder={t('register.confirmYourPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="mt-2 flex items-center text-green-600 dark:text-green-400">
                  <Check className="h-4 w-4 mr-1" />
                  <span className="text-sm">{t('register.passwordsMatch')}</span>
                </div>
              )}
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                required
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                {t('register.agreeToTerms')}{' '}
                <Link to="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  {t('register.termsOfService')}
                </Link>{' '}
                {t('register.and')}{' '}
                <Link to="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  {t('register.privacyPolicy')}
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={!formData.agreeToTerms || loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  {t('register.creatingAccount')}
                </>
              ) : (
                t('register.createAccount')
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
              <span className="mx-4 text-sm text-gray-500 dark:text-gray-400">or</span>
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="mt-4 flex justify-center">
              {googleLoading ? (
                <div className="flex items-center justify-center w-full py-2 text-gray-500 dark:text-gray-400">
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Signing up with Google...
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleCredential}
                  onError={() => showNotification('error', '', 'Google sign-up failed')}
                  text="continue_with"
                  shape="rectangular"
                  theme="outline"
                  size="large"
                  width="400"
                />
              )}
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {t('register.alreadyHaveAccount')}{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium">
                {t('register.signInHere')}
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

export default Register;