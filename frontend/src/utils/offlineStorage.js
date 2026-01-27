class OfflineStorage {
  constructor() {
    this.dbName = 'AAU_ELearning_DB';
    this.version = 1;
    this.db = null;
    this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Users store
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'email' });
          userStore.createIndex('role', 'role', { unique: false });
        }
        
        // Courses store
        if (!db.objectStoreNames.contains('courses')) {
          const courseStore = db.createObjectStore('courses', { keyPath: '_id' });
          courseStore.createIndex('instructor', 'instructor', { unique: false });
        }
        
        // Enrollments store
        if (!db.objectStoreNames.contains('enrollments')) {
          const enrollmentStore = db.createObjectStore('enrollments', { keyPath: 'id', autoIncrement: true });
          enrollmentStore.createIndex('userEmail', 'userEmail', { unique: false });
          enrollmentStore.createIndex('courseId', 'courseId', { unique: false });
        }
        
        // Assignments store
        if (!db.objectStoreNames.contains('assignments')) {
          const assignmentStore = db.createObjectStore('assignments', { keyPath: '_id' });
          assignmentStore.createIndex('courseId', 'courseId', { unique: false });
        }
        
        // Materials store
        if (!db.objectStoreNames.contains('materials')) {
          const materialStore = db.createObjectStore('materials', { keyPath: '_id' });
          materialStore.createIndex('courseId', 'courseId', { unique: false });
        }
        
        // Payments store
        if (!db.objectStoreNames.contains('payments')) {
          const paymentStore = db.createObjectStore('payments', { keyPath: '_id' });
          paymentStore.createIndex('userEmail', 'userEmail', { unique: false });
        }
      };
    });
  }

  async addUser(user) {
    const transaction = this.db.transaction(['users'], 'readwrite');
    const store = transaction.objectStore('users');
    return store.put(user);
  }

  async getUser(email) {
    const transaction = this.db.transaction(['users'], 'readonly');
    const store = transaction.objectStore('users');
    return store.get(email);
  }

  async addCourse(course) {
    const transaction = this.db.transaction(['courses'], 'readwrite');
    const store = transaction.objectStore('courses');
    return store.put(course);
  }

  async getCourses() {
    const transaction = this.db.transaction(['courses'], 'readonly');
    const store = transaction.objectStore('courses');
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  }

  async addEnrollment(enrollment) {
    const transaction = this.db.transaction(['enrollments'], 'readwrite');
    const store = transaction.objectStore('enrollments');
    return store.put(enrollment);
  }

  async getUserEnrollments(userEmail) {
    const transaction = this.db.transaction(['enrollments'], 'readonly');
    const store = transaction.objectStore('enrollments');
    const index = store.index('userEmail');
    return new Promise((resolve) => {
      const request = index.getAll(userEmail);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async addAssignment(assignment) {
    const transaction = this.db.transaction(['assignments'], 'readwrite');
    const store = transaction.objectStore('assignments');
    return store.put(assignment);
  }

  async getAssignments() {
    const transaction = this.db.transaction(['assignments'], 'readonly');
    const store = transaction.objectStore('assignments');
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  }

  async addPayment(payment) {
    const transaction = this.db.transaction(['payments'], 'readwrite');
    const store = transaction.objectStore('payments');
    return store.put(payment);
  }

  async getUserPayments(userEmail) {
    const transaction = this.db.transaction(['payments'], 'readonly');
    const store = transaction.objectStore('payments');
    const index = store.index('userEmail');
    return new Promise((resolve) => {
      const request = index.getAll(userEmail);
      request.onsuccess = () => resolve(request.result);
    });
  }
}

export default new OfflineStorage();