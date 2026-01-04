import React from 'react';
import { X, Calendar, Clock } from 'lucide-react';

const RegistrationDateModal = ({ isVisible, onClose, type, startDate, endDate }) => {
  if (!isVisible) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getContent = () => {
    if (type === 'not_started') {
      return {
        title: 'Registration Not Started',
        message: 'Registration has not started yet.',
        dateInfo: `Registration period: ${formatDate(startDate)} to ${formatDate(endDate)}`,
        icon: <Clock className="h-8 w-8 text-orange-500" />,
        bgColor: 'from-orange-500 to-red-500'
      };
    } else {
      return {
        title: 'Registration Closed',
        message: 'Registration period has ended.',
        dateInfo: `Registration was: ${formatDate(startDate)} to ${formatDate(endDate)}`,
        icon: <Calendar className="h-8 w-8 text-red-500" />,
        bgColor: 'from-red-500 to-pink-500'
      };
    }
  };

  const content = getContent();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full transform animate-slideUp">
        <div className={`bg-gradient-to-r ${content.bgColor} p-6 rounded-t-3xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {content.icon}
              <h3 className="text-xl font-bold text-white">{content.title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">
            {content.message}
          </p>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {content.dateInfo}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationDateModal;