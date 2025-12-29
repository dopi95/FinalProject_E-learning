import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Menu, X } from 'lucide-react';


const Header = () => {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                { to: '/contact', label: t('nav.contact') }
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={item.onClick}
                  className="relative px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 group"
                >
                  <span className="relative z-10">{item.label}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity scale-95 group-hover:scale-100 transform"></div>
                </Link>
              ))}
            </nav>

            {/* Controls */}
            <div className="flex items-center space-x-3">
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

              {/* Login Button - Desktop Only */}
              <Link
                to="/login"
                className="hidden lg:block px-6 py-3 text-blue-600 dark:text-blue-400 font-medium rounded-xl hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 group"
              >
                <span className="group-hover:scale-105 transition-transform inline-block">
                  {t('nav.login')}
                </span>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 transform rotate-90 transition-transform duration-300" />
                ) : (
                  <Menu className="h-6 w-6 transform group-hover:scale-110 transition-transform" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeMobileMenu}></div>
        
        {/* Mobile Menu Panel */}
        <div className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-500 ease-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <img src="/assets/images/aaulogo.png" alt="AAU" className="h-8 w-auto" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">Menu</span>
              </div>
              <button
                onClick={closeMobileMenu}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 px-6 py-8 space-y-2">
              {[
                { to: '/', label: t('nav.home'), onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
                { to: '/about', label: t('nav.about') },
                { to: '/contact', label: t('nav.contact') },
                { to: '/login', label: t('nav.login') }
              ].map((item, index) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => {
                    closeMobileMenu();
                    if (item.onClick) item.onClick();
                  }}
                  className={`flex items-center p-4 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 transform hover:scale-105 animate-slideIn`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="text-lg font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Mobile Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                <button
                  onClick={toggleTheme}
                  className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  <span className="text-sm">{isDark ? 'Light' : 'Dark'}</span>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</span>
                <button
                  onClick={toggleLanguage}
                  className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <img 
                    src={i18n.language === 'en' ? '/assets/flags/us.svg' : '/assets/flags/et.svg'}
                    alt={i18n.language === 'en' ? 'English' : 'Amharic'}
                    className="w-4 h-3 rounded-sm"
                  />
                  <span className="text-sm">{i18n.language === 'en' ? 'English' : 'አማርኛ'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-20"></div>
    </>
  );
};

export default Header;