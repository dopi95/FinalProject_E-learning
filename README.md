<p align="center">
  <img src="frontend/public/assets/images/aaulogo.png" alt="Addis Ababa University Logo" width="120"/>
</p>

<h1 align="center">AAU E-Learning System</h1>

<p align="center">
  <strong>Addis Ababa University — School of Commerce</strong><br/>
  Department of Business and Information Systems (BAIS)<br/>
  Final Year Project — 2025/2026
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/AI-Groq%20LLaMA%203.3-FF6B35?style=flat" />
  <img src="https://img.shields.io/badge/Status-Completed-brightgreen?style=flat" />
</p>

---

## 📖 About the Project

The **AAU E-Learning System** is a full-stack web application developed as a final year project by BAIS students at the **Addis Ababa University School of Commerce**. It is a modern, feature-rich e-learning platform that enables students and instructors to interact, manage courses, submit assignments, take exams, and communicate — all in one place.

The platform is powered by the **MERN stack** and integrates **Groq AI (LLaMA 3.3)** for an intelligent chatbot assistant that helps users navigate the platform in real time.

---

## 👥 Project Team

| Name | Role |
|------|------|
| **Bamlak Shemeles** | Project Manager |
| **Dawit Geleta** | System Analyst |
| **Eyob Kiros** | Frontend Developer |
| **Elyas Yenealem** | Backend Developer, QA Tester & AI Integration |

> **Institution:** Addis Ababa University, School of Commerce  
> **Program:** Bachelor of Arts in Information Systems (BAIS)  
> **Academic Year:** 2025/2026

---

## ✨ Features

### 🔐 Authentication & Users
- JWT-based secure login & registration
- Email verification with OTP
- Forgot password & reset password
- Role-based access: **Student**, **Instructor**, **Admin**, **Super Admin**
- Profile management with image upload (Cloudinary)

### 📚 Course Management
- Create, update, and delete courses with images
- Category-based course filtering
- Course enrollment with payment integration
- Featured courses display
- Course materials upload & download

### 💳 Payments
- Chapa payment gateway integration
- Individual & bulk payment support
- Payment receipts & history
- Public receipt verification

### 📝 Assignments & Exams
- Instructors create and send assignments
- Students submit assignment files
- Instructors grade submissions
- Online exam creation with publish/unpublish
- Student exam submission & results

### 📊 Grades & Attendance
- Grade submission (individual & bulk)
- Student grade tracking
- Attendance management per course session

### 💬 Communication
- Real-time chat between students and instructors (course-based)
- AI-powered chatbot assistant (Groq LLaMA 3.3-70b)
- Chat history saved per user session
- Notifications system (admin broadcasts)
- Comment sections on courses

### 🎬 Video Reels
- Instructors upload short educational video reels
- Like, comment, and view tracking
- Reel management dashboard

### 📅 Schedules
- Course schedule creation and management
- Schedule update requests by instructors
- Admin approval workflow for schedule changes
- Live session link integration

### 🌐 Other
- Multi-language support (i18n)
- Dark mode support
- PWA (Progressive Web App) support
- Newsletter subscription
- Contact form with email notifications
- Admin activity logging
- Super Admin dashboard with full platform stats

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Tailwind CSS, React Router, Vite |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose) |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs |
| **AI Chatbot** | Groq API — LLaMA 3.3-70b-versatile |
| **File Storage** | Cloudinary |
| **Email Service** | Brevo (Sendinblue) |
| **Payment** | Chapa Payment Gateway |
| **Deployment** | Render (Backend), Vercel (Frontend) |

---

## 🗂️ Project Structure

```
FinalProject_E-learning/
├── backend/
│   ├── config/          # DB & Cloudinary config
│   ├── middleware/       # Auth & online status middleware
│   ├── models/          # Mongoose models (User, Course, etc.)
│   ├── routes/          # Express API routes
│   ├── utils/           # Email, notifications, helpers
│   ├── uploads/         # Local file uploads
│   ├── .env             # Environment variables
│   └── server.js        # Entry point
│
├── frontend/
│   ├── public/          # Static assets & PWA files
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Page-level components
│       ├── services/    # API service layer (api.js)
│       ├── contexts/    # React contexts (Theme)
│       ├── utils/       # Utility helpers
│       ├── App.jsx      # Root component & routes
│       └── main.jsx     # Entry point
│
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Groq API key ([console.groq.com](https://console.groq.com))

### 1. Clone the repository
```bash
git clone https://github.com/dopi95/FinalProject_E-learning.git
cd FinalProject_E-learning
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=3001
NODE_ENV=development
JWT_SECRET=your_jwt_secret
BREVO_API_KEY=your_brevo_api_key
BREVO_EMAIL=your_email
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CHAPA_SECRET_KEY=your_chapa_secret_key
FRONTEND_URL=http://localhost:5173
GROQ_API_KEY=your_groq_api_key
```

```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🌍 Deployment

| Service | URL |
|---------|-----|
| **Frontend** | Vercel — `https://aau-e-learning.vercel.app` |
| **Backend** | Render — `https://your-backend.onrender.com` |

> Make sure all environment variables are configured in both Render and Vercel dashboards.

---

## 📡 API Overview

| Module | Endpoint |
|--------|----------|
| Auth | `/api/auth` |
| Courses | `/api/courses` |
| Enrollments | `/api/enrollments` |
| Assignments | `/api/assignments` |
| Exams | `/api/exams` |
| Grades | `/api/grades` |
| Attendance | `/api/attendance` |
| Payments | `/api/payments` |
| Chat | `/api/chat` |
| AI Chatbot | `/api/groq-chat` |
| Schedules | `/api/schedules` |
| Materials | `/api/materials` |
| Reels | `/api/reels` |
| Notifications | `/api/notifications` |
| Users | `/api/users` |

---

## 🤖 AI Chatbot

The platform includes an intelligent AI assistant powered by **Groq's LLaMA 3.3-70b-versatile** model. It:

- Answers questions about courses, enrollment, pricing, and platform features
- Maintains conversation history for context-aware responses
- Saves chat sessions per logged-in user
- Supports chat history management (rename, delete, new session)

---

## 📄 License

This project was developed for academic purposes at **Addis Ababa University, School of Commerce** as a final year project for the BAIS program.

---

<p align="center">
  Made with ❤️ by BAIS Students — Addis Ababa University, School of Commerce &nbsp;|&nbsp; 2025/2026
</p>
