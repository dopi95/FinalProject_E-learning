import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginRequiredModal from '../components/LoginRequiredModal';
import RoleBasedModal from '../components/RoleBasedModal';
import RegistrationDateModal from '../components/RegistrationDateModal';
import Toast from '../components/Toast';
import { ArrowLeft, Star, Users, Clock, PlayCircle, CheckCircle, Globe, Award, User, Heart, MessageCircle } from 'lucide-react';
import { getUserData } from '../utils/userUtils';
import { courseAPI, enrollmentAPI, categoryAPI } from '../services/api';
import CommentSection from '../components/CommentSection';

const CourseDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [starredCourses, setStarredCourses] = useState(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalActionType, setModalActionType] = useState('subscribe');
  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationModalType, setRegistrationModalType] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [likingCourse, setLikingCourse] = useState(false);

  useEffect(() => {
    const userData = getUserData();
    setUser(userData);
    fetchCourse();
    fetchCategories();
    if (userData) {
      checkEnrollmentStatus();
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      checkEnrollmentStatus();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

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
      setModalMessage('Please login or create an account to like courses.');
      setModalActionType('like');
      setShowLoginModal(true);
      return;
    }
    
    if (likingCourse) {
      return;
    }
    
    setLikingCourse(true);
    
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
    } finally {
      setLikingCourse(false);
    }
  };

  const handleEnroll = () => {
    console.log('Enroll button clicked!'); // Debug log
    console.log('User:', user); // Debug log
    console.log('Course ID:', course?._id); // Debug log
    
    if (!isLoggedIn) {
      setModalMessage('Please login or create an account to enroll in this course.');
      setModalActionType('enroll');
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
    
    // Check registration dates FIRST - block if invalid
    if (course.startDate || course.endDate) {
      const now = new Date();
      const startDate = course.startDate ? new Date(course.startDate) : null;
      const endDate = course.endDate ? new Date(course.endDate) : null;
      
      if (startDate && now < startDate) {
        setRegistrationModalType('not_started');
        setShowRegistrationModal(true);
        return; // STOP HERE - don't go to payment
      }
      
      if (endDate) {
        // Set end date to end of day for comparison
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (now > endOfDay) {
          setRegistrationModalType('closed');
          setShowRegistrationModal(true);
          return;
        }
      }
    }
    
    // Only proceed to payment if dates are valid
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

  const handleShowComments = () => {
    setShowComments(true);
  };

  const handleCommentAdded = () => {
    fetchCourse();
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
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
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                        {categories.find(cat => cat.slug === course.category)?.name || course.category}
                      </span>
                      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        {(() => {
                          if (!course.startDate && !course.endDate) {
                            return <span className="text-sm font-semibold text-green-600 dark:text-green-400">Active</span>;
                          }
                          const now = new Date();
                          const startDate = course.startDate ? new Date(course.startDate) : null;
                          const endDate = course.endDate ? new Date(course.endDate) : null;
                          
                          if (startDate && now < startDate) {
                            return <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">Not Started</span>;
                          } else if (endDate) {
                            const endOfDay = new Date(endDate);
                            endOfDay.setHours(23, 59, 59, 999);
                            if (now > endOfDay) {
                              return <span className="text-sm font-semibold text-red-600 dark:text-red-400">Closed</span>;
                            }
                          }
                          return <span className="text-sm font-semibold text-green-600 dark:text-green-400">Active</span>;
                        })()
                        }
                      </div>
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                    <p className="break-words whitespace-pre-wrap">
                      {course.description}
                    </p>
                  </div>
                  
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
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <button 
                        onClick={() => handleStarLike(course._id)}
                        disabled={likingCourse}
                        className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Heart 
                          className={`h-5 w-5 transition-colors ${
                            course.stars?.some(star => star._id === user?.id)
                              ? 'text-red-500 fill-current' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`} 
                        />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {course.stars?.length || 0}
                        </span>
                      </button>
                      <button 
                        onClick={handleShowComments}
                        className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
                      >
                        <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {course.commentCount || 0}
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
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-4 sm:p-8 mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">{t('courses.aboutCourse')}</h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base break-words whitespace-pre-wrap overflow-hidden">
                      {course.about || course.description}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 sticky top-24">
                  <div className="text-center mb-4 sm:mb-6">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {course.price} {t('courses.birr')}
                    </div>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{t('courses.oneTimePayment')}</p>
                  </div>

                  <button 
                    onClick={handleEnroll}
                    disabled={enrollmentLoading}
                    className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 mb-4 sm:mb-6 transition-all duration-300 ${
                      isEnrolled 
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                    } ${enrollmentLoading ? 'opacity-50 cursor-not-allowed' : ''} ${
                      user?.role === 'instructor' || user?.role === 'superadmin' || user?.role === 'admin' ? 'hidden' : ''
                    }`}
                  >
                    {enrollmentLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Loading...
                      </div>
                    ) : isEnrolled ? (
                      t('courses.goToCourse')
                    ) : (
                      t('courses.enrollNow')
                    )}
                  </button>

                  {isEnrolled && (
                    <div className="mb-4 sm:mb-6 flex items-center justify-center text-green-600 dark:text-green-400 text-sm font-medium">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t('courses.registered')}
                    </div>
                  )}

                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{t('courses.courseIncludes')}</h3>
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm break-words">{t('courses.lifetimeAccess')}</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm break-words">{t('courses.certificate')}</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm break-words">{t('courses.instructorSupport')}</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm break-words">{t('courses.mobileAccess')}</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm break-words">{t('courses.moneyBack')}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4 flex-shrink-0" />
                      <span>Online</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                      <span>Certificate included</span>
                    </div>
                  </div>

                  {/* Course Dates Information */}
                  {(course.startDate || course.endDate) && (
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3">{t('courses.registrationPeriod')}:</h4>
                      <div className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        {course.startDate && (
                          <div className="flex flex-col sm:flex-row sm:items-center">
                            <span className="font-medium mr-0 sm:mr-2 mb-1 sm:mb-0">{t('courses.start')}:</span>
                            <span className="break-words">{new Date(course.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                        )}
                        {course.endDate && (
                          <div className="flex flex-col sm:flex-row sm:items-center">
                            <span className="font-medium mr-0 sm:mr-2 mb-1 sm:mb-0">{t('courses.end')}:</span>
                            <span className="break-words">{new Date(course.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                        )}
                        {course.endDate && (
                          <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500">
                            <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 font-medium break-words">
                              {t('courses.deadlineNote', { date: new Date(course.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}


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
        actionType={modalActionType}
      />
      
      {/* Role Based Modal */}
      <RoleBasedModal
        isVisible={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        userRole={user?.role}
      />

      {/* Registration Date Modal */}
      <RegistrationDateModal
        isVisible={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        type={registrationModalType}
        startDate={course?.startDate}
        endDate={course?.endDate}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={hideToast}
      />

      <CommentSection
        courseId={course?._id}
        isVisible={showComments}
        onClose={() => setShowComments(false)}
        onCommentAdded={handleCommentAdded}
      />

      <Footer />
    </div>
  );
};

export default CourseDetail;