import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
      setTimeout(() => setIsVisible(true), 100);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
      setTimeout(() => {
        setDeferredPrompt(null);
        setShowInstall(false);
      }, 300);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setShowInstall(false), 300);
  };

  if (!showInstall) return null;

  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <div className={`fixed top-20 right-4 z-50 transition-all duration-500 ease-out transform ${
      isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'
    }`}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-5 max-w-sm w-80 backdrop-blur-xl bg-opacity-95 dark:bg-opacity-95">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                {isMobile ? <Smartphone className="h-6 w-6 text-white" /> : <Monitor className="h-6 w-6 text-white" />}
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                Install App
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-tight">
                Fast, secure & offline access
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 group"
          >
            <X className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          </button>
        </div>

        {/* Features */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
            Works offline
          </div>
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
            Faster loading
          </div>
          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
            Native app experience
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={handleInstall}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Install</span>
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallButton;