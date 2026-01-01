import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, Users, User, Search, Filter, X } from 'lucide-react';
import LoginRequiredModal from './LoginRequiredModal';
import RoleBasedModal from './RoleBasedModal';
import { getUserData } from '../utils/userUtils';
import { courseAPI, categoryAPI } from '../services/api';

const Courses = () => {
  const { t } = useTranslation();
  const [starredCourses, setStarredCourses] = useState(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalActionType, setModalActionType] = useState('subscribe');
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const userData = getUserData();
    setUser(userData);
    fetchCourses();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [searchTerm, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = { limit: 6 };
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== 'all') params.category = selectedCategory;
      
      const response = await courseAPI.getCourses(params);
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLoggedIn = !!user;

  const handleStarLike = async (courseId) => {
    if (!isLoggedIn) {
      setModalMessage('Please login or create an account to like courses.');
      setModalActionType('like');
      setShowLoginModal(true);
      return;
    }
    
    try {
      const response = await courseAPI.starCourse(courseId);
      
      // Update the courses state to reflect the change
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

  const handleEnroll = () => {
    if (!isLoggedIn) {
      setModalMessage('Please login or create an account to enroll in courses.');
      setModalActionType('enroll');
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



  return (
    <section id="courses-section" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('courses.title')}
          </h2>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-12">
          <div className="max-w-4xl mx-auto">
            {/* Search Bar and Filter Button */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all duration-300 shadow-lg"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors shadow-lg"
              >
                <Filter className="h-5 w-5" />
                <span>{showFilters ? 'Hide' : 'Filter'}</span>
              </button>
            </div>

            {/* Category Filters */}
            <div className={`${showFilters ? 'block' : 'hidden'}`}>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    selectedCategory === 'all'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'
                  }`}
                >
                  All Courses
                </button>
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                      selectedCategory === category.slug
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchTerm || selectedCategory !== 'all') && (
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {searchTerm && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                    <span>Search: "{searchTerm}"</span>
                    <button onClick={() => setSearchTerm('')} className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-1">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {selectedCategory !== 'all' && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm">
                    <span>Category: {categories.find(c => c.slug === selectedCategory)?.name}</span>
                    <button onClick={() => setSelectedCategory('all')} className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-1">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-pulse">
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
              <div key={course._id} className="group bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 dark:border-gray-700 flex flex-col h-full">
                <div className="relative overflow-hidden cursor-pointer" onClick={() => window.location.href = `/course/${course._id}`}>
                  <img src={course.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400'} alt={course.title} className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{course.price} {t('courses.birr')}</span>
                  </div>
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {course.category}
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors min-h-[4rem] flex items-start">
                    {course.title}
                  </h3>
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full mr-4 border-3 border-blue-100 dark:border-blue-900 overflow-hidden">
                      {course.instructor?.profileImage ? (
                        <img 
                          src={course.instructor.profileImage} 
                          alt={course.instructor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{course.instructor?.name || 'Instructor'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('courses.instructor')}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-6">
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
                      <Users className="h-5 w-5 mr-2" />
                      <span className="font-medium">{course.students?.length || 0} {t('courses.students')}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-auto">
                    {user?.role !== 'instructor' && user?.role !== 'superadmin' && (
                      <button 
                        onClick={handleEnroll}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      >
                        {t('courses.enrollNow')}
                      </button>
                    )}
                    <Link
                      to={`/course/${course._id}`}
                      className={`${user?.role === 'instructor' || user?.role === 'superadmin' ? 'flex-1' : 'flex-1'} border-2 border-blue-600 text-blue-600 dark:text-blue-400 py-3 px-4 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 font-semibold text-center flex items-center justify-center`}
                    >
                      {t('courses.viewDetails')}
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

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
    </section>
  );
};

export default Courses;