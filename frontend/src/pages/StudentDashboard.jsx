import React, { useState } from 'react';
import { BookOpen, Award, Calendar, TrendingUp, LogOut, User, CreditCard, FileText, Video, Download, Bell, Clock, CheckCircle } from 'lucide-react';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BookOpen },
    { id: 'courses', name: 'My Courses', icon: BookOpen },
    { id: 'assignments', name: 'Assignments', icon: FileText },
    { id: 'schedule', name: 'Schedule', icon: Calendar },
    { id: 'progress', name: 'Progress', icon: TrendingUp },
    { id: 'certificates', name: 'Certificates', icon: Award },
    { id: 'profile', name: 'Profile', icon: User }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Enrolled Courses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">6</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Grade</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">85%</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">4</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
              <Bell className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">New assignment posted</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Mathematics - Due in 3 days</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Grade published</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Physics Quiz - 92%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Upcoming Live Sessions</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 border rounded">
              <Video className="h-5 w-5 text-red-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Advanced Mathematics</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Today, 2:00 PM</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Join</button>
            </div>
            <div className="flex items-center p-3 border rounded">
              <Video className="h-5 w-5 text-red-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Physics Lab</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Tomorrow, 10:00 AM</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Join</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Browse Courses
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((course) => (
          <div key={course} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Course {course}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Instructor Name</p>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">75%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Continue</button>
              <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAssignments = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-4">
            <button className="text-blue-600 border-b-2 border-blue-600 pb-2">Pending</button>
            <button className="text-gray-600 dark:text-gray-400 pb-2">Submitted</button>
            <button className="text-gray-600 dark:text-gray-400 pb-2">Graded</button>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[1, 2, 3, 4].map((assignment) => (
            <div key={assignment} className="p-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Assignment {assignment}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mathematics Course</p>
                <p className="text-sm text-red-600">Due: Dec 25, 2024</p>
              </div>
              <div className="flex space-x-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Submit</button>
                <button className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Schedule</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-7 gap-4 mb-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="text-center font-medium text-gray-900 dark:text-white">{day}</div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-4">
            <div className="col-span-2 bg-blue-100 dark:bg-blue-900/20 p-2 rounded">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Mathematics</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">9:00 - 10:30 AM</p>
            </div>
            <div></div>
            <div className="col-span-2 bg-green-100 dark:bg-green-900/20 p-2 rounded">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">Physics</p>
              <p className="text-xs text-green-700 dark:text-green-300">2:00 - 3:30 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProgress = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Report</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Course Progress</h3>
          <div className="space-y-4">
            {['Mathematics', 'Physics', 'Chemistry', 'Biology'].map((subject, index) => (
              <div key={subject}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{subject}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{85 - index * 5}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${85 - index * 5}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Attendance</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">92%</div>
            <p className="text-gray-600 dark:text-gray-400">Overall Attendance</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCertificates = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Certificates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((cert) => (
          <div key={cert} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="h-32 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg mb-4 flex items-center justify-center">
              <Award className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Course Certificate {cert}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Completed on Dec {cert}, 2024</p>
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center">
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Management</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Personal Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input type="text" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700" defaultValue="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700" defaultValue="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input type="tel" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700" defaultValue="+1234567890" />
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Update Profile</button>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Payment Methods</h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 border rounded-lg">
              <CreditCard className="h-5 w-5 text-gray-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">**** **** **** 1234</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Expires 12/25</p>
              </div>
              <button className="text-red-600 hover:text-red-800 text-sm">Remove</button>
            </div>
            <button className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 p-3 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500">
              + Add Payment Method
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'courses': return renderCourses();
      case 'assignments': return renderAssignments();
      case 'schedule': return renderSchedule();
      case 'progress': return renderProgress();
      case 'certificates': return renderCertificates();
      case 'profile': return renderProfile();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-64">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === tab.id
                          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="flex-1">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;