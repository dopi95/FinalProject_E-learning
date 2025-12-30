import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginRequiredModal from '../components/LoginRequiredModal';
import RoleBasedModal from '../components/RoleBasedModal';
import { ArrowLeft, Star, Users, Clock, PlayCircle, CheckCircle, Globe, Award, User } from 'lucide-react';
import { getUserData } from '../utils/userUtils';

const CourseDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [starredCourses, setStarredCourses] = useState(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = getUserData();
    setUser(userData);
  }, []);

  const isLoggedIn = !!user;

  const handleStarLike = (courseId) => {
    if (!isLoggedIn) {
      setModalMessage('Please login to star courses');
      setShowLoginModal(true);
      return;
    }
    
    const newStarredCourses = new Set(starredCourses);
    if (starredCourses.has(courseId)) {
      newStarredCourses.delete(courseId);
    } else {
      newStarredCourses.add(courseId);
    }
    setStarredCourses(newStarredCourses);
  };

  const handleEnroll = () => {
    if (!isLoggedIn) {
      setModalMessage('Please login to enroll in courses');
      setShowLoginModal(true);
      return;
    }
    
    if (user.role !== 'student') {
      setShowRoleModal(true);
      return;
    }
    
    // Handle enrollment logic for students
    console.log('Enrolling student in course...');
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

  // Mock course data - in real app, fetch by ID
  const courses = {
    1: {
      id: 1,
      title: t('courses.reactCourse'),
      instructor: t('courses.drSarah'),
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      rating: 4.8,
      students: 1234,
      starCount: 892,
      price: '2,500 Birr',
      category: 'programming',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      description: t('courses.reactDescription'),
      longDescription: t('courses.reactLongDescription')
    },
    2: {
      id: 2,
      title: t('courses.uiuxCourse'),
      instructor: t('courses.profMichael'),
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      rating: 4.9,
      students: 856,
      starCount: 634,
      price: '1,800 Birr',
      category: 'design',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
      description: t('courses.uiuxDescription'),
      longDescription: t('courses.uiuxLongDescription')
    },
    3: {
      id: 3,
      title: t('courses.marketingCourse'),
      instructor: t('courses.drEmily'),
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      rating: 4.7,
      students: 2103,
      starCount: 1456,
      price: '3,200 Birr',
      category: 'marketing',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      description: t('courses.marketingDescription'),
      longDescription: t('courses.marketingLongDescription')
    }
  };

  const course = courses[id];

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Course Header */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-4 sm:p-8 mb-8">
                <img 
                  src={course.image} 
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
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                      <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{course.instructor}</p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{t('courses.instructor')}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-start sm:space-x-6">
                    <button 
                      onClick={() => handleStarLike(course.id)}
                      className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
                    >
                      <Star 
                        className={`h-5 w-5 transition-colors ${
                          starredCourses.has(parseInt(course.id)) 
                            ? 'text-yellow-500 fill-current' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`} 
                      />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {course.starCount + (starredCourses.has(parseInt(course.id)) ? 1 : 0)}
                      </span>
                    </button>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      <span className="text-sm sm:text-base">{course.students} {t('courses.students')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Description */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('courses.aboutCourse')}</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {course.longDescription}
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 sticky top-24">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {course.price}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">{t('courses.oneTimePayment')}</p>
                </div>

                <button 
                  onClick={handleEnroll}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 mb-6"
                >
                  {t('courses.enrollNow')}
                </button>

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

      <Footer />
    </div>
  );
};

export default CourseDetail;