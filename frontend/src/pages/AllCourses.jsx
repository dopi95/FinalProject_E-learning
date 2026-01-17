import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, Users, User, Search, Filter, X, ChevronLeft, ChevronRight, CheckCircle, Heart, MessageCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginRequiredModal from '../components/LoginRequiredModal';
import RoleBasedModal from '../components/RoleBasedModal';
import RegistrationDateModal from '../components/RegistrationDateModal';
import CommentSection from '../components/CommentSection';
import { getUserData } from '../utils/userUtils';
import { courseAPI, categoryAPI, enrollmentAPI } from '../services/api';

const AllCourses = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [enrolledCourses, setEnrolledCourses] = useState(new Set());
  const [selectedCourses, setSelectedCourses] = useState(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalActionType, setModalActionType] = useState('subscribe');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationModalType, setRegistrationModalType] = useState('');
  const [selectedCourseForModal, setSelectedCourseForModal] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [likingCourse, setLikingCourse] = useState(null);

  useEffect(() => {
    const userData = getUserData();
    setUser(userData);
    fetchCourses();
    fetchCategories();
    if (userData) {
      checkEnrollments();
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [searchTerm, selectedCategory, currentPage]);

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

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = { 
        page: currentPage,
        limit: 12
      };
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== 'all') params.category = selectedCategory;
      
      const response = await courseAPI.getCourses(params);
      // Sort courses by likes (stars) - most liked first
      const sortedCourses = response.data.courses
        .sort((a, b) => (b.stars?.length || 0) - (a.stars?.length || 0));
      setCourses(sortedCourses);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching courses:', error);
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
    
    if (likingCourse === courseId) {
      return;
    }
    
    setLikingCourse(courseId);
    
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
    } finally {
      setLikingCourse(null);
    }
  };

  const handleCourseSelection = (courseId) => {
    if (!user) {
      setModalMessage('Please login or create an account to select courses.');
      setModalActionType('enroll');
      setShowLoginModal(true);
      return;
    }
    
    if (user.role !== 'student') {
      setShowRoleModal(true);
      return;
    }
    
    if (enrolledCourses.has(courseId)) {
      return; // Can't select already enrolled courses
    }
    
    // Check if course is active for selection
    const course = courses.find(c => c._id === courseId);
    if (course && (course.registrationStart || course.registrationEnd)) {
      const now = new Date();
      const startDate = course.registrationStart ? new Date(course.registrationStart) : null;
      const endDate = course.registrationEnd ? new Date(course.registrationEnd) : null;
      
      if ((startDate && now < startDate) || (endDate && (() => {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        return now > endOfDay;
      })())) {
        return; // Can't select inactive courses
      }
    }
    
    setSelectedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const handleBulkEnroll = () => {
    if (selectedCourses.size === 0) return;
    
    const courseIds = Array.from(selectedCourses).join(',');
    navigate(`/payment/bulk?courses=${courseIds}`);
  };

  const getTotalPrice = () => {
    return Array.from(selectedCourses).reduce((total, courseId) => {
      const course = courses.find(c => c._id === courseId);
      return total + (course?.price || 0);
    }, 0);
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
        setSelectedCourseForModal(course);
        setRegistrationModalType('not_started');
        setShowRegistrationModal(true);
        return;
      }
      
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (now > endOfDay) {
          setSelectedCourseForModal(course);
          setRegistrationModalType('closed');
          setShowRegistrationModal(true);
          return;
        }
      }
    }
    
    navigate(`/payment/${courseId}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowComments = (courseId) => {
    setSelectedCourseId(courseId);
    setShowComments(true);
  };

  const handleCommentAdded = () => {
    fetchCourses();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('courses.allCoursesTitle')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('courses.allCoursesSubtitle')}
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-12">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
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

              {showFilters && (
                <div className="flex flex-wrap gap-3 justify-center mb-6">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setCurrentPage(1);
                    }}
                    className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                      selectedCategory === 'all'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500'
                    }`}
                  >
                    All Courses
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => {
                        setSelectedCategory(category.slug);
                        setCurrentPage(1);
                      }}
                      className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                        selectedCategory === category.slug
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}

              {(searchTerm || selectedCategory !== 'all') && (
                <div className="flex flex-wrap gap-2 justify-center">
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

          {/* Selected Courses Summary */}
          {selectedCourses.size > 0 && (
            <div className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 z-50 max-w-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Selected Courses ({selectedCourses.size})
              </h3>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                Total: {getTotalPrice()} Birr
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCourses(new Set())}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  Clear
                </button>
                <button
                  onClick={handleBulkEnroll}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Enroll All
                </button>
              </div>
            </div>
          )}

          {/* Select All Checkbox - Above Courses Grid */}
          {user?.role === 'student' && courses.length > 0 && (
            <div className="flex items-center gap-3 mb-6 p-4">
              <input
                type="checkbox"
                id="selectAll"
                checked={selectedCourses.size > 0 && selectedCourses.size === courses.filter(course => {
                  if (enrolledCourses.has(course._id)) return false;
                  // Check if course is active
                  if (course.registrationStart || course.registrationEnd) {
                    const now = new Date();
                    const startDate = course.registrationStart ? new Date(course.registrationStart) : null;
                    const endDate = course.registrationEnd ? new Date(course.registrationEnd) : null;
                    if (endDate) {
                      const endOfDay = new Date(endDate);
                      endOfDay.setHours(23, 59, 59, 999);
                      return !((startDate && now < startDate) || (now > endOfDay));
                    }
                    return !((startDate && now < startDate));
                  }
                  return true;
                }).length}
                onChange={() => {
                  const availableCourses = courses.filter(course => {
                    if (enrolledCourses.has(course._id)) return false;
                    // Check if course is active
                    if (course.registrationStart || course.registrationEnd) {
                      const now = new Date();
                      const startDate = course.registrationStart ? new Date(course.registrationStart) : null;
                      const endDate = course.registrationEnd ? new Date(course.registrationEnd) : null;
                      if (endDate) {
                        const endOfDay = new Date(endDate);
                        endOfDay.setHours(23, 59, 59, 999);
                        return !((startDate && now < startDate) || (now > endOfDay));
                      }
                      return !((startDate && now < startDate));
                    }
                    return true;
                  });
                  if (selectedCourses.size === availableCourses.length) {
                    setSelectedCourses(new Set());
                  } else {
                    setSelectedCourses(new Set(availableCourses.map(c => c._id)));
                  }
                }}
                className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 transition-all"
              />
              <label htmlFor="selectAll" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                {selectedCourses.size > 0 && selectedCourses.size === courses.filter(course => {
                  if (enrolledCourses.has(course._id)) return false;
                  if (course.registrationStart || course.registrationEnd) {
                    const now = new Date();
                    const startDate = course.registrationStart ? new Date(course.registrationStart) : null;
                    const endDate = course.registrationEnd ? new Date(course.registrationEnd) : null;
                    if (endDate) {
                      const endOfDay = new Date(endDate);
                      endOfDay.setHours(23, 59, 59, 999);
                      return !((startDate && now < startDate) || (now > endOfDay));
                    }
                    return !((startDate && now < startDate));
                  }
                  return true;
                }).length
                  ? 'Deselect All Active Courses'
                  : 'Select All Active Courses'
                }
              </label>
              {selectedCourses.size > 0 && (
                <span className="ml-auto text-sm text-blue-600 dark:text-blue-400 font-medium">
                  {selectedCourses.size} selected
                </span>
              )}
            </div>
          )}

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {loading ? (
              Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden animate-pulse">
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
                <div key={course._id} className="group bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 dark:border-gray-700 relative">
                  <div className="relative overflow-hidden">
                    <img 
                      src={course.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400'} 
                      alt={course.title} 
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                      <span className="text-xs sm:text-sm font-medium text-white bg-blue-600 px-2 py-1 rounded">
                        {categories.find(cat => cat.slug === course.category)?.name || course.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full">
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{course.price} {t('courses.birr')}</span>
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
                    <div className="flex items-start gap-3 mb-4">
                      {/* Selection Checkbox */}
                      {user?.role === 'student' && !enrolledCourses.has(course._id) && (() => {
                        // Check if course is active
                        if (course.registrationStart || course.registrationEnd) {
                          const now = new Date();
                          const startDate = course.registrationStart ? new Date(course.registrationStart) : null;
                          const endDate = course.registrationEnd ? new Date(course.registrationEnd) : null;
                          
                          if ((startDate && now < startDate) || (endDate && (() => {
                            const endOfDay = new Date(endDate);
                            endOfDay.setHours(23, 59, 59, 999);
                            return now > endOfDay;
                          })())) {
                            return (
                              <input
                                type="checkbox"
                                disabled
                                className="w-5 h-5 text-gray-400 bg-gray-200 border-2 border-gray-300 rounded cursor-not-allowed mt-1 flex-shrink-0"
                              />
                            );
                          }
                        }
                        return (
                          <input
                            type="checkbox"
                            checked={selectedCourses.has(course._id)}
                            onChange={() => handleCourseSelection(course._id)}
                            className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-1 flex-shrink-0"
                          />
                        );
                      })()}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">
                        {course.title}
                      </h3>
                    </div>
                    
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
                        disabled={likingCourse === course._id}
                        className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      {user?.role !== 'instructor' && user?.role !== 'superadmin' && user?.role !== 'admin' && (
                        <button 
                          onClick={() => handleEnroll(course._id)}
                          className="py-2 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base"
                        >
                          {enrolledCourses.has(course._id) ? t('courses.goToCourse') : t('courses.enrollNow')}
                        </button>
                      )}
                      <Link
                        to={`/course/${course._id}`}
                        className="border-2 border-blue-600 text-blue-600 dark:text-blue-400 py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 font-semibold text-center flex items-center justify-center text-sm sm:text-base"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />

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
        startDate={selectedCourseForModal?.registrationStart}
        endDate={selectedCourseForModal?.registrationEnd}
      />

      {/* Comment Section Modal */}
      <CommentSection
        courseId={selectedCourseId}
        isVisible={showComments}
        onClose={() => {
          setShowComments(false);
          setSelectedCourseId(null);
        }}
        onCommentAdded={handleCommentAdded}
      />
    </div>
  );
};

export default AllCourses;