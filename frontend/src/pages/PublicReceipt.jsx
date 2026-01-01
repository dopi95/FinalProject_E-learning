import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, CheckCircle } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { paymentAPI } from '../services/api';

const PublicReceipt = () => {
  const [searchParams] = useSearchParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const receiptRef = useRef();

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const txRef = searchParams.get('tx_ref');
        if (!txRef) {
          setError('Invalid receipt link');
          return;
        }

        const response = await paymentAPI.getPublicReceipt(txRef);
        setReceipt(response.data.data);
      } catch (error) {
        setError('Receipt not found');
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [searchParams]);

  const downloadPDF = () => {
    if (!receipt || !receiptRef.current) return;

    const element = receiptRef.current;
    const opt = {
      margin: 0.5,
      filename: `receipt-${receipt.receiptNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Receipt Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div ref={receiptRef} className="bg-white rounded-2xl shadow-2xl overflow-hidden relative">
          {/* Diagonal PAID stamp */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 text-8xl font-bold text-green-500/30 pointer-events-none z-10">
            PAID
          </div>
          
          {/* Payment method stamp */}
          <div className="absolute top-6 right-6 z-20 text-center">
            <img 
              src={`/assets/images/${receipt.paymentMethod === 'telebirr' ? 'telebirrlogo.png' : 'cbe.png'}`} 
              alt={receipt.paymentMethod}
              className="w-10 h-10 object-contain mx-auto mb-1"
            />
            <p className="text-xs font-bold text-gray-600 uppercase">
              {receipt.paymentMethod === 'telebirr' ? 'Telebirr' : 'CBE'}
            </p>
          </div>
          
          {/* Header */}
          <div className="border-b-2 border-black p-10 text-center bg-white">
            <img src="/assets/images/aaulogo.png" alt="AAU Logo" className="h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-black mb-1">AAU E-Learning</h1>
            <p className="text-gray-600 mb-4">Addis Ababa University</p>
            <div className="text-right text-sm text-gray-500">Receipt No: {receipt.receiptNumber}</div>
          </div>
          
          {/* Body */}
          <div className="p-10">
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
              <div>
                <h3 className="text-lg font-bold text-black mb-4 border-b border-gray-300 pb-2">Student Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="text-black font-medium">{receipt.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-black font-medium">{receipt.user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Student ID:</span>
                    <span className="text-black font-medium">{receipt.user.systemId || receipt.user._id.slice(-8).toUpperCase()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-black mb-4 border-b border-gray-300 pb-2">Payment Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="text-black font-medium">{new Date(receipt.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="text-black font-medium capitalize">{receipt.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="text-black font-medium">{receipt.transactionId}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Course Details */}
            <div className="mb-10">
              <h3 className="text-lg font-bold text-black mb-4 border-b border-gray-300 pb-2">
                {receipt.isBulk ? 'Courses Details' : 'Course Details'}
              </h3>
              {receipt.isBulk ? (
                <div className="space-y-4">
                  {receipt.courses.map((course, index) => (
                    <div key={course._id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-bold text-black mb-2">{course.title}</h4>
                          <p className="text-gray-600 mb-2">Instructor: {course.instructor?.name || 'Instructor'}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-black">{course.price} ETB</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-bold text-black mb-2">{receipt.course.title}</h4>
                      <p className="text-gray-600 mb-2">Instructor: {receipt.course.instructor?.name || 'Instructor'}</p>
                      <p className="text-sm text-gray-500">Certificate of Completion Included</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-black">{receipt.amount} ETB</div>
                      <div className="text-sm text-gray-500">One-time payment</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Summary */}
            <div className="bg-gray-50 p-6 rounded-lg mb-10">
              <div className="flex justify-between mb-4">
                <span>Subtotal:</span>
                <span>{receipt.amount} ETB</span>
              </div>
              <div className="flex justify-between mb-4">
                <span>Tax:</span>
                <span>0.00 ETB</span>
              </div>
              <div className="border-t border-gray-300 pt-4 flex justify-between font-bold">
                <span className="text-xl">Total Paid:</span>
                <span className="text-2xl">{receipt.amount} ETB</span>
              </div>
            </div>
            
            {/* Download Button */}
            <div className="text-center mb-6">
              <button
                onClick={downloadPDF}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 mx-auto"
              >
                <Download className="h-5 w-5" />
                Download Receipt
              </button>
            </div>
            
            {/* Footer */}
            <div className="border-t border-gray-300 pt-10 text-center text-sm text-gray-500">
              <p>Thank you for choosing AAU E-Learning Platform!</p>
              <p>For support, contact us at support@aau-elearning.edu.et</p>
              <p className="mt-4 text-xs">This is an official receipt generated on {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicReceipt;