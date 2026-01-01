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
    const shareUrl = `${window.location.origin}/receipt?tx_ref=${txRef}&status=success`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Course Enrollment Receipt',
          text: `I just enrolled in ${payment.course.title} at AAU E-Learning!`,
          url: shareUrl
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
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
              onClick={() => navigate('/student-dashboard')}
              className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Go to Dashboard
            </button>
          </div>

          {/* Receipt */}
          <div ref={receiptRef} className="bg-white shadow-lg max-w-2xl mx-auto relative">
            {/* Diagonal PAID Stamp */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="transform -rotate-45 text-green-600 text-6xl font-bold opacity-30">
                PAID
              </div>
            </div>

            {/* Payment Method Stamp */}
            <div className="absolute top-4 right-4 z-20">
              <div className="rounded-full p-4 text-center w-20 h-20 flex flex-col items-center justify-center">
                <img 
                  src={payment?.paymentMethod === 'telebirr' ? '/assets/images/telebirrlogo.png' : '/assets/images/cbe.png'}
                  alt={payment?.paymentMethod}
                  className="w-8 h-8 object-contain mb-1"
                />
                <p className="text-xs font-bold text-gray-700 uppercase leading-none">
                  {payment?.paymentMethod === 'telebirr' ? 'Telebirr' : 'CBE'}
                </p>
              </div>
            </div>
            {/* Receipt Header */}
            <div className="border-b-2 border-gray-900 p-8">
              <div className="text-center">
                <img 
                  src="/assets/images/aaulogo.png" 
                  alt="AAU Logo"
                  className="h-16 w-auto mx-auto mb-4"
                />
                <h1 className="text-2xl font-bold text-gray-900 mb-1">AAU E-Learning</h1>
                <p className="text-gray-700 mb-4">Addis Ababa University</p>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Receipt No: {payment?.receiptNumber}</p>
                </div>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Student Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                    Student Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="text-gray-900 font-medium">{payment?.user.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="text-gray-900 font-medium">{payment?.user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Student ID:</span>
                      <span className="text-gray-900 font-medium">{payment?.user._id.slice(-8).toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                    Payment Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="text-gray-900 font-medium">
                        {new Date(payment?.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method:</span>
                      <span className="text-gray-900 font-medium capitalize">
                        {payment?.paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="text-gray-900 font-medium">
                        {payment?.transactionId || payment?.chapaReference}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Information */}
              <div className="border-t border-gray-300 pt-8 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                  Course Details
                </h3>
                <div className="bg-gray-50 p-6 rounded">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1 mb-4 md:mb-0">
                      <h4 className="font-bold text-gray-900 text-lg mb-2">
                        {payment?.course.title}
                      </h4>
                      <p className="text-gray-600 mb-2">
                        Instructor: {payment?.course.instructor?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Certificate of Completion Included
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {payment?.amount} ETB
                      </div>
                      <div className="text-sm text-gray-600">
                        One-time payment
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="border-t border-gray-300 pt-8">
                <div className="bg-gray-50 p-6 rounded">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">{payment?.amount} ETB</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Tax:</span>
                    <span className="text-gray-900">0.00 ETB</span>
                  </div>
                  <div className="border-t border-gray-300 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">Total Paid:</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {payment?.amount} ETB
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-300 pt-8 mt-8">
                <div className="text-center text-sm text-gray-600">
                  <p className="mb-2">Thank you for choosing AAU E-Learning Platform!</p>
                  <p>For support, contact us at support@aau-elearning.edu.et</p>
                  <p className="mt-4 text-xs">
                    This is an official receipt generated on {new Date().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button 
              onClick={downloadReceipt}
              className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
              title="Download Receipt"
            >
              <Download className="h-5 w-5" />
            </button>
            <button 
              onClick={shareReceipt}
              className="flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-lg"
              title="Share Receipt"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;