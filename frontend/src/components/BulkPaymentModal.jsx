import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CreditCard, Phone, CheckCircle } from 'lucide-react';
import { paymentAPI } from '../services/api';

const BulkPaymentModal = ({ isVisible, onClose, paymentMethod, courseIds }) => {
  const navigate = useNavigate();
  const [accountNumber, setAccountNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isVisible) return null;

  const handlePayment = async () => {
    if (paymentMethod === 'telebirr') {
      if (!accountNumber || accountNumber.length !== 8 || !/^\d{8}$/.test(accountNumber)) {
        setError('Incorrect phone number. Please enter a correct 8-digit number.');
        return;
      }
    } else if (paymentMethod === 'cbe') {
      if (!accountNumber || accountNumber.length !== 13 || !accountNumber.startsWith('1000') || !/^\d{13}$/.test(accountNumber)) {
        setError('Invalid account number. CBE account must be 13 digits starting with 1000.');
        return;
      }
    } else {
      if (!accountNumber) {
        setError('Please enter your account number');
        return;
      }
    }

    setError('');
    setProcessing(true);

    try {
      const response = await paymentAPI.initializeBulkPayment({
        courseIds,
        paymentMethod
      });

      if (response.data.success) {
        setTimeout(async () => {
          try {
            await paymentAPI.verifyPayment(response.data.data.tx_ref);
            setProcessing(false);
            setShowSuccess(true);
            
            setTimeout(() => {
              navigate(`/payment/success?tx_ref=${response.data.data.tx_ref}&status=success`);
            }, 3000);
          } catch (error) {
            setProcessing(false);
            setError('Payment verification failed');
          }
        }, 2000);
      }
    } catch (error) {
      setProcessing(false);
      setError('Payment failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full relative">
        {!showSuccess && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
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
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🎉 Payment Successful! 🎉
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Congratulations! You have successfully enrolled in all selected courses.
            </p>
            <div className="animate-pulse text-blue-600 dark:text-blue-400">
              Redirecting to receipt...
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <img 
                  src={paymentMethod === 'telebirr' ? '/assets/images/telebirrlogo.png' : '/assets/images/cbe.png'}
                  alt={paymentMethod}
                  className="w-10 h-10 object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {paymentMethod === 'telebirr' ? 'Telebirr Payment' : 'CBE Payment'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Enter your {paymentMethod === 'telebirr' ? 'phone number' : 'account number'} to complete payment
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {paymentMethod === 'telebirr' ? 'Phone Number' : 'Account Number'}
              </label>
              <div className="relative">
                {paymentMethod === 'telebirr' && (
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">+251 9</span>
                  </div>
                )}
                <div className={`absolute inset-y-0 ${paymentMethod === 'telebirr' ? 'left-16' : 'left-0'} pl-3 flex items-center pointer-events-none`}>
                  {paymentMethod === 'cbe' && <CreditCard className="h-5 w-5" />}
                </div>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (paymentMethod === 'telebirr') {
                      if (/^\d{0,8}$/.test(value)) {
                        setAccountNumber(value);
                        setError('');
                      }
                    } else if (paymentMethod === 'cbe') {
                      if (/^\d{0,13}$/.test(value)) {
                        setAccountNumber(value);
                        setError('');
                      }
                    } else {
                      setAccountNumber(value);
                      setError('');
                    }
                  }}
                  className={`w-full ${paymentMethod === 'telebirr' ? 'pl-20' : 'pl-10'} pr-4 py-3 border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                />
              </div>
              {error && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>

            <button
              onClick={handlePayment}
              disabled={processing || !accountNumber}
              className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
                processing || !accountNumber
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
              }`}
            >
              {processing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </div>
              ) : (
                'Complete Payment'
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BulkPaymentModal;