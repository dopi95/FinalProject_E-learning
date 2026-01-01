import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, CheckCircle } from 'lucide-react';
import { paymentAPI } from '../services/api';

const PublicReceipt = () => {
  const [searchParams] = useSearchParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const downloadPDF = async () => {
    if (!receipt) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Payment Receipt - ${receipt.receiptNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: white; }
          .receipt { max-width: 800px; margin: 0 auto; background: white; position: relative; }
          .diagonal-stamp { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 80px; font-weight: bold; color: rgba(34, 197, 94, 0.3); pointer-events: none; z-index: 10; }
          .payment-stamp { position: absolute; top: 20px; right: 20px; z-index: 20; text-align: center; }
          .payment-stamp img { width: 40px; height: 40px; object-fit: contain; margin-bottom: 5px; }
          .payment-stamp p { font-size: 12px; font-weight: bold; color: #374151; text-transform: uppercase; margin: 0; }
          .header { border-bottom: 2px solid #000; padding: 40px; text-align: center; }
          .header img { height: 64px; width: auto; margin-bottom: 16px; }
          .header h1 { font-size: 24px; font-weight: bold; color: #000; margin: 0 0 4px 0; }
          .header p { color: #374151; margin: 0 0 16px 0; }
          .receipt-no { text-align: right; font-size: 14px; color: #6b7280; }
          .body { padding: 40px; }
          .section { margin-bottom: 40px; }
          .section h3 { font-size: 18px; font-weight: bold; color: #000; margin-bottom: 16px; border-bottom: 1px solid #d1d5db; padding-bottom: 8px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .info-row span:first-child { color: #6b7280; }
          .info-row span:last-child { color: #000; font-weight: 500; }
          .course-details { background: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 40px; }
          .course-header { display: flex; justify-content: space-between; align-items: flex-start; }
          .course-info h4 { font-size: 18px; font-weight: bold; color: #000; margin: 0 0 8px 0; }
          .course-info p { color: #6b7280; margin: 0 0 8px 0; }
          .course-price { text-align: right; }
          .course-price .amount { font-size: 24px; font-weight: bold; color: #000; }
          .course-price .type { font-size: 14px; color: #6b7280; }
          .summary { background: #f9fafb; padding: 24px; border-radius: 8px; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 16px; }
          .summary-row.total { border-top: 1px solid #d1d5db; padding-top: 16px; font-weight: bold; }
          .summary-row.total .amount { font-size: 24px; }
          .footer { border-top: 1px solid #d1d5db; padding-top: 40px; margin-top: 40px; text-align: center; font-size: 14px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="diagonal-stamp">PAID</div>
          
          <div class="payment-stamp">
            <img src="${window.location.origin}/assets/images/${receipt.paymentMethod === 'telebirr' ? 'telebirrlogo.png' : 'cbe.png'}" alt="${receipt.paymentMethod}">
            <p>${receipt.paymentMethod === 'telebirr' ? 'Telebirr' : 'CBE'}</p>
          </div>
          
          <div class="header">
            <img src="${window.location.origin}/assets/images/aaulogo.png" alt="AAU Logo">
            <h1>AAU E-Learning</h1>
            <p>Addis Ababa University</p>
            <div class="receipt-no">Receipt No: ${receipt.receiptNumber}</div>
          </div>
          
          <div class="body">
            <div class="info-grid">
              <div class="section">
                <h3>Student Information</h3>
                <div class="info-row">
                  <span>Name:</span>
                  <span>${receipt.user.name}</span>
                </div>
                <div class="info-row">
                  <span>Email:</span>
                  <span>${receipt.user.email}</span>
                </div>
                <div class="info-row">
                  <span>Student ID:</span>
                  <span>${receipt.user.systemId || receipt.user._id.slice(-8).toUpperCase()}</span>
                </div>
              </div>
              
              <div class="section">
                <h3>Payment Information</h3>
                <div class="info-row">
                  <span>Date:</span>
                  <span>${new Date(receipt.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="info-row">
                  <span>Method:</span>
                  <span style="text-transform: capitalize;">${receipt.paymentMethod}</span>
                </div>
                <div class="info-row">
                  <span>Transaction ID:</span>
                  <span>${receipt.transactionId}</span>
                </div>
              </div>
            </div>
            
            <div class="section">
              <h3>Course Details</h3>
              <div class="course-details">
                <div class="course-header">
                  <div class="course-info">
                    <h4>${receipt.course.title}</h4>
                    <p>Instructor: ${receipt.course.instructor?.name || 'Instructor'}</p>
                    <p style="font-size: 14px; color: #6b7280;">Certificate of Completion Included</p>
                  </div>
                  <div class="course-price">
                    <div class="amount">${receipt.amount} ETB</div>
                    <div class="type">One-time payment</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="summary">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>${receipt.amount} ETB</span>
              </div>
              <div class="summary-row">
                <span>Tax:</span>
                <span>0.00 ETB</span>
              </div>
              <div class="summary-row total">
                <span style="font-size: 20px;">Total Paid:</span>
                <span class="amount">${receipt.amount} ETB</span>
              </div>
            </div>
            
            <div class="footer">
              <p>Thank you for choosing AAU E-Learning Platform!</p>
              <p>For support, contact us at support@aau-elearning.edu.et</p>
              <p style="margin-top: 16px; font-size: 12px;">This is an official receipt generated on ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${receipt.receiptNumber}.html`;
    link.click();
    
    URL.revokeObjectURL(url);
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
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden relative">
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