import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import html2pdf from 'html2pdf.js';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CheckCircle, Download, Share2, Calendar, CreditCard, User, BookOpen, Award } from 'lucide-react';
import { paymentAPI } from '../services/api';
import { getUserData } from '../utils/userUtils';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const receiptRef = useRef();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = getUserData();

  const txRef = searchParams.get('tx_ref');
  const status = searchParams.get('status');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (status === 'success' && txRef) {
      verifyPayment();
    } else {
      setError('Payment verification failed');
      setLoading(false);
    }
  }, [txRef, status, user, navigate]);

  const verifyPayment = async () => {
    try {
      const response = await paymentAPI.verifyPayment(txRef);
      if (response.data.success) {
        setPayment(response.data.data.payment);
      } else {
        setError('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setError('Payment verification failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = () => {
    const element = receiptRef.current;
    const opt = {
      margin: 1,
      filename: `receipt-${payment.receiptNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const shareReceipt = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Course Enrollment Receipt',
          text: `I just enrolled in ${payment.course.title} at AAU E-Learning!`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Receipt link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Verifying payment...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-red-100 dark:bg-red-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 dark:text-red-400 text-2xl">✕</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Payment Failed</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
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
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="bg-green-100 dark:bg-green-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              You have successfully enrolled in the course. Welcome aboard!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button 
              onClick={downloadReceipt}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Receipt
            </button>
            <button 
              onClick={shareReceipt}
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
            >
              <Share2 className="h-5 w-5 mr-2" />
              Share Receipt
            </button>
            <button 
              onClick={() => navigate('/student-dashboard')}
              className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Go to Dashboard
            </button>
          </div>

          {/* Receipt */}
          <div ref={receiptRef} className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
            {/* Receipt Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8">
              <div className="flex items-center justify-between">
                <div>
                  <img 
                    src="/assets/images/aaulogo.png" 
                    alt="AAU Logo"
                    className="h-12 w-auto mb-4"
                  />
                  <h2 className="text-2xl font-bold">AAU E-Learning Platform</h2>
                  <p className="text-blue-100">Addis Ababa University</p>
                </div>
                <div className="text-right">
                  <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-2">
                    PAID
                  </div>
                  <p className="text-blue-100 text-sm">Receipt #{payment?.receiptNumber}</p>
                </div>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Student Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Student Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Name:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{payment?.user.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Email:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{payment?.user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Student ID:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{payment?.user._id.slice(-8).toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Payment Date:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {new Date(payment?.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                      <span className="text-gray-900 dark:text-white font-medium capitalize">
                        {payment?.paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Transaction ID:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {payment?.transactionId || payment?.chapaReference}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Information */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Course Details
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={payment?.course.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400'} 
                      alt={payment?.course.title}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                        {payment?.course.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                        Instructor: {payment?.course.instructor?.name}
                      </p>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Award className="h-4 w-4 mr-1" />
                        <span>Certificate of Completion Included</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {payment?.amount} ETB
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        One-time payment
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="text-gray-900 dark:text-white">{payment?.amount} ETB</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                    <span className="text-gray-900 dark:text-white">0.00 ETB</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Paid:</span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {payment?.amount} ETB
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  <p className="mb-2">Thank you for choosing AAU E-Learning Platform!</p>
                  <p>For support, contact us at support@aau-elearning.edu.et</p>
                  <p className="mt-4 text-xs">
                    This is an official receipt generated on {new Date().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;