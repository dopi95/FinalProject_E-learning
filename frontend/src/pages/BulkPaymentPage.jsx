import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CreditCard, ArrowLeft, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BulkPaymentModal from '../components/BulkPaymentModal';
import { courseAPI } from '../services/api';
import { getUserData } from '../utils/userUtils';

const BulkPaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('telebirr');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const user = getUserData();

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login');
      return;
    }

    const courseIds = searchParams.get('courses');
    if (!courseIds) {
      navigate('/courses');
      return;
    }

    fetchCourses(courseIds.split(','));
  }, [user, navigate, searchParams]);

  const fetchCourses = async (courseIds) => {
    try {
      const coursePromises = courseIds.map(id => courseAPI.getCourse(id));
      const responses = await Promise.all(coursePromises);
      const coursesData = responses.map(response => response.data.course);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const getTotalPrice = () => {
    return courses.reduce((total, course) => total + course.price, 0);
  };

  const handlePayment = () => {
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }
    setShowPaymentModal(true);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Complete Your Enrollment
            </h1>

            {/* Course Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Selected Courses ({courses.length})
              </h2>
              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center gap-4">
                      <img
                        src={course.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=80'}
                        alt={course.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{course.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Instructor: {course.instructor?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {course.price} ETB
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="text-gray-900 dark:text-white">{getTotalPrice()} ETB</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                <span className="text-gray-900 dark:text-white">0.00 ETB</span>
              </div>
              <div className="border-t border-blue-200 dark:border-blue-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">Total:</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {getTotalPrice()} ETB
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Payment Method
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  paymentMethod === 'telebirr' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-600'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="telebirr"
                    checked={paymentMethod === 'telebirr'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <img src="/assets/images/telebirrlogo.png" alt="Telebirr" className="w-8 h-8 mr-3" />
                  <span className="font-medium text-gray-900 dark:text-white">Telebirr</span>
                  {paymentMethod === 'telebirr' && <CheckCircle className="h-5 w-5 text-blue-500 ml-auto" />}
                </label>

                <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  paymentMethod === 'cbe' 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-600'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cbe"
                    checked={paymentMethod === 'cbe'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <img src="/assets/images/cbe.png" alt="CBE" className="w-8 h-8 mr-3" />
                  <span className="font-medium text-gray-900 dark:text-white">CBE Birr</span>
                  {paymentMethod === 'cbe' && <CheckCircle className="h-5 w-5 text-blue-500 ml-auto" />}
                </label>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              <CreditCard className="h-6 w-6" />
              Pay {getTotalPrice()} ETB
            </button>
          </div>
        </div>
      </main>

      <BulkPaymentModal
        isVisible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentMethod={paymentMethod}
        courseIds={courses.map(c => c._id)}
      />

      <Footer />
    </div>
  );
};

export default BulkPaymentPage;