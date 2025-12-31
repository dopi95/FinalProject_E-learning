import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginRequiredModal from '../components/LoginRequiredModal';
import RoleBasedModal from '../components/RoleBasedModal';
import Toast from '../components/Toast';
import { ArrowLeft, Star, Users, Clock, PlayCircle, CheckCircle, Globe, Award, User } from 'lucide-react';
import { getUserData } from '../utils/userUtils';
import { courseAPI, enrollmentAPI } from '../services/api';

const CourseDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [starredCourses, setStarredCourses] = useState(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const userData = getUserData();
    setUser(userData);
    fetchCourse();
    if (userData) {
      checkEnrollmentStatus();
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      checkEnrollmentStatus();
    }
  }, [user]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getCourse(id);
      setCourse(response.data.course);
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Course not found');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      setEnrollmentLoading(true);
      const response = await enrollmentAPI.checkEnrollment(id);
      setIsEnrolled(response.data.data.isEnrolled);
    } catch (error) {
      console.error('Error checking enrollment:', error);
      setIsEnrolled(false);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  const isLoggedIn = !!user;

  const handleStarLike = async (courseId) => {
    if (!isLoggedIn) {
      setModalMessage('Please login to star courses');
      setShowLoginModal(true);
      return;
    }
    
    try {
      const response = await courseAPI.starCourse(courseId);
      
      // Update the course state to reflect the change
      setCourse(prevCourse => ({
        ...prevCourse,
        stars: response.data.isStarred 
          ? [...prevCourse.stars, { _id: user.id, name: user.name, profileImage: user.profileImage }]
          : prevCourse.stars.filter(star => star._id !== user.id)
      }));
    } catch (error) {
      console.error('Error starring course:', error);
    }
  };

  const handleEnroll = () => {
    console.log('Enroll button clicked!'); // Debug log
    console.log('User:', user); // Debug log
    console.log('Course ID:', course?._id); // Debug log
    
    showToast('Processing enrollment...', 'info');
    
    if (!isLoggedIn) {
      setModalMessage('Please login to enroll in courses');
      setShowLoginModal(true);
      return;
    }
    
    if (user.role !== 'student') {
      setShowRoleModal(true);
      return;
    }
    
    if (isEnrolled) {
      // Already enrolled, go to dashboard
      navigate('/student-dashboard?tab=courses');
      return;
    }
    
    // Redirect to payment page
    console.log('Redirecting to payment page...'); // Debug log
    showToast('Redirecting to payment...', 'success');
    setTimeout(() => navigate(`/payment/${course._id}`), 1000);
  };

  const handleBackToCourses = () => {
    navigate('/');
    setTimeout(() => {
      const coursesSection = document.getElementById('courses-section');
      if (coursesSection) {
        coursesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  };



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button 
            onClick={handleBackToCourses}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-8 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t('courses.backToCourses')}
          </button>

          {loading ? (
            // Loading skeleton
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 mb-8 animate-pulse">
                  <div className="w-full h-64 bg-gray-300 dark:bg-gray-600 rounded-2xl mb-6"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-6"></div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 animate-pulse">
                  <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded mb-6"></div>
                  <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded mb-6"></div>
                </div>
              </div>
            </div>
          ) : error ? (
            // Error state
            <div className="text-center py-12">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Course Not Found</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">The course you're looking for doesn't exist or has been removed.</p>
                <button 
                  onClick={handleBackToCourses}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Back to Courses
                </button>
              </div>
            </div>
          ) : course ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Course Header */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-4 sm:p-8 mb-8">
                  <img 
                    src={course.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800'} 
                    alt={course.title}
                    className="w-full h-48 sm:h-64 object-cover rounded-2xl mb-4 sm:mb-6"
                  />
                  <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 leading-tight">
                    {course.title}
                  </h1>
                  <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                    {course.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 border-3 border-blue-100 dark:border-blue-900 overflow-hidden">
                        {course.instructor?.profileImage ? (
                          <img 
                            src={course.instructor.profileImage} 
                            alt={course.instructor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                            <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{course.instructor?.name || 'Instructor'}</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('courses.instructor')}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-start sm:space-x-6">
                      <button 
                        onClick={() => handleStarLike(course._id)}
                        className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
                      >
                        <Star 
                          className={`h-5 w-5 transition-colors ${
                            course.stars?.some(star => star._id === user?.id)
                              ? 'text-yellow-500 fill-current' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`} 
                        />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {course.stars?.length || 0}
                        </span>
                      </button>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        <span className="text-sm sm:text-base">{course.students?.length || 0} {t('courses.students')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Description */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('courses.aboutCourse')}</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {course.about || course.description}
                  </p>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 sticky top-24">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {course.price} Birr
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">{t('courses.oneTimePayment')}</p>
                  </div>

                  <button 
                    onClick={handleEnroll}
                    disabled={enrollmentLoading}
                    className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 mb-6 transition-all duration-300 ${
                      isEnrolled 
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                    } ${enrollmentLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {enrollmentLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Loading...
                      </div>
                    ) : isEnrolled ? (
                      'Go to Course'
                    ) : (
                      t('courses.enrollNow')
                    )}
                  </button>

                  {isEnrolled && (
                    <div className="mb-6 flex items-center justify-center text-green-600 dark:text-green-400 text-sm font-medium">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Registered
                    </div>
                  )}

                  <div className="space-y-4 mb-6">
                    <h3 className="font-bold text-gray-900 dark:text-white">{t('courses.courseIncludes')}</h3>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300 text-sm">{t('courses.lifetimeAccess')}</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300 text-sm">{t('courses.certificate')}</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300 text-sm">{t('courses.instructorSupport')}</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300 text-sm">{t('courses.mobileAccess')}</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300 text-sm">{t('courses.moneyBack')}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-1" />
                      <span>Online</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-1" />
                      <span>{t('courses.certificateText')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {/* Login Required Modal */}
      <LoginRequiredModal
        isVisible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message={modalMessage}
      />
      
      {/* Role Based Modal */}
      <RoleBasedModal
        isVisible={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        userRole={user?.role}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={hideToast}
      />

      <Footer />
    </div>
  );
};

export default CourseDetail;