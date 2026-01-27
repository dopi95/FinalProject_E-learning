import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const Notification = ({ type, title, message, isVisible, onClose, autoClose = true }) => {
  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, autoClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />;
      default:
        return <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-700';
      case 'error':
        return 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 dark:from-red-900/30 dark:to-rose-900/30 dark:border-red-700';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 dark:from-yellow-900/30 dark:to-amber-900/30 dark:border-yellow-700';
      default:
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 dark:from-blue-900/30 dark:to-indigo-900/30 dark:border-blue-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 px-4 pointer-events-none">
      <div className={`${getBgColor()} border rounded-2xl shadow-2xl px-4 py-3 w-full max-w-sm mx-auto backdrop-blur-sm flex items-center space-x-3 pointer-events-auto transform transition-all duration-500 animate-in slide-in-from-top-2 fade-in-0`}>
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white break-words">
            {title ? `${title}: ${message}` : message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Notification;