import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
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
      setDeferredPrompt(null);
      setShowInstall(false);
    }
  };

  const handleClose = () => {
    setShowInstall(false);
  };

  if (!showInstall) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-down">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm w-80">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center animate-pulse">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white animate-fadeIn">Install App</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 animate-fadeIn animation-delay-200">Quick access & offline use</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-300 transform hover:scale-110 animate-slideIn animation-delay-400"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        <div className="mt-3 flex space-x-2">
          <button
            onClick={handleInstall}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-slideUp animation-delay-600"
          >
            Install
          </button>
          <button
            onClick={handleClose}
            className="px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm font-medium transition-all duration-300 animate-slideUp animation-delay-800"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallButton;