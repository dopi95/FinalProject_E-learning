import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Users, Calendar, LogOut, FileText, Video, BarChart3, Settings, Upload, Clock, CheckCircle, Bell, Home } from 'lucide-react';

const InstructorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user data from localStorage or sessionStorage
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Generate initials from user name
  const getInitials = (name) => {
    if (!name) return 'IN';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleBackToWebsite = () => {
    window.location.href = '/';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/login';
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: GraduationCap },
    { id: 'courses', name: 'My Courses', icon: BookOpen },
    { id: 'materials', name: 'Materials', icon: Upload },
    { id: 'assignments', name: 'Assignments', icon: FileText },
    { id: 'quizzes', name: 'Quizzes', icon: CheckCircle },
    { id: 'schedule', name: 'Schedule', icon: Calendar },
    { id: 'students', name: 'Students', icon: Users },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 }
  ];

  const renderOverview = () => (
    <div className="space-y-4 lg:space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl mr-4">
          <GraduationCap className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Instructor Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}, manage your courses and students</p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">My Courses</p>
              <p className="text-2xl lg:text-3xl font-bold mt-2 text-gray-900 dark:text-white">8</p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Active courses</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
              <BookOpen className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Students</p>
              <p className="text-2xl lg:text-3xl font-bold mt-2 text-gray-900 dark:text-white">245</p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Enrolled students</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
              <Users className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 lg:p-6">
        <div className="flex items-center mb-4 lg:mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
            <Calendar className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
          </div>
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">Today's Schedule</h3>
        </div>
        <div className="space-y-3 lg:space-y-4">
          <div className="flex items-center p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-l-4 border-blue-500">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Advanced Mathematics</h4>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">10:00 AM - 11:30 AM • on Zoom</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">32 students enrolled</p>
            </div>
            <div className="text-right">
              <span className="px-2 lg:px-3 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
                Upcoming
              </span>
            </div>
          </div>
          
          <div className="flex items-center p-3 lg:p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border-l-4 border-emerald-500">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Physics Laboratory</h4>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">2:00 PM - 3:30 PM • on Zoom</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">28 students enrolled</p>
            </div>
            <div className="text-right">
              <span className="px-2 lg:px-3 py-1 bg-emerald-500 text-white text-xs rounded-full font-medium">
                Later Today
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 lg:p-6">
        <div className="flex items-center mb-4 lg:mb-6">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-3">
            <Settings className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600" />
          </div>
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <button 
            onClick={() => setActiveTab('materials')}
            className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-200 group border border-purple-200 dark:border-purple-700"
          >
            <Upload className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">Upload Material</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('assignments')}
            className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-900/30 dark:hover:to-red-900/30 transition-all duration-200 group border border-orange-200 dark:border-orange-700"
          >
            <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">New Assignment</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('quizzes')}
            className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl hover:from-indigo-100 hover:to-blue-100 dark:hover:from-indigo-900/30 dark:hover:to-blue-900/30 transition-all duration-200 group border border-indigo-200 dark:border-indigo-700"
          >
            <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">Create Quiz</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('analytics')}
            className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl hover:from-teal-100 hover:to-cyan-100 dark:hover:from-teal-900/30 dark:hover:to-cyan-900/30 transition-all duration-200 group border border-teal-200 dark:border-teal-700"
          >
            <BarChart3 className="h-6 w-6 lg:h-8 lg:w-8 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">View Analytics</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-3 lg:space-y-4">
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 rounded-2xl shadow-lg p-0.5 animate-pulse">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-5">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-amber-100 dark:bg-amber-900/20">
                  <Bell className="h-4 w-4 lg:h-5 lg:w-5 text-amber-600 animate-bounce" />
                </div>
              </div>
              <div className="ml-3 lg:ml-4 flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-2">
                  <h4 className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white">System Maintenance Alert</h4>
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs rounded-full animate-pulse font-medium">
                    Important
                  </span>
                </div>
                <p className="mt-1 lg:mt-2 text-xs lg:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Platform maintenance scheduled for this weekend. All live sessions will be temporarily unavailable on Saturday from 2:00 AM to 6:00 AM.
                </p>
                <div className="mt-2 lg:mt-3 text-xs text-gray-500 dark:text-gray-400">
                  2 hours ago
                </div>
              </div>
              <button className="ml-2 lg:ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0">
                <svg className="h-4 w-4 lg:h-5 lg:w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-2xl shadow-lg p-0.5">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-5">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <Bell className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-3 lg:ml-4 flex-1 min-w-0">
                <h4 className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white">Course Update Available</h4>
                <p className="mt-1 lg:mt-2 text-xs lg:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  New grading rubric has been implemented for all mathematics courses. Please review the updated guidelines in the course management section.
                </p>
                <div className="mt-2 lg:mt-3 text-xs text-gray-500 dark:text-gray-400">
                  1 day ago
                </div>
              </div>
              <button className="ml-2 lg:ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0">
                <svg className="h-4 w-4 lg:h-5 lg:w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">My Courses</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm lg:text-base">
          Create Course
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((course) => (
          <div key={course} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6">
            <div className="h-24 lg:h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-4"></div>
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-2">Course {course}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{30 + course} Students Enrolled</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Next class: Dec {20 + course}, 2024</p>
            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm">Manage</button>
              <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                <Video className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMaterials = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Learning Materials</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center text-sm lg:text-base">
          <Upload className="h-4 w-4 mr-2" />
          Upload Material
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2 lg:gap-4">
            <button className="text-blue-600 border-b-2 border-blue-600 pb-2 text-sm lg:text-base">All Materials</button>
            <button className="text-gray-600 dark:text-gray-400 pb-2 text-sm lg:text-base">PDFs</button>
            <button className="text-gray-600 dark:text-gray-400 pb-2 text-sm lg:text-base">Videos</button>
            <button className="text-gray-600 dark:text-gray-400 pb-2 text-sm lg:text-base">Lecture Notes</button>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[1, 2, 3, 4, 5].map((material) => (
            <div key={material} className="p-4 lg:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-4">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base lg:text-lg font-medium text-gray-900 dark:text-white">Material {material}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mathematics Course • Uploaded Dec {material}, 2024</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAssignments = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Assignments</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm lg:text-base">
          Create Assignment
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2 lg:gap-4">
            <button className="text-blue-600 border-b-2 border-blue-600 pb-2 text-sm lg:text-base">Active</button>
            <button className="text-gray-600 dark:text-gray-400 pb-2 text-sm lg:text-base">Pending Review</button>
            <button className="text-gray-600 dark:text-gray-400 pb-2 text-sm lg:text-base">Completed</button>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[1, 2, 3, 4].map((assignment) => (
            <div key={assignment} className="p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                <div>
                  <h3 className="text-base lg:text-lg font-medium text-gray-900 dark:text-white">Assignment {assignment}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mathematics Course</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Due: Dec {25 + assignment}, 2024</p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                  <button className="text-green-600 hover:text-green-800 text-sm">Grade</button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-2">
                <span className="text-gray-600 dark:text-gray-400">Submissions: {15 + assignment}/30</span>
                <span className="text-gray-600 dark:text-gray-400">Avg Grade: {85 + assignment}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderQuizzes = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Quizzes</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm lg:text-base">
          Create Quiz
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {[1, 2, 3, 4, 5, 6].map((quiz) => (
          <div key={quiz} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">Quiz {quiz}</h3>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded">
                Active
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Mathematics Course</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{10 + quiz} Questions • {20 + quiz} min</p>
            <div className="flex justify-between text-sm mb-4">
              <span className="text-gray-600 dark:text-gray-400">Attempts: {25 + quiz}</span>
              <span className="text-gray-600 dark:text-gray-400">Avg: {80 + quiz}%</span>
            </div>
            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm">View Results</button>
              <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Weekly Schedule</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm lg:text-base">
          Add Session
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6">
        <div className="grid grid-cols-7 gap-2 lg:gap-4 mb-6">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="text-center font-medium text-gray-900 dark:text-white text-sm lg:text-base">{day}</div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-2 lg:gap-4">
            <div className="col-span-2 bg-blue-100 dark:bg-blue-900/20 p-2 lg:p-3 rounded">
              <p className="text-xs lg:text-sm font-medium text-blue-900 dark:text-blue-100">Advanced Math</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">10:00 - 11:30 AM</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Room 101</p>
            </div>
            <div></div>
            <div className="col-span-2 bg-green-100 dark:bg-green-900/20 p-2 lg:p-3 rounded">
              <p className="text-xs lg:text-sm font-medium text-green-900 dark:text-green-100">Physics Lab</p>
              <p className="text-xs text-green-700 dark:text-green-300">2:00 - 3:30 PM</p>
              <p className="text-xs text-green-600 dark:text-green-400">Lab 201</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-6">
      <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Student Management</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <input
              type="text"
              placeholder="Search students..."
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm lg:text-base"
            />
            <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm lg:text-base">
              <option>All Courses</option>
              <option>Mathematics</option>
              <option>Physics</option>
            </select>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[1, 2, 3, 4, 5].map((student) => (
            <div key={student} className="p-4 lg:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full mr-4"></div>
                <div>
                  <h3 className="text-base lg:text-lg font-medium text-gray-900 dark:text-white">Student {student}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">student{student}@example.com</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Enrolled: 3 courses</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-2 sm:gap-0">
                <div className="text-left sm:text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Attendance: {90 + student}%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Grade: {85 + student}%</p>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm">View Profile</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Course Performance</h3>
          <div className="space-y-4">
            {['Mathematics', 'Physics', 'Chemistry'].map((subject, index) => (
              <div key={subject}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{subject}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{88 - index * 3}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${88 - index * 3}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Student Engagement</h3>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">87%</div>
            <p className="text-gray-600 dark:text-gray-400">Average Attendance</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'courses': return renderCourses();
      case 'materials': return renderMaterials();
      case 'assignments': return renderAssignments();
      case 'quizzes': return renderQuizzes();
      case 'schedule': return renderSchedule();
      case 'students': return renderStudents();
      case 'analytics': return renderAnalytics();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 shadow-2xl border-r border-gray-200 dark:border-gray-700 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-300 ease-in-out lg:translate-x-0 lg:fixed lg:inset-y-0 flex flex-col overflow-hidden`}>
        {/* Logo/Title */}
        <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex-shrink-0">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">{user ? getInitials(user.name) : 'IN'}</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">{user ? user.name : 'Instructor'}</h1>
              <p className="text-blue-100 text-sm flex items-center">
                <GraduationCap className="h-4 w-4 mr-1" />
                {user ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Instructor'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 mr-3 ${
                    activeTab === tab.id ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  <span className="font-medium">{tab.name}</span>
                  {activeTab === tab.id && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              );
            })}
            
            {/* Separator */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2 mt-100"></div>
            
            {/* Additional Navigation Items */}
            <div className="mt-100 pt-4">
              <button
                onClick={handleBackToWebsite}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg transition-all duration-200"
              >
                <Home className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                <span className="font-medium">Back to Website</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 rounded-lg transition-all duration-200 mt-1"
              >
                <LogOut className="h-4 w-4 mr-3" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-72">
        {/* Mobile hamburger button - Fixed */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-40 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 shadow-lg transition-colors"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-4 lg:p-8 pt-16 lg:pt-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;