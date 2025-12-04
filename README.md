# Human Risk Management LMS

A modern, full-stack Learning Management System for cybersecurity training.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## 🎯 Overview

This LMS delivers a comprehensive Human Risk Management course with 9 modules covering cybersecurity awareness, social engineering, insider threats, and risk management strategies.

### Key Features

- ✅ **9 Complete Modules** with video lessons, readings, and quizzes
- ✅ **Interactive Quizzing** with instant feedback and rationales
- ✅ **Progress Tracking** across lessons and modules
- ✅ **Media Placeholder System** for testing before content production
- ✅ **Responsive Design** (mobile, tablet, desktop)
- ✅ **Secure Authentication** with JWT tokens
- ✅ **Video Script Viewer** with scene breakdowns

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/hrm-lms.git
cd hrm-lms

# Install all dependencies
npm run install:all

# Seed the database with course content
npm run seed

# Start development servers (frontend + backend)
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

### Demo Credentials

- **Student**: `student@example.com` / `password123`
- **Admin**: `admin@example.com` / `admin123`

## 📁 Project Structure

```
MVP_LMS/
├── backend/          # Node.js + Express + TypeScript + SQLite
├── frontend/         # React + TypeScript + Vite + Tailwind CSS
├── README.md         # This file
├── FEATURE_CHECKLIST.md      # Complete feature list
├── NOTEBOOKLM_WORKFLOW.md    # Video production guide
└── MORNING_SUMMARY.md        # Development summary
```

## 🛠️ Technology Stack

### Backend
- Node.js with Express
- TypeScript
- SQLite3
- JWT Authentication
- bcrypt for password hashing

### Frontend
- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS
- Zustand (state management)
- React Router
- Axios

## 📚 Course Content

- **Module 0**: Introduction to Human Risk Management
- **Module 1**: The Human Risk Problem
- **Module 2**: Understanding the Human Risk Landscape
- **Module 3**: The Psychology of Social Engineering
- **Module 4**: Human Risk Triggers Across Employee Lifecycle
- **Module 5**: Social Engineering Attack Vectors
- **Module 6**: Insider Risk
- **Module 7**: Privilege Misuse and Access Exposure
- **Module 8**: Future Proofing Human Risk Management

Each module includes:
- 2 video lessons (with scripts and placeholders)
- 1 reading lesson
- 1 interactive quiz

## 🎨 Features in Detail

### Media Placeholder System
Test the complete user experience without waiting for video production. All media placeholders include:
- Descriptive text
- Timing information
- Visual indicators for type (image/audio/video)

### Interactive Quizzing
- Multiple-choice questions with instant feedback
- Detailed rationales for each answer
- Score tracking and passing thresholds
- Unlimited retry attempts

### Progress Tracking
- Real-time lesson completion tracking
- Module and overall course progress
- Visual progress bars
- Completion statistics

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt (10 rounds)
- Protected API routes
- CORS configuration
- SQL injection prevention
- Environment variable management

## 📖 Documentation

- [Feature Checklist](FEATURE_CHECKLIST.md) - Complete list of implemented features
- [NotebookLM Workflow](NOTEBOOKLM_WORKFLOW.md) - Guide for video content generation
- [Morning Summary](MORNING_SUMMARY.md) - Development overview and setup guide

## 🧪 Testing

```bash
# Backend tests (when implemented)
cd backend
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

## 🚢 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy the dist/ folder
```

### Backend (Heroku/Render/AWS)
```bash
cd backend
npm run build
# Deploy with your preferred platform
```

### Environment Variables

**Backend** (`.env`):
```
PORT=3000
NODE_ENV=production
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
DATABASE_PATH=./src/database/lms.db
CORS_ORIGIN=https://your-frontend-url.com
```

**Frontend** (`.env`):
```
VITE_API_URL=https://your-backend-url.com
```

## 🗺️ Roadmap

### Phase 2 (Planned)
- [ ] Video content integration (NotebookLM)
- [ ] Gamification (badges, streaks, leaderboards)
- [ ] Advanced analytics dashboard
- [ ] Discussion forums
- [ ] Certificate generation
- [ ] Mobile app (React Native)

## 🤝 Contributing

This is a private project. For team members:

1. Clone the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Development**: Built with Gemini AI assistance
- **Content**: Human Risk Management course materials
- **Design**: Custom cybersecurity theme

## 📞 Support

For questions or issues:
- Check the documentation in the project
- Review the FEATURE_CHECKLIST.md
- Contact the development team

## 🙏 Acknowledgments

- Course content based on Human Risk Management cybersecurity training
- Built with modern web technologies
- Designed for enterprise cybersecurity training

---

**Ready to deploy!** 🚀
