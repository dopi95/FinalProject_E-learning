import React, { useState } from 'react';
import { Crown, Users, BookOpen, Settings, LogOut, UserPlus, DollarSign, BarChart3, Calendar, Bell, CreditCard, Award, FileText, Database, Shield, Activity } from 'lucide-react';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Crown },
    { id: 'system', name: 'System Management', icon: Database },
    { id: 'admins', name: 'Admin Management', icon: Shield },
    { id: 'users', name: 'User Analytics', icon: Users },
    { id: 'platform', name: 'Platform Settings', icon: Settings },
    { id: 'security', name: 'Security Center', icon: Shield },
    { id: 'monitoring', name: 'System Monitoring', icon: Activity },
    { id: 'backups', name: 'Backup & Recovery', icon: Database },
    { id: 'reports', name: 'Global Reports', icon: BarChart3 }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center">
            <Crown className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Platform Health</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">99.9%</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">12,456</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">$2.4M</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-orange-500">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1,234</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">System Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-900 dark:text-white">Database Cluster</span>
              </div>
              <span className="text-sm text-green-600">Healthy</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-900 dark:text-white">API Gateway</span>
              </div>
              <span className="text-sm text-green-600">Online</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-900 dark:text-white">CDN Performance</span>
              </div>
              <span className="text-sm text-yellow-600">Warning</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Critical Alerts</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 rounded">
              <Bell className="h-5 w-5 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">High CPU Usage</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Server cluster reaching 85% capacity</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
              <Bell className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Backup Delay</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Daily backup 2 hours behind schedule</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystem = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Server Management</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-700">
              <p className="font-medium text-gray-900 dark:text-white">Restart Services</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Restart all platform services</p>
            </button>
            <button className="w-full text-left p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-700">
              <p className="font-medium text-gray-900 dark:text-white">Scale Resources</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Auto-scale server resources</p>
            </button>
            <button className="w-full text-left p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-700">
              <p className="font-medium text-gray-900 dark:text-white">Maintenance Mode</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Enable platform maintenance</p>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Database Operations</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-700">
              <p className="font-medium text-gray-900 dark:text-white">Optimize Database</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Run optimization queries</p>
            </button>
            <button className="w-full text-left p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-700">
              <p className="font-medium text-gray-900 dark:text-white">Create Backup</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manual database backup</p>
            </button>
            <button className="w-full text-left p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-700">
              <p className="font-medium text-gray-900 dark:text-white">Migration Tools</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Database migration utilities</p>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">System Updates</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-700">
              <p className="font-medium text-gray-900 dark:text-white">Platform Updates</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Check for system updates</p>
            </button>
            <button className="w-full text-left p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-700">
              <p className="font-medium text-gray-900 dark:text-white">Security Patches</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Apply security updates</p>
            </button>
            <button className="w-full text-left p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-700">
              <p className="font-medium text-gray-900 dark:text-white">Feature Flags</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage feature toggles</p>
            </button>
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-purple-600">5</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Super Admins</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-blue-600">23</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">System Admins</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-green-600">67</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Course Admins</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Search admins..."
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
            />
            <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700">
              <option>All Admin Types</option>
              <option>Super Admins</option>
              <option>System Admins</option>
              <option>Course Admins</option>
            </select>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[1, 2, 3, 4, 5].map((admin) => (
            <div key={admin} className="p-6 flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mr-4">
                  <Crown className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Admin {admin}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">admin{admin}@aau.edu</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Role: {admin % 2 === 0 ? 'Super Admin' : 'System Admin'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Last Login</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Dec {admin}, 2024</p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Revoke</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">User Growth Trends</h3>
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Growth Chart Placeholder</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">User Distribution</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Students</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">85%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Instructors</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">12%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '12%' }}></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Admins</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">3%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '3%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlatform = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Global Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform Name</label>
              <input type="text" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700" defaultValue="AAU E-Learning Platform" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Language</label>
              <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700">
                <option>English</option>
                <option>Amharic</option>
                <option>Oromo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Zone</label>
              <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700">
                <option>Africa/Addis_Ababa</option>
                <option>UTC</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Feature Controls</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Course Enrollment</span>
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">Enabled</button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Payment Processing</span>
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">Enabled</button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Live Sessions</span>
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">Enabled</button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Certificate Generation</span>
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">Enabled</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security Center</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Authentication</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Two-Factor Auth</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">SSO Integration</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Password Policy</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded">Enforced</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Access Control</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Role-Based Access</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">IP Whitelisting</span>
              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 text-xs rounded">Partial</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Session Management</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded">Active</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Data Protection</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Data Encryption</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded">AES-256</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Backup Encryption</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">GDPR Compliance</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded">Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMonitoring = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Monitoring</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">99.9%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">45ms</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">2.4GB</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <Activity className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">15%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">CPU Usage</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Real-time Metrics</h3>
        <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Real-time Monitoring Dashboard</p>
        </div>
      </div>
    </div>
  );

  const renderBackups = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Backup & Recovery</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Create Backup
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-green-600">Daily</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Automated Backups</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-blue-600">30 Days</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Retention Period</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <p className="text-2xl font-bold text-purple-600">2.4TB</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Backup Size</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Backups</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[1, 2, 3, 4, 5].map((backup) => (
            <div key={backup} className="p-6 flex justify-between items-center">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-blue-600 mr-4" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Full System Backup</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Dec {backup}, 2024 - 2:00 AM</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Size: {450 + backup * 50}MB</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800">Download</button>
                <button className="text-green-600 hover:text-green-800">Restore</button>
                <button className="text-red-600 hover:text-red-800">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Global Reports</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Platform Usage</h3>
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Usage Analytics Chart</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Revenue Analytics</h3>
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Revenue Chart</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Generate Custom Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report Type</label>
            <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700">
              <option>User Analytics</option>
              <option>Course Performance</option>
              <option>Financial Report</option>
              <option>System Performance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Range</label>
            <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
              <option>Custom Range</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'system': return renderSystem();
      case 'admins': return renderAdmins();
      case 'users': return renderUsers();
      case 'platform': return renderPlatform();
      case 'security': return renderSecurity();
      case 'monitoring': return renderMonitoring();
      case 'backups': return renderBackups();
      case 'reports': return renderReports();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-yellow-300 mr-3" />
              <h1 className="text-2xl font-bold text-white">Super Admin Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-200 hover:text-red-300"
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
                          ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
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

export default SuperAdminDashboard;