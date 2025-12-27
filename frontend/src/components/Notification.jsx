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
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      default:
        return <CheckCircle className="h-6 w-6 text-blue-500" />;
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
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown px-4">
      <div className={`${getBgColor()} border rounded-full shadow-2xl px-4 sm:px-6 py-3 transform transition-all duration-500 backdrop-blur-sm flex items-center space-x-2 sm:space-x-3 min-w-fit max-w-[90vw] sm:max-w-md`}>
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis">
          {title ? `${title}: ${message}` : message}
        </p>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1"
        >
          <X className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
      </div>
    </div>
  );
};

export default Notification;