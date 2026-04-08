import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Menu, X, User, Bell, BellOff } from 'lucide-react';
import { subscriptionAPI } from '../services/api';
import LoginRequiredModal from './LoginRequiredModal';
import VideoReels from './VideoReels';


const Header = () => {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSubscribeMenu, setShowSubscribeMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showVideoReels, setShowVideoReels] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Fetch subscription status from API
      fetchSubscriptionStatus();
    }
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await subscriptionAPI.getStatus();
      setIsSubscribed(response.data.isSubscribed);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    }
  };

  const playSound = (type) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'subscribe') {
      oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
    } else {
      oscillator.frequency.setValueAtTime(784, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(523, audioContext.currentTime + 0.2);
    }
    
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const toggleSubscription = async () => {
    if (!user) {
      setShowLoginModal(true);
      setShowSubscribeMenu(false);
      return;
    }

    try {
      setLoading(true);
      if (isSubscribed) {
        await subscriptionAPI.unsubscribe(user.email);
        setIsSubscribed(false);
        playSound('unsubscribe');
        showToast('Unsubscribed successfully!', 'orange');
      } else {
        await subscriptionAPI.subscribe(user.email);
        setIsSubscribed(true);
        playSound('subscribe');
        showToast('Subscribed successfully!', 'green');
      }
      setShowSubscribeMenu(false);
    } catch (error) {
      console.error('Subscription error:', error);
      showToast(error.response?.data?.message || 'Something went wrong', 'red');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, color) => {
    const toast = document.createElement('div');
    toast.className = `fixed top-24 right-4 z-50 px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 transform translate-x-full`;
    
    // Set background color based on the color parameter
    if (color === 'green') {
      toast.style.backgroundColor = '#10b981'; // green-500
    } else if (color === 'red' || color === 'orange') {
      toast.style.backgroundColor = '#ef4444'; // red-500
    } else {
      toast.style.backgroundColor = '#3b82f6'; // blue-500
    }
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
  };

  const getDashboardRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'superadmin': return '/super-admin-dashboard';
      case 'admin': return '/admin-dashboard';
      case 'instructor': return '/instructor-dashboard';
      case 'student': return '/student-dashboard';
      default: return '/login';
    }
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'am' : 'en');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-700/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="relative">
                <img 
                  src="/assets/images/aaulogo.png"
                  alt="AAU E-Learning" 
                  className="h-12 w-16 object-contain"
                />
              </div>
              <div className="">
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AAU E-Learning
                </span>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                  Excellence in Education
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {[
                { to: '/', label: t('nav.home'), onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
                { to: '/about', label: t('nav.about') },
                { action: () => setShowVideoReels(true), label: 'Reels' },
                { to: '/contact', label: t('nav.contact') }
              ].map((item) => (
                item.to ? (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={item.onClick}
                    className="relative px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 group"
                  >
                    <span className="relative z-10">{item.label}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity scale-95 group-hover:scale-100 transform"></div>
                  </Link>
                ) : (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="relative px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 group"
                  >
                    <span className="relative z-10">{item.label}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity scale-95 group-hover:scale-100 transform"></div>
                  </button>
                )
              ))}
            </nav>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              {/* Email Subscription Bell - Mobile */}
              {user && (user.role === 'student' || user.role === 'instructor') && (
                <div className="lg:hidden relative">
                  <button
                    onClick={() => setShowSubscribeMenu(!showSubscribeMenu)}
                    className="relative p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 group"
                  >
                    {isSubscribed ? (
                      <Bell className="h-5 w-5 transform group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <BellOff className="h-5 w-5 transform group-hover:scale-110 transition-transform duration-300" />
                    )}
                    {isSubscribed && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </button>
                  {showSubscribeMenu && (
                    <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-50">
                      <button
                        onClick={toggleSubscription}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded whitespace-nowrap disabled:opacity-50"
                      >
                        {loading ? 'Loading...' : (isSubscribed ? 'Unsubscribe' : 'Subscribe')}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Email Subscription Bell - Desktop */}
              {user && (user.role === 'student' || user.role === 'instructor') && (
                <div className="hidden lg:block relative">
                  <button
                    onClick={() => setShowSubscribeMenu(!showSubscribeMenu)}
                    className="relative p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 group"
                  >
                    {isSubscribed ? (
                      <Bell className="h-5 w-5 transform group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <BellOff className="h-5 w-5 transform group-hover:scale-110 transition-transform duration-300" />
                    )}
                    {isSubscribed && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </button>
                  {showSubscribeMenu && (
                    <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-50">
                      <button
                        onClick={toggleSubscription}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded whitespace-nowrap disabled:opacity-50"
                      >
                        {loading ? 'Loading...' : (isSubscribed ? 'Unsubscribe' : 'Subscribe')}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Show subscription for non-logged in users - HIDDEN */}

              {/* Theme Toggle - Desktop Only */}
              <button
                onClick={toggleTheme}
                className="hidden lg:block relative p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 group"
              >
                <div className="relative z-10">
                  {isDark ? (
                    <Sun className="h-5 w-5 transform group-hover:rotate-180 transition-transform duration-500" />
                  ) : (
                    <Moon className="h-5 w-5 transform group-hover:-rotate-12 transition-transform duration-300" />
                  )}
                </div>
              </button>

              {/* Language Toggle - Desktop Only */}
              <button
                onClick={toggleLanguage}
                className="hidden lg:block relative items-center space-x-2 p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 group"
              >
                <div className="relative z-10 flex items-center space-x-2">
                  <img 
                    src={i18n.language === 'en' ? '/assets/flags/us.svg' : '/assets/flags/et.svg'}
                    alt={i18n.language === 'en' ? 'English' : 'Amharic'}
                    className="w-5 h-4 rounded-sm shadow-sm group-hover:scale-110 transition-transform"
                  />
                  <span className="text-sm font-medium hidden sm:block">
                    {i18n.language === 'en' ? 'EN' : 'አማ'}
                  </span>
                </div>
              </button>

              {/* My Account/Login Button - Desktop Only */}
              <Link
                to={getDashboardRoute()}
                className="hidden lg:flex items-center space-x-2 px-6 py-3 text-blue-600 dark:text-blue-400 font-medium rounded-xl hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 group"
              >
                {user && <User className="h-4 w-4" />}
                <span className="group-hover:scale-105 transition-transform inline-block">
                  {user ? 'My Account' : t('nav.login')}
                </span>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden relative p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 group-hover:from-blue-50/50 to-indigo-50/0 group-hover:to-indigo-50/50 dark:from-blue-900/0 dark:group-hover:from-blue-900/30 dark:to-indigo-900/0 dark:group-hover:to-indigo-900/30 rounded-xl transition-all duration-300"></div>
                <div className="relative z-10">
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6 transform rotate-0 group-hover:rotate-90 transition-all duration-500" />
                  ) : (
                    <Menu className="h-6 w-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Click outside to close subscription menu */}
      {showSubscribeMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSubscribeMenu(false)}
        ></div>
      )}

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={closeMobileMenu}></div>
        
        {/* Mobile Menu Panel */}
        <div className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl border-l border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-700 ease-out ${isMobileMenuOpen ? 'translate-x-0 scale-100' : 'translate-x-full scale-95'}`}>
          <div className="flex flex-col h-full relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 dark:from-blue-900/20 dark:via-transparent dark:to-indigo-900/20"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/10 to-purple-400/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
            
            {/* Mobile Header */}
            <div className={`flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm relative z-10 transform transition-all duration-500 ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`} style={{transitionDelay: '200ms'}}>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img src="/assets/images/aaulogo.png" alt="AAU" className="h-8 w-auto" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-lg animate-pulse"></div>
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Menu</span>
              </div>
              <button
                onClick={closeMobileMenu}
                className="relative p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 group backdrop-blur-sm"
              >
                <X className="h-6 w-6 transform group-hover:rotate-90 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-red-400/0 group-hover:from-red-400/10 to-pink-400/0 group-hover:to-pink-400/10 rounded-xl transition-all duration-300"></div>
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 px-6 py-8 space-y-3 relative z-10">
              {[
                { to: '/', label: t('nav.home'), onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
                { to: '/about', label: t('nav.about') },
                { action: () => setShowVideoReels(true), label: 'Reels' },
                { to: '/contact', label: t('nav.contact') },
                { to: getDashboardRoute(), label: user ? 'My Account' : t('nav.login') }
              ].map((item, index) => (
                <div key={item.to || item.label} className={`group transform transition-all duration-500 ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`} style={{ transitionDelay: `${300 + index * 100}ms` }}>
                  {item.to ? (
                    <Link
                      to={item.to}
                      onClick={() => {
                        closeMobileMenu();
                        if (item.onClick) item.onClick();
                      }}
                      className="flex items-center p-4 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-500 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-transparent hover:border-blue-200/50 dark:hover:border-blue-700/50"
                    >
                      <div className="flex-1">
                        <span className="text-lg font-medium block transform group-hover:translate-x-1 transition-transform duration-300">{item.label}</span>
                        <div className="h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left mt-1 rounded-full"></div>
                      </div>
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300"></div>
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        closeMobileMenu();
                        item.action();
                      }}
                      className="w-full flex items-center p-4 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-500 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-transparent hover:border-blue-200/50 dark:hover:border-blue-700/50 text-left"
                    >
                      <div className="flex-1">
                        <span className="text-lg font-medium block transform group-hover:translate-x-1 transition-transform duration-300">{item.label}</span>
                        <div className="h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left mt-1 rounded-full"></div>
                      </div>
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300"></div>
                    </button>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile Footer */}
            <div className={`p-6 border-t border-gray-200/50 dark:border-gray-700/50 space-y-4 backdrop-blur-sm relative z-10 transform transition-all duration-500 ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{transitionDelay: '600ms'}}>
              <div className="flex items-center justify-between group">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                <button
                  onClick={toggleTheme}
                  className="flex items-center space-x-2 p-3 rounded-xl bg-gradient-to-r from-gray-100/80 to-gray-200/80 dark:from-gray-800/80 dark:to-gray-700/80 text-gray-600 dark:text-gray-400 hover:from-blue-100/80 hover:to-indigo-100/80 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 backdrop-blur-sm border border-gray-300/30 dark:border-gray-600/30 hover:border-blue-300/50 dark:hover:border-blue-600/50 transform hover:scale-105 hover:shadow-lg"
                >
                  <div className="transform transition-transform duration-500 hover:rotate-180">
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </div>
                  <span className="text-sm font-medium">{isDark ? 'Light' : 'Dark'}</span>
                </button>
              </div>
              
              <div className="flex items-center justify-between group">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</span>
                <button
                  onClick={toggleLanguage}
                  className="flex items-center space-x-2 p-3 rounded-xl bg-gradient-to-r from-gray-100/80 to-gray-200/80 dark:from-gray-800/80 dark:to-gray-700/80 text-gray-600 dark:text-gray-400 hover:from-blue-100/80 hover:to-indigo-100/80 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 backdrop-blur-sm border border-gray-300/30 dark:border-gray-600/30 hover:border-blue-300/50 dark:hover:border-blue-600/50 transform hover:scale-105 hover:shadow-lg"
                >
                  <img 
                    src={i18n.language === 'en' ? '/assets/flags/us.svg' : '/assets/flags/et.svg'}
                    alt={i18n.language === 'en' ? 'English' : 'Amharic'}
                    className="w-4 h-3 rounded-sm shadow-sm transform transition-transform duration-300 hover:scale-110"
                  />
                  <span className="text-sm font-medium">{i18n.language === 'en' ? 'English' : 'አማርኛ'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-20"></div>

      {/* Login Required Modal */}
      <LoginRequiredModal
        isVisible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => {
          setShowLoginModal(false);
          window.location.href = '/login';
        }}
        onRegister={() => {
          setShowLoginModal(false);
          window.location.href = '/register';
        }}
      />

      {/* Video Reels Modal */}
      <VideoReels 
        isOpen={showVideoReels} 
        onClose={() => setShowVideoReels(false)} 
      />
    </>
  );
};

export default Header;