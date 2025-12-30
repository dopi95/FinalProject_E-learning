import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const RoleBasedModal = ({ isVisible, onClose, userRole }) => {
  const { t } = useTranslation();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-orange-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Enrollment Restricted
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              Course enrollment is restricted to students only.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your current role: <span className="font-semibold capitalize text-blue-600 dark:text-blue-400">{userRole}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              You can still star courses to show your interest and support.
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedModal;