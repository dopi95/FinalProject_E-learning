import offlineStorage from './offlineStorage.js';

class OfflineAPI {
  constructor() {
    this.isOnline = navigator.onLine;
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Back online');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Gone offline');
    });
  }

  // Auth methods
  async login(email, password) {
    if (this.isOnline) {
      return null; // Let normal API handle it
    }

    // Offline login
    const user = await offlineStorage.getUser(email);
    if (user && user.password === password) {
      const token = btoa(JSON.stringify({ email, role: user.role, exp: Date.now() + 86400000 }));
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return {
        data: {
          success: true,
          token,
          user,
          message: 'Logged in offline'
        }
      };
    }
    
    throw new Error('Invalid credentials (offline mode)');
  }

  async register(userData) {
    if (this.isOnline) {
      return null; // Let normal API handle it
    }

    // Offline registration
    const existingUser = await offlineStorage.getUser(userData.email);
    if (existingUser) {
      throw new Error('User already exists (offline mode)');
    }

    const newUser = {
      ...userData,
      _id: Date.now().toString(),
      systemId: `STU${Date.now()}`,
      role: 'student',
      isVerified: true, // Auto-verify in offline mode
      createdAt: new Date().toISOString()
    };

    await offlineStorage.addUser(newUser);
    return {
      data: {
        success: true,
        message: 'Registration successful (offline mode)',
        user: newUser
      }
    };
  }

  // Course methods
  async getCourses() {
    if (this.isOnline) {
      return null; // Let normal API handle it
    }

    const courses = await offlineStorage.getCourses();
    return {
      data: {
        success: true,
        courses: courses.length > 0 ? courses : this.getDefaultCourses()
      }
    };
  }

  async getMyCourses() {
    if (this.isOnline) {
      return null; // Let normal API handle it
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const enrollments = await offlineStorage.getUserEnrollments(user.email);
    const allCourses = await offlineStorage.getCourses();
    
    const enrolledCourses = enrollments.map(enrollment => {
      return allCourses.find(course => course._id === enrollment.courseId);
    }).filter(Boolean);

    return {
      data: {
        success: true,
        courses: enrolledCourses
      }
    };
  }

  // Assignment methods
  async getStudentAssignments() {
    if (this.isOnline) {
      return null; // Let normal API handle it
    }

    const assignments = await offlineStorage.getAssignments();
    return {
      data: {
        success: true,
        assignments: assignments.length > 0 ? assignments : this.getDefaultAssignments()
      }
    };
  }

  async submitAssignment(assignmentId, file) {
    if (this.isOnline) {
      return null; // Let normal API handle it
    }

    // Simulate assignment submission
    const submission = {
      _id: Date.now().toString(),
      assignmentId,
      fileName: file.name,
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    };

    localStorage.setItem(`submission_${assignmentId}`, JSON.stringify(submission));
    
    return {
      data: {
        success: true,
        message: 'Assignment submitted (offline mode)',
        submission
      }
    };
  }

  // Payment methods
  async getMyPayments() {
    if (this.isOnline) {
      return null; // Let normal API handle it
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const payments = await offlineStorage.getUserPayments(user.email);
    
    return {
      data: {
        success: true,
        data: payments.length > 0 ? payments : this.getDefaultPayments()
      }
    };
  }

  // Profile methods
  async getProfile() {
    if (this.isOnline) {
      return null; // Let normal API handle it
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      data: {
        success: true,
        user
      }
    };
  }

  async updateProfile(profileData) {
    if (this.isOnline) {
      return null; // Let normal API handle it
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...user, ...profileData };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    await offlineStorage.addUser(updatedUser);
    
    return {
      data: {
        success: true,
        user: updatedUser,
        message: 'Profile updated (offline mode)'
      }
    };
  }

  // Default data for offline mode
  getDefaultCourses() {
    return [
      {
        _id: 'offline_course_1',
        title: 'Introduction to Computer Science (Offline)',
        description: 'Basic computer science concepts available offline',
        instructor: { name: 'Dr. Offline Instructor', email: 'instructor@offline.com' },
        category: 'Technology',
        price: 500,
        image: '/assets/images/aaulogo.png',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'offline_course_2',
        title: 'Mathematics Fundamentals (Offline)',
        description: 'Essential mathematics for students',
        instructor: { name: 'Prof. Math Teacher', email: 'math@offline.com' },
        category: 'Mathematics',
        price: 400,
        image: '/assets/images/aaulogo.png',
        createdAt: new Date().toISOString()
      }
    ];
  }

  getDefaultAssignments() {
    return [
      {
        _id: 'offline_assignment_1',
        title: 'Sample Assignment (Offline)',
        instructions: 'This is a sample assignment available in offline mode.',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        course: { _id: 'offline_course_1', title: 'Introduction to Computer Science (Offline)' },
        instructor: { name: 'Dr. Offline Instructor' },
        submissionStatus: 'pending',
        totalMarks: 100
      }
    ];
  }

  getDefaultPayments() {
    return [
      {
        _id: 'offline_payment_1',
        amount: 500,
        status: 'success',
        receiptNumber: 'OFF' + Date.now(),
        course: { title: 'Sample Course (Offline)' },
        createdAt: new Date().toISOString(),
        paymentMethod: 'offline'
      }
    ];
  }
}

export default new OfflineAPI();