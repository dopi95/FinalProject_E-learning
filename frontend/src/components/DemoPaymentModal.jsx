import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CreditCard, Phone, CheckCircle } from 'lucide-react';
import { paymentAPI } from '../services/api';

const DemoPaymentModal = ({ isVisible, onClose, paymentMethod, courseId }) => {
  const navigate = useNavigate();
  const [accountNumber, setAccountNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isVisible) return null;

  const handlePayment = async () => {
    if (!accountNumber) {
      alert('Please enter your account/phone number');
      return;
    }

    setProcessing(true);

    try {
      // Initialize payment
      const response = await paymentAPI.initializePayment({
        courseId,
        paymentMethod
      });

      if (response.data.success) {
        // Simulate payment processing
        setTimeout(async () => {
          try {
            // Verify payment
            await paymentAPI.verifyPayment(response.data.data.tx_ref);
            setProcessing(false);
            setShowSuccess(true);
            
            // Redirect to success page after animation
            setTimeout(() => {
              navigate(`/payment/success?tx_ref=${response.data.data.tx_ref}&status=success`);
            }, 3000);
          } catch (error) {
            setProcessing(false);
            alert('Payment verification failed');
          }
        }, 2000);
      }
    } catch (error) {
      setProcessing(false);
      alert('Payment failed');
    }
  };

  const getPlaceholder = () => {
    return paymentMethod === 'telebirr' ? 'Enter phone number (e.g., 0911234567)' : 'Enter account number';
  };

  const getIcon = () => {
    return paymentMethod === 'telebirr' ? <Phone className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />;
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
              Congratulations! You have successfully enrolled in the course.
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
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {getIcon()}
                </div>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder={getPlaceholder()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
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

export default DemoPaymentModal;