import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DemoPaymentModal from '../components/DemoPaymentModal';
import { ArrowLeft, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { courseAPI, paymentAPI } from '../services/api';
import { getUserData } from '../utils/userUtils';

const PaymentPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [course, setCourse] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentInput, setShowPaymentInput] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const user = getUserData();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCourse();
  }, [courseId, user, navigate]);

  const fetchCourse = async () => {
    try {
      const response = await courseAPI.getCourse(courseId);
      setCourse(response.data.course);
    } catch (error) {
      setError('Course not found');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const response = await paymentAPI.initializePayment({
        courseId,
        paymentMethod: selectedMethod
      });

      if (response.data.success) {
        // For demo, show payment input modal instead of redirecting
        setShowPaymentInput(true);
      } else {
        setError('Payment initialization failed');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Course Not Found</h2>
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button 
            onClick={() => navigate(`/course/${courseId}`)}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-8 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Course
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Course Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Course Summary</h2>
              
              <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
                <img 
                  src={course?.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400'} 
                  alt={course?.title}
                  className="w-full sm:w-20 h-48 sm:h-20 object-cover rounded-xl flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg mb-2 leading-tight">
                    {course?.title}
                  </h3>
                  <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    <p className="break-words overflow-hidden">
                      <span className="line-clamp-3 sm:line-clamp-4">
                        {course?.description}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
                  <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Course Price:</span>
                  <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {course?.price} ETB
                  </span>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 sm:p-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words">Lifetime Access</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words">Certificate of Completion</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words">30-day Money Back Guarantee</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Payment Method</h2>
              
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {/* Telebirr */}
                <div 
                  className={`border-2 rounded-xl p-3 sm:p-4 cursor-pointer transition-all ${
                    selectedMethod === 'telebirr' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedMethod('telebirr')}
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <img 
                      src="/assets/images/telebirrlogo.png" 
                      alt="Telebirr"
                      className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Telebirr</h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 break-words">Pay with Telebirr mobile wallet</p>
                    </div>
                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex-shrink-0 ${
                      selectedMethod === 'telebirr' 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {selectedMethod === 'telebirr' && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                  </div>
                </div>

                {/* CBE */}
                <div 
                  className={`border-2 rounded-xl p-3 sm:p-4 cursor-pointer transition-all ${
                    selectedMethod === 'cbe' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedMethod('cbe')}
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <img 
                      src="/assets/images/cbe.png" 
                      alt="CBE"
                      className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">CBE Birr</h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 break-words">Pay with CBE Birr mobile wallet</p>
                    </div>
                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex-shrink-0 ${
                      selectedMethod === 'cbe' 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {selectedMethod === 'cbe' && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-center mb-2">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">Secure Payment</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 break-words leading-relaxed">
                  Your payment information is encrypted and secure. We use industry-standard security measures.
                </p>
              </div>

              {/* Pay Button */}
              <button 
                onClick={handlePayment}
                disabled={!selectedMethod || processing}
                className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-2xl font-semibold text-base sm:text-lg transition-all ${
                  selectedMethod && !processing
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <CreditCard className="inline h-5 w-5 mr-2" />
                    Pay {course?.price} ETB
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      <DemoPaymentModal
        isVisible={showPaymentInput}
        onClose={() => setShowPaymentInput(false)}
        paymentMethod={selectedMethod}
        courseId={courseId}
      />

      <Footer />
    </div>
  );
};

export default PaymentPage;