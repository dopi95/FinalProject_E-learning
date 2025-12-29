import React, { useState, useEffect } from 'react';
import { Crown, Users, Shield, Settings, LogOut, Database, Activity, AlertTriangle, Server, Globe, Lock, Home, User, Camera, X, CheckCircle } from 'lucide-react';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setProfileImage(e.target.result);
      reader.readAsDataURL(file);
      setShowImageOptions(false);
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setShowImageOptions(false);
  };

  useEffect(() => {
    // Get user data from localStorage or sessionStorage
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Generate initials from user name
  const getInitials = (name) => {
    if (!name) return 'SA';
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
    { id: 'overview', name: 'System Overview', icon: Crown },
    { id: 'admins', name: 'Admin Management', icon: Shield },
    { id: 'users', name: 'All Users', icon: Users },
    { id: 'system', name: 'System Control', icon: Server },
    { id: 'security', name: 'Security Center', icon: Lock },
    { id: 'database', name: 'Database Management', icon: Database },
    { id: 'settings', name: 'Global Settings', icon: Settings },
    { id: 'profile', name: 'My Profile', icon: User }
  ];

  const renderOverview = () => (
    <div className="space-y-4 lg:space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center mb-6">
        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl mr-4">
          <Crown className="h-8 w-8 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Super Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}, manage the entire platform</p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Users</p>
              <p className="text-2xl lg:text-3xl font-bold mt-2 text-gray-900 dark:text-white">2,847</p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">All platform users</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
              <Users className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Admins</p>
              <p className="text-2xl lg:text-3xl font-bold mt-2 text-gray-900 dark:text-white">12</p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">System administrators</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl">
              <Shield className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">System Uptime</p>
              <p className="text-2xl lg:text-3xl font-bold mt-2 text-gray-900 dark:text-white">99.9%</p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Server availability</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
              <Server className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 lg:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Sessions</p>
              <p className="text-2xl lg:text-3xl font-bold mt-2 text-gray-900 dark:text-white">1,234</p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Current users online</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl">
              <Activity className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 lg:p-6">
        <div className="flex items-center mb-4 lg:mb-6">
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mr-3">
            <Activity className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
          </div>
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">System Health</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center p-3 lg:p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-l-4 border-green-500">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">API Server</h4>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">Response time: 45ms</p>
            </div>
            <span className="px-2 lg:px-3 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
              Healthy
            </span>
          </div>
          
          <div className="flex items-center p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-l-4 border-blue-500">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Database</h4>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">Connections: 8/20</p>
            </div>
            <span className="px-2 lg:px-3 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
              Connected
            </span>
          </div>

          <div className="flex items-center p-3 lg:p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-l-4 border-purple-500">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">File Storage</h4>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">Usage: 2.3GB/10GB</p>
            </div>
            <span className="px-2 lg:px-3 py-1 bg-purple-500 text-white text-xs rounded-full font-medium">
              Available
            </span>
          </div>

          <div className="flex items-center p-3 lg:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border-l-4 border-yellow-500">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Email Service</h4>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">Queue: 23 pending</p>
            </div>
            <span className="px-2 lg:px-3 py-1 bg-yellow-500 text-white text-xs rounded-full font-medium">
              Warning
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 lg:p-6">
        <div className="flex items-center mb-4 lg:mb-6">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-3">
            <Settings className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600" />
          </div>
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <button 
            onClick={() => setActiveTab('admins')}
            className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-200 group border border-purple-200 dark:border-purple-700"
          >
            <Shield className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">Manage Admins</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('users')}
            className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-200 group border border-blue-200 dark:border-blue-700"
          >
            <Users className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">All Users</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('system')}
            className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-200 group border border-green-200 dark:border-green-700"
          >
            <Server className="h-6 w-6 lg:h-8 lg:w-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">System Control</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('security')}
            className="flex flex-col items-center p-3 lg:p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/30 dark:hover:to-orange-900/30 transition-all duration-200 group border border-red-200 dark:border-red-700"
          >
            <Lock className="h-6 w-6 lg:h-8 lg:w-8 text-red-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white text-center">Security Center</span>
          </button>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 lg:p-6">
        <div className="flex items-center mb-4 lg:mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
            <Activity className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
          </div>
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">Recent Admin Activities</h3>
        </div>
        <div className="space-y-3 lg:space-y-4">
          <div className="flex items-center p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-l-4 border-blue-500">
            <Shield className="h-5 w-5 text-blue-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">New admin created</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Admin John Doe was granted access • 2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 lg:p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border-l-4 border-red-500">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Security alert</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Multiple failed login attempts detected • 4 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 lg:p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-l-4 border-green-500">
            <Database className="h-5 w-5 text-green-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Database backup completed</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Automated backup successful • 6 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdmins = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Management</h2>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
          Create Admin
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[1, 2, 3, 4, 5].map((admin) => (
            <div key={admin} className="p-6 flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-full mr-4 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Admin {admin}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">admin{admin}@aau.edu</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last active: 2 hours ago</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800">Edit</button>
                <button className="text-red-600 hover:text-red-800">Revoke</button>
                <button className="text-green-600 hover:text-green-800">Permissions</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Users Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-blue-600">2,456</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Students</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-green-600">89</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Instructors</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-purple-600">12</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Admins</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-orange-600">1</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Super Admin</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Search all users..."
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Role: {user % 3 === 0 ? 'Admin' : user % 2 === 0 ? 'Instructor' : 'Student'}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800">View</button>
                <button className="text-yellow-600 hover:text-yellow-800">Modify</button>
                <button className="text-red-600 hover:text-red-800">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Control Panel</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">System Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              Restart Application
            </button>
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
              Clear Cache
            </button>
            <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700">
              Maintenance Mode
            </button>
            <button className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700">
              Emergency Shutdown
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">System Resources</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">CPU Usage</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">45%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">67%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '67%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Disk Usage</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">23%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '23%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security Center</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Security Alerts</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 rounded">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Suspicious Login Activity</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Multiple failed attempts from IP: 192.168.1.100</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Unusual Access Pattern</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Admin login from new location</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Security Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Force 2FA for Admins</span>
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">Enabled</button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">IP Whitelist</span>
              <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Configure</button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Session Timeout</span>
              <input type="number" className="w-20 p-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700" defaultValue="30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDatabase = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Database Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Database Operations</h3>
          <div className="space-y-3">
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
              Create Backup
            </button>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              Restore Backup
            </button>
            <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700">
              Optimize Database
            </button>
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700">
              View Logs
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Database Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Records</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">45,678</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Database Size</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">2.3 GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Last Backup</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">2 hours ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Connection Pool</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">8/20 active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Global Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold mb-4 text-gray-900 dark:text-white">Platform Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform Name</label>
              <input type="text" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700" defaultValue="AAU E-Learning Platform" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">System Email</label>
              <input type="email" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700" defaultValue="system@aau.edu" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Upload Size (MB)</label>
              <input type="number" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700" defaultValue="500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold mb-4 text-gray-900 dark:text-white">System Maintenance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Maintenance Mode</span>
              <button className="bg-red-600 text-white px-3 py-1 rounded text-sm">Disabled</button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Auto Backup</span>
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">Enabled</button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Debug Mode</span>
              <button className="bg-yellow-600 text-white px-3 py-1 rounded text-sm">Development</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">My Profile</h2>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
                Save
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
      
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl lg:text-4xl font-bold overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user ? getInitials(user.name) : 'SA'
                )}
              </div>
              {isEditing && (
                <>
                  <button 
                    onClick={() => setShowImageOptions(!showImageOptions)}
                    className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  {showImageOptions && (
                    <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-10">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="hidden" 
                        id="imageUpload"
                      />
                      <label 
                        htmlFor="imageUpload"
                        className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                      >
                        Upload Photo
                      </label>
                      {profileImage && (
                        <button 
                          onClick={removeImage}
                          className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Basic Info */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{user?.name || 'Super Administrator'}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-1">{user?.email || 'superadmin@aau.edu'}</p>
            <p className="text-purple-600 dark:text-purple-400 font-medium capitalize">{user?.role || 'Super Admin'}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-sm rounded-full">Verified Account</span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 text-sm rounded-full">Super Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <input type="text" defaultValue={user?.name} disabled={!isEditing} className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input type="email" defaultValue={user?.email} disabled={!isEditing} className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
              <input type="tel" placeholder="+251 xxx xxx xxxx" disabled={!isEditing} className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth</label>
              <input type="date" disabled={!isEditing} className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
              <input type="text" placeholder="Street Address" disabled={!isEditing} className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
              <input type="text" placeholder="Addis Ababa" disabled={!isEditing} className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} />
            </div>
          </div>
        </div>

        {/* Administrative Information */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Administrative Information</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Admin ID</label>
              <input type="text" placeholder="SA001" disabled={!isEditing} className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Access Level</label>
              <select disabled={!isEditing} className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`}>
                <option>Super Administrator</option>
                <option>System Administrator</option>
                <option>Platform Administrator</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
              <input type="text" placeholder="IT Administration" disabled={!isEditing} className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Institution</label>
              <input type="text" placeholder="Addis Ababa University" disabled={!isEditing} className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Login</label>
              <input type="text" value="Today, 10:30 AM" disabled className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 cursor-not-allowed dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
              <textarea rows="3" placeholder="System administrator with full platform access..." disabled={!isEditing} className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none ${!isEditing ? 'bg-gray-50 dark:bg-gray-600 cursor-not-allowed' : ''}`}></textarea>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      {showPasswordForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                <input type="password" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                <input type="password" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                <input type="password" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white" />
              </div>
              <div className="flex gap-3">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
                  Update Password
                </button>
                <button 
                  onClick={() => setShowPasswordForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Account Security</p>
                <p className="text-lg font-semibold text-green-600">Maximum</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Button */}
      {!showPasswordForm && (
        <div className="flex justify-center">
          <button 
            onClick={() => setShowPasswordForm(true)}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            Change Password
          </button>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'admins': return renderAdmins();
      case 'users': return renderUsers();
      case 'system': return renderSystem();
      case 'security': return renderSecurity();
      case 'database': return renderDatabase();
      case 'settings': return renderSettings();
      case 'profile': return renderProfile();
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
      <div className={`fixed inset-y-0 left-0 z-50 w-64 lg:w-72 bg-white dark:bg-gray-800 shadow-2xl border-r border-gray-200 dark:border-gray-700 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-300 ease-in-out lg:translate-x-0 lg:fixed lg:inset-y-0 flex flex-col overflow-hidden`}>
        {/* Logo/Title */}
        <div className="flex items-center justify-between h-16 lg:h-20 px-4 lg:px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex-shrink-0">
          <button 
            onClick={() => setActiveTab('profile')}
            className="flex items-center hover:bg-white/10 rounded-lg p-2 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 rounded-full flex items-center justify-center mr-2 lg:mr-3 overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-sm lg:text-lg">{user ? getInitials(user.name) : 'SA'}</span>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm lg:text-lg font-bold truncate">{user ? user.name : 'Super Admin'}</h1>
              <p className="text-purple-100 text-xs lg:text-sm flex items-center">
                <Crown className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                <span className="truncate">{user ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Super Admin'}</span>
              </p>
            </div>
          </button>
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
        <nav className="flex-1 px-3 lg:px-4 py-3 lg:py-4 overflow-y-auto">
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
                  className={`w-full flex items-center px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all duration-200 group ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 mr-2 lg:mr-3 flex-shrink-0 ${
                    activeTab === tab.id ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  <span className="font-medium truncate">{tab.name}</span>
                  {activeTab === tab.id && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  )}
                </button>
              );
            })}
            
            {/* Separator */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2 mt-100"></div>
            
            {/* Additional Navigation Items */}
            <div className="mt-6 lg:mt-100 pt-3 lg:pt-4">
              <button
                onClick={handleBackToWebsite}
                className="w-full flex items-center px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg transition-all duration-200"
              >
                <Home className="h-4 w-4 mr-2 lg:mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <span className="font-medium truncate">Back to Website</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 rounded-lg transition-all duration-200 mt-1"
              >
                <LogOut className="h-4 w-4 mr-2 lg:mr-3 flex-shrink-0" />
                <span className="font-medium truncate">Logout</span>
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
          className="lg:hidden fixed top-3 left-3 z-40 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 shadow-lg transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-3 lg:p-8 pt-14 lg:pt-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;