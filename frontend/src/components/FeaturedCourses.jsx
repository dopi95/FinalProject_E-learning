import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, Users, User, ArrowRight, CheckCircle, Heart, MessageCircle } from 'lucide-react';
import LoginRequiredModal from './LoginRequiredModal';
import RoleBasedModal from './RoleBasedModal';
import RegistrationDateModal from './RegistrationDateModal';
import CommentSection from './CommentSection';
import { courseAPI, enrollmentAPI, categoryAPI } from '../services/api';
import { getUserData } from '../utils/userUtils';

const FeaturedCourses = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState(new Set());
  const [user] = useState(getUserData());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalActionType, setModalActionType] = useState('subscribe');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationModalType, setRegistrationModalType] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  useEffect(() => {
    fetchFeaturedCourses();
    fetchCategories();
    if (user) {
      checkEnrollments();
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const checkEnrollments = async () => {
    try {
      const response = await enrollmentAPI.getMyCourses();
      const enrolled = new Set(response.data.courses.map(course => course._id));
      setEnrolledCourses(enrolled);
    } catch (error) {
      console.error('Error checking enrollments:', error);
    }
  };

  const fetchFeaturedCourses = async () => {
    try {
      const response = await courseAPI.getFeaturedCourses();
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Error fetching featured courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStarCourse = async (courseId) => {
    if (!user) {
      setModalMessage('Please login or create an account to like courses.');
      setModalActionType('like');
      setShowLoginModal(true);
      return;
    }
    
    try {
      const response = await courseAPI.starCourse(courseId);
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course._id === courseId 
            ? { 
                ...course, 
                stars: response.data.isStarred 
                  ? [...course.stars, { _id: user.id, name: user.name, profileImage: user.profileImage }]
                  : course.stars.filter(star => star._id !== user.id)
              }
            : course
        )
      );
    } catch (error) {
      console.error('Error starring course:', error);
    }
  };

  const handleEnroll = (courseId) => {
    if (!user) {
      setModalMessage('Please login or create an account to enroll in courses.');
      setModalActionType('enroll');
      setShowLoginModal(true);
      return;
    }
    
    if (user.role !== 'student') {
      setShowRoleModal(true);
      return;
    }
    
    if (enrolledCourses.has(courseId)) {
      navigate('/student-dashboard?tab=courses');
      return;
    }
    
    // Find the course to check registration dates
    const course = courses.find(c => c._id === courseId);
    if (course && (course.startDate || course.endDate)) {
      const now = new Date();
      const startDate = course.startDate ? new Date(course.startDate) : null;
      const endDate = course.endDate ? new Date(course.endDate) : null;
      
      if (startDate && now < startDate) {
        setSelectedCourse(course);
        setRegistrationModalType('not_started');
        setShowRegistrationModal(true);
        return;
      }
      
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (now > endOfDay) {
          setSelectedCourse(course);
          setRegistrationModalType('closed');
          setShowRegistrationModal(true);
          return;
        }
      }
    }
    
    navigate(`/payment/${courseId}`);
  };

  const handleShowComments = (courseId) => {
    setSelectedCourseId(courseId);
    setShowComments(true);
  };

  const handleCommentAdded = () => {
    fetchFeaturedCourses();
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('courses.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {t('courses.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden animate-pulse">
                <div className="h-56 bg-gray-300 dark:bg-gray-600"></div>
                <div className="p-8">
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-6"></div>
                  <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
              </div>
            ))
          ) : (
            courses.map(course => (
              <div key={course._id} className="group bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3">
                <div className="relative overflow-hidden">
                  <img 
                    src={course.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400'} 
                    alt={course.title} 
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{course.price} {t('courses.birr')}</span>
                  </div>
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {categories.find(cat => cat.slug === course.category)?.name || course.category}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full">
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
                
                <div className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {course.title}
                  </h3>
                  
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-full mr-3 overflow-hidden">
                      {course.instructor?.profileImage ? (
                        <img 
                          src={course.instructor.profileImage} 
                          alt={course.instructor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{course.instructor?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('courses.instructor')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-6">
                    <button 
                      onClick={() => handleStarCourse(course._id)}
                      className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                    >
                      <Heart 
                        className={`h-4 w-4 ${
                          course.stars?.some(star => star._id === user?.id)
                            ? 'text-red-500 fill-current' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`} 
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {course.stars?.length || 0}
                      </span>
                    </button>
                    <button 
                      onClick={() => handleShowComments(course._id)}
                      className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                    >
                      <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{course.commentCount || 0}</span>
                    </button>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">{course.students?.length || 0} Students</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    {user?.role !== 'instructor' && user?.role !== 'superadmin' && user?.role !== 'admin' && (
                      <button 
                        onClick={() => handleEnroll(course._id)}
                        className={`flex-1 py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ${
                          enrolledCourses.has(course._id)
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                        }`}
                      >
                        {enrolledCourses.has(course._id) ? t('courses.goToCourse') : t('courses.enrollNow')}
                      </button>
                    )}
                    <Link
                      to={`/course/${course._id}`}
                      className={`${user?.role === 'instructor' || user?.role === 'superadmin' || user?.role === 'admin' ? 'flex-1' : 'flex-1'} border-2 border-blue-600 text-blue-600 dark:text-blue-400 py-3 px-4 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 font-semibold text-center flex items-center justify-center`}
                    >
                      {t('courses.viewDetails')}
                    </Link>
                  </div>
                  
                  {enrolledCourses.has(course._id) && (
                    <div className="mt-3 flex items-center justify-center text-green-600 dark:text-green-400 text-sm font-medium">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t('courses.registered')}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-center">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {t('courses.browseAllCourses')}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <LoginRequiredModal
        isVisible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message={modalMessage}
        actionType={modalActionType}
      />
      
      <RoleBasedModal
        isVisible={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        userRole={user?.role}
      />

      <RegistrationDateModal
        isVisible={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        type={registrationModalType}
        startDate={selectedCourse?.startDate}
        endDate={selectedCourse?.endDate}
      />

      <CommentSection
        courseId={selectedCourseId}
        isVisible={showComments}
        onClose={() => {
          setShowComments(false);
          setSelectedCourseId(null);
        }}
        onCommentAdded={handleCommentAdded}
      />
    </section>
  );
};

export default FeaturedCourses;