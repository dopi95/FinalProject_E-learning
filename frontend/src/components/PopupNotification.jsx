import React, { useEffect } from 'react';
import { CheckCircle, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const PopupNotification = ({ 
  type = 'success', 
  title, 
  message, 
  isVisible, 
  onClose, 
  duration = 4000 
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />;
      case 'info':
        return <Info className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />;
      default:
        return <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="w-full max-w-md mx-auto transform transition-all duration-300 scale-100 animate-in zoom-in-95 fade-in-0">
        <div className={`${getColors()} border-2 rounded-2xl shadow-2xl p-4 sm:p-6 backdrop-blur-md`}>
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className="flex-shrink-0 mt-1">
              {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-base sm:text-lg font-bold mb-2 break-words">
                  {title}
                </h3>
              )}
              {message && (
                <p className="text-sm leading-relaxed break-words">
                  {message}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupNotification;