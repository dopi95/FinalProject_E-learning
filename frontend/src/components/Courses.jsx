import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, Users, User } from 'lucide-react';
import LoginRequiredModal from './LoginRequiredModal';

const Courses = () => {
  const { t } = useTranslation();
  const [starredCourses, setStarredCourses] = useState(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Check if user is logged in (you can replace this with actual auth check)
  const isLoggedIn = false; // Replace with actual auth state

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
    // Handle enrollment logic here
  };

  const courses = [
    {
      id: 1,
      title: t('courses.reactCourse'),
      instructor: t('courses.drSarah'),
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      rating: 4.8,
      students: 1234,
      starCount: 892,
      price: `2,500 ${t('courses.birr')}`,
      category: 'programming',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400'
    },
    {
      id: 2,
      title: t('courses.uiuxCourse'),
      instructor: t('courses.profMichael'),
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      rating: 4.9,
      students: 856,
      starCount: 634,
      price: `1,800 ${t('courses.birr')}`,
      category: 'design',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400'
    },
    {
      id: 3,
      title: t('courses.marketingCourse'),
      instructor: t('courses.drEmily'),
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      rating: 4.7,
      students: 2103,
      starCount: 1456,
      price: `3,200 ${t('courses.birr')}`,
      category: 'marketing',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400'
    }
  ];

  return (
    <section id="courses-section" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('courses.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <div key={course.id} className="group bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 dark:border-gray-700 flex flex-col h-full">
              <div className="relative overflow-hidden cursor-pointer" onClick={() => window.location.href = `/course/${course.id}`}>
                <img src={course.image} alt={course.title} className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{course.price}</span>
                </div>
                <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {t(`courses.${course.category}`)}
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors min-h-[4rem] flex items-start">
                  {course.title}
                </h3>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full mr-4 border-3 border-blue-100 dark:border-blue-900 bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{course.instructor}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('courses.instructor')}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-6">
                  <button 
                    onClick={() => handleStarLike(course.id)}
                    className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
                  >
                    <Star 
                      className={`h-5 w-5 transition-colors ${
                        starredCourses.has(course.id) 
                          ? 'text-yellow-500 fill-current' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`} 
                    />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {course.starCount + (starredCourses.has(course.id) ? 1 : 0)}
                    </span>
                  </button>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Users className="h-5 w-5 mr-2" />
                    <span className="font-medium">{course.students} {t('courses.students')}</span>
                  </div>
                </div>
                <div className="flex gap-3 mt-auto">
                  <button 
                    onClick={handleEnroll}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    {t('courses.enrollNow')}
                  </button>
                  <Link
                    to={`/course/${course.id}`}
                    className="flex-1 border-2 border-blue-600 text-blue-600 dark:text-blue-400 py-3 px-4 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 font-semibold text-center flex items-center justify-center"
                  >
                    {t('courses.viewDetails')}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Login Required Modal */}
      <LoginRequiredModal
        isVisible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message={modalMessage}
      />
    </section>
  );
};

export default Courses;