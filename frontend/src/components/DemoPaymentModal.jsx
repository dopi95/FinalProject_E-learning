import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Phone, CheckCircle } from 'lucide-react';
import { paymentAPI } from '../services/api';

const DemoPaymentModal = ({ isVisible, onClose, paymentMethod, courseId }) => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isVisible) return null;

  const isTelebirr = paymentMethod === 'telebirr';
  const isCBE = paymentMethod === 'cbe';
  const methodName = isTelebirr ? 'Telebirr' : 'CBE Birr';
  const logo = isTelebirr ? '/assets/images/telebirrlogo.png' : '/assets/images/cbe.png';

  const handleChange = (e) => {
    const val = e.target.value;
    if (/^\d{0,8}$/.test(val)) {
      setPhoneNumber(val);
      setError('');
    }
  };

  const validate = () => {
    if (!phoneNumber || phoneNumber.length !== 8) {
      setError('Please enter a valid 8-digit phone number (e.g. 91234567)');
      return false;
    }
    if (!/^\d{8}$/.test(phoneNumber)) {
      setError('Phone number must contain digits only');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validate()) return;
    setError('');
    setProcessing(true);
    try {
      const response = await paymentAPI.initializePayment({ courseId, paymentMethod });
      if (response.data.success) {
        setTimeout(async () => {
          try {
            await paymentAPI.verifyPayment(response.data.data.tx_ref);
            setProcessing(false);
            setShowSuccess(true);
            setTimeout(() => {
              navigate(`/payment/success?tx_ref=${response.data.data.tx_ref}&status=success`);
            }, 3000);
          } catch {
            setProcessing(false);
            setError('Payment verification failed. Please try again.');
          }
        }, 2000);
      }
    } catch {
      setProcessing(false);
      setError('Payment failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 max-w-md w-full relative">
        {!showSuccess && (
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="h-6 w-6" />
          </button>
        )}

        {showSuccess ? (
          <div className="text-center">
            <div className="animate-bounce mb-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🎉 Payment Successful! 🎉</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Congratulations! You have successfully enrolled in the course.</p>
            <div className="animate-pulse text-blue-600 dark:text-blue-400">Redirecting to receipt...</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <img src={logo} alt={methodName} className="w-10 h-10 object-contain" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{methodName} Payment</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Enter your phone number to complete payment</p>
            </div>

            {/* Phone input — identical style for both */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center gap-1 pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">+251 9</span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={phoneNumber}
                  onChange={handleChange}
                  placeholder="12345678"
                  maxLength={8}
                  className={`w-full pl-24 pr-4 py-3 border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'} rounded-xl focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm`}
                />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Enter the 8 digits after +251 9 (e.g. 12345678)</p>
              {error && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Full number preview */}
            {phoneNumber.length > 0 && (
              <div className="mb-4 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                Full number: <span className="font-semibold text-gray-900 dark:text-white">+251 9{phoneNumber}</span>
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={processing || phoneNumber.length !== 8}
              className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
                processing || phoneNumber.length !== 8
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
              }`}
            >
              {processing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing Payment...
                </div>
              ) : (
                `Pay with ${methodName}`
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DemoPaymentModal;
