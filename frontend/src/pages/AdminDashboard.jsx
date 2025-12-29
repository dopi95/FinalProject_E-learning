import React, { useState } from 'react';
import { Shield, Users, BookOpen, Settings, LogOut, UserPlus, DollarSign, BarChart3, Calendar, Bell, CreditCard, Award, FileText } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Shield },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'courses', name: 'Course Management', icon: BookOpen },
    { id: 'enrollments', name: 'Enrollments', icon: UserPlus },
    { id: 'payments', name: 'Payments', icon: DollarSign },
    { id: 'schedule', name: 'Schedule Management', icon: Calendar },
    { id: 'reports', name: 'Reports & Analytics', icon: BarChart3 },
    { id: 'certificates', name: 'Certificates', icon: Award },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'settings', name: 'System Settings', icon: Settings }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1,234</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">56</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">$45,230</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <UserPlus className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">New Enrollments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">89</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Activities</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
              <UserPlus className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">New instructor registered</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Dr. Smith joined Mathematics department</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
              <BookOpen className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">New course created</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Advanced Physics course added</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
              <DollarSign className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Payment received</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">$299 for Premium Mathematics course</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">System Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Server Status</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded">Connected</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Payment Gateway</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded">Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Email Service</span>
              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-xs rounded">Warning</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
        <div className="flex space-x-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Add User
          </button>
          <button className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            Export
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-blue-600">856</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Students</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-green-600">45</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Instructors</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-purple-600">12</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Admins</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-orange-600">3</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Super Admins</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Search users..."
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            />
            <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700">
              <option>All Roles</option>
              <option>Students</option>
              <option>Instructors</option>
              <option>Admins</option>
              <option>Super Admins</option>
            </select>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[1, 2, 3, 4, 5].map((user) => (
            <div key={user} className="p-6 flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full mr-4"></div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">User {user}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">user{user}@example.com</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Role: {user % 2 === 0 ? 'Instructor' : 'Student'}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800">Edit</button>
                <button className="text-red-600 hover:text-red-800">Delete</button>
                <button className="text-green-600 hover:text-green-800">Activate</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Course Management</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Create Course
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((course) => (
          <div key={course} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Course {course}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Instructor: Dr. Smith</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Students: {30 + course}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Price: ${99 + course * 50}</p>
            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Manage</button>
              <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEnrollments = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Enrollment Management</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-4">
            <button className="text-blue-600 border-b-2 border-blue-600 pb-2">All Enrollments</button>
            <button className="text-gray-600 dark:text-gray-400 pb-2">Pending</button>
            <button className="text-gray-600 dark:text-gray-400 pb-2">Active</button>
            <button className="text-gray-600 dark:text-gray-400 pb-2">Completed</button>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[1, 2, 3, 4, 5].map((enrollment) => (
            <div key={enrollment} className="p-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Student {enrollment}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Course: Mathematics {enrollment}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enrolled: Dec {enrollment}, 2024</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded">
                  Active
                </span>
                <button className="text-blue-600 hover:text-blue-800">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-green-600">$45,230</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-blue-600">$12,450</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-purple-600">156</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Transactions</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[1, 2, 3, 4, 5].map((payment) => (
            <div key={payment} className="p-6 flex justify-between items-center">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-green-600 mr-4" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Payment #{payment}001</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Student {payment} - Mathematics Course</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Dec {payment}, 2024</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">${99 + payment * 50}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule Management</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Add Schedule
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-7 gap-4 mb-6">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="text-center font-medium text-gray-900 dark:text-white">{day}</div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-4">
            <div className="col-span-2 bg-blue-100 dark:bg-blue-900/20 p-3 rounded">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Mathematics</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">Dr. Smith</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">10:00 - 11:30 AM</p>
            </div>
            <div></div>
            <div className="col-span-2 bg-green-100 dark:bg-green-900/20 p-3 rounded">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">Physics</p>
              <p className="text-xs text-green-700 dark:text-green-300">Dr. Johnson</p>
              <p className="text-xs text-green-600 dark:text-green-400">2:00 - 3:30 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">User Growth</h3>
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Chart Placeholder</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Course Performance</h3>
          <div className="space-y-4">
            {['Mathematics', 'Physics', 'Chemistry', 'Biology'].map((subject, index) => (
              <div key={subject}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{subject}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{90 - index * 5}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${90 - index * 5}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCertificates = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Certificate Management</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Generate Certificates
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((cert) => (
          <div key={cert} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="h-32 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg mb-4 flex items-center justify-center">
              <Award className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Certificate Template {cert}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Course: Mathematics {cert}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Generated: {50 + cert} certificates</p>
            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Edit</button>
              <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                <FileText className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notification System</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Send Notification
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Create Announcement</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input type="text" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
              <textarea className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 h-24"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Audience</label>
              <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700">
                <option>All Users</option>
                <option>Students Only</option>
                <option>Instructors Only</option>
                <option>Admins Only</option>
              </select>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              Send Notification
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Notifications</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((notif) => (
              <div key={notif} className="p-3 border rounded">
                <p className="text-sm font-medium text-gray-900 dark:text-white">System Maintenance</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Sent to all users • Dec {notif}, 2024</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform Name</label>
              <input type="text" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700" defaultValue="AAU E-Learning" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Email</label>
              <input type="email" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700" defaultValue="admin@aau.edu" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max File Size (MB)</label>
              <input type="number" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700" defaultValue="100" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Security Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Two-Factor Authentication</span>
              <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Enable</button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Password Complexity</span>
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">Enabled</button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Session Timeout (min)</span>
              <input type="number" className="w-20 p-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700" defaultValue="30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'users': return renderUsers();
      case 'courses': return renderCourses();
      case 'enrollments': return renderEnrollments();
      case 'payments': return renderPayments();
      case 'schedule': return renderSchedule();
      case 'reports': return renderReports();
      case 'certificates': return renderCertificates();
      case 'notifications': return renderNotifications();
      case 'settings': return renderSettings();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
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

export default AdminDashboard;