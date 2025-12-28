import React from 'react';
import { Link } from 'react-router-dom';
import { X, LogIn, UserPlus, Lock } from 'lucide-react';

const LoginRequiredModal = ({ 
  isVisible, 
  onClose, 
  message = "Please login to access this feature",
  title = "Login Required" 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700 transform animate-slideUp relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="text-center">
          {/* Icon with gradient background */}
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Lock className="h-10 w-10 text-white" />
          </div>
          
          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {title}
          </h3>
          
          {/* Message */}
          <p className="text-gray-600 dark:text-gray-300 mb-2 text-lg">
            {message}
          </p>
          
          {/* Subtitle */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            If you don't have an account, you can register for free!
          </p>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              onClick={onClose}
            >
              <LogIn className="h-5 w-5" />
              Login to Continue
            </Link>
            
            <Link
              to="/register"
              className="w-full flex items-center justify-center gap-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 py-3 px-6 rounded-xl hover:bg-blue-600 hover:text-white dark:hover:text-white transition-all duration-300 font-semibold"
              onClick={onClose}
            >
              <UserPlus className="h-5 w-5" />
              Create New Account
            </Link>
            
            <button
              onClick={onClose}
              className="w-full py-3 px-6 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;