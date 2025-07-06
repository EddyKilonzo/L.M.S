# 🎓 LMS - Learning Management System

A comprehensive Learning Management System built with **Angular** (Frontend) and **NestJS** (Backend), featuring role-based access control for Students, Instructors, and Administrators.

![LMS Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Angular](https://img.shields.io/badge/Angular-17-red)
![NestJS](https://img.shields.io/badge/NestJS-10-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)



## 🎯 Overview

This LMS is a full-featured learning management system designed to provide a seamless educational experience for students, instructors, and administrators. The system supports course creation, enrollment, progress tracking, assessments, and comprehensive analytics.

### Key Highlights

- **Multi-Role System**: Students, Instructors, and Administrators
- **Rich Content Support**: Videos, documents, quizzes, and interactive content
- **Progress Tracking**: Real-time progress monitoring and completion certificates
- **Analytics Dashboard**: Comprehensive insights for all user types
- **Responsive Design**: Works seamlessly across all devices
- **Secure Authentication**: JWT-based authentication with role-based access

## ✨ Features

### 🎓 For Students
- **Course Discovery**: Browse and search available courses
- **Enrollment System**: Easy course enrollment and payment processing
- **Learning Interface**: Interactive video player with progress tracking
- **Progress Monitoring**: Real-time progress bars and completion status
- **Certificate Generation**: Automatic certificate upon course completion
- **Review System**: Rate and review completed courses
- **Wishlist**: Save courses for later enrollment

### 👨‍🏫 For Instructors
- **Course Creation**: Comprehensive course creation tools
- **Content Management**: Upload videos, documents, and create quizzes
- **Student Analytics**: Monitor student progress and engagement
- **Revenue Tracking**: Track earnings and course performance
- **Communication Tools**: Interact with enrolled students
- **Course Analytics**: Detailed insights into course performance

### 👨‍💼 For Administrators
- **User Management**: Manage students and instructors
- **Platform Analytics**: Comprehensive dashboard with key metrics
- **Course Oversight**: Review and approve course submissions
- **Revenue Analytics**: Track platform revenue and growth
- **System Settings**: Configure platform-wide settings
- **Communication Center**: Broadcast messages to users

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Angular)     │◄──►│   (NestJS)      │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ • Components    │    │ • Controllers   │    │ • Users         │
│ • Services      │    │ • Services      │    │ • Courses       │
│ • Guards        │    │ • Guards        │    │ • Enrollments   │
│ • Interceptors  │    │ • Middleware    │    │ • Content       │
│ • Pipes         │    │ • Pipes         │    │ • Analytics     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Frontend Architecture
- **Angular 17**: Modern component-based architecture
- **Standalone Components**: Latest Angular features
- **Lazy Loading**: Optimized bundle loading
- **Reactive Forms**: Form validation and handling
- **HTTP Interceptors**: Request/response handling
- **Route Guards**: Authentication and authorization

### Backend Architecture
- **NestJS**: Scalable Node.js framework
- **Modular Design**: Feature-based module organization
- **JWT Authentication**: Secure token-based auth
- **Role-Based Access**: Granular permission system
- **Prisma ORM**: Type-safe database operations
- **File Upload**: Cloudinary integration for media

## 🛠️ Tech Stack

### Frontend
- **Angular 17** - Modern web framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **NgRx** - State management (if needed)
- **Angular Material** - UI components
- **Chart.js** - Data visualization

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Tokens
- **Cloudinary** - Cloud media management
- **Nodemailer** - Email functionality

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Jest** - Testing framework
- **Docker** - Containerization

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v13 or higher)
- **Git**

### Optional
- **Docker** (for containerized deployment)
- **Redis** (for caching, if needed)

## 🚀 Installation

### Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Database Setup

```bash
# Navigate to backend directory
cd backend

# Run database migrations
npx prisma migrate dev

# Seed the database (if seed script exists)
npm run seed
```

### Start Development Servers

```bash
# Start backend server (from backend directory)
npm run start:dev

# Start frontend server (from frontend directory, in new terminal)
npm start
```

The application will be available at:
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000

## ⚙️ Configuration

### Database Configuration

The application uses PostgreSQL with Prisma ORM. Key configuration files:

- `backend/prisma/schema.prisma` - Database schema
- `backend/prisma/migrations/` - Database migrations

### Authentication Configuration

JWT-based authentication is configured in:
- `backend/src/auth/jwt.strategy.ts`
- `backend/src/auth/auth.service.ts`

### File Upload Configuration

Cloudinary integration for media uploads:
- `backend/src/common/cloudinary/`
- Configured in environment variables

## 📖 Usage

### User Roles and Access

#### 👨‍🎓 Student Access
1. **Registration**: Sign up as a student
2. **Course Browsing**: Explore available courses
3. **Enrollment**: Enroll in courses
4. **Learning**: Access course content and track progress
5. **Certificates**: Receive completion certificates

#### 👨‍🏫 Instructor Access
1. **Registration**: Sign up as an instructor
2. **Course Creation**: Create and publish courses
3. **Content Management**: Upload videos and materials
4. **Student Management**: Monitor enrolled students
5. **Analytics**: View course performance metrics

#### 👨‍💼 Admin Access
1. **Dashboard**: Access comprehensive analytics
2. **User Management**: Manage all users
3. **Course Oversight**: Review and approve courses
4. **Platform Analytics**: Monitor platform health
5. **System Settings**: Configure platform settings

### Key Features Walkthrough

#### Course Creation (Instructors)
1. Navigate to course creation page
2. Fill in course details (title, description, price)
3. Upload course image
4. Create modules and lessons
5. Add content (videos, documents, quizzes)
6. Publish course

#### Course Enrollment (Students)
1. Browse available courses
2. View course details and reviews
3. Add to cart or enroll directly
4. Complete payment process
5. Access course content
6. Track progress and complete lessons

#### Progress Tracking
- Real-time progress bars
- Lesson completion status
- Course completion certificates
- Learning analytics

## 📚 API Documentation

### Authentication Endpoints

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify-email
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/check-status
```

### Course Endpoints

```http
GET    /api/courses
POST   /api/courses
GET    /api/courses/:id
PATCH  /api/courses/:id
DELETE /api/courses/:id
GET    /api/courses/search
GET    /api/courses/popular
```

### Enrollment Endpoints

```http
POST /api/enrollments/enroll/:courseId
GET  /api/enrollments/my-enrollments
GET  /api/enrollments/progress/:courseId
POST /api/enrollments/lesson/:lessonId/complete
```

### Analytics Endpoints

```http
GET /api/analytics/dashboard
GET /api/analytics/users/roles
GET /api/analytics/revenue-over-time
GET /api/analytics/reviews-summary
```

### Complete API Documentation

For detailed API documentation, visit:
- **Swagger UI**: http://localhost:3000/api/docs (when running)
- **Postman Collection**: Available in `/docs` folder

### REST Client Endpoints

The project includes REST client files for easy API testing. Located in `backend/restclient/`:

#### Authentication Endpoints
- `auth.http` - User registration, login, verification, password reset

#### Course Management
- `courses.http` - Course CRUD operations, search, popular courses
- `content.http` - Course content management (videos, documents, quizzes)

#### User Management
- `users.http` - User profile management, role updates
- `enrollments.http` - Course enrollment, progress tracking, lesson completion

#### Analytics & Reviews
- `analytics.http` - Dashboard statistics, revenue analytics, user analytics
- `reviews.http` - Course reviews and ratings

#### File Upload
- `cloudinary.http` - Media upload endpoints for images and videos

#### Usage Example
```http
### Login User
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

## 🧪 Testing

### Backend Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Testing

```bash
# Unit tests
ng test

# e2e tests
ng e2e

# Test coverage
ng test --code-coverage
```

### Manual Testing

Use the provided test accounts:

```bash
# Admin Account
Email: admin@example.com
Password: password123

# Instructor Account
Email: instructor@test.com
Password: password123

# Student Account
Email: student@test.com
Password: password123
```

## 🚀 Deployment

### Production Build

#### Backend Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

#### Frontend Deployment

```bash
# Build for production
ng build --configuration production

# Serve built files
npm run serve:prod
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individual containers
docker build -t lms-backend ./backend
docker build -t lms-frontend ./frontend
```



## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

### Code Style

- Use ESLint and Prettier for code formatting
- Follow Angular style guide
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. **Check** the [Issues](https://github.com/your-username/lms/issues) page
2. **Create** a new issue with detailed information
3. **Contact** the development team

### Common Issues

#### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env file
- Verify database permissions

#### Authentication Issues
- Check JWT_SECRET configuration
- Verify token expiration settings
- Ensure proper CORS configuration

#### File Upload Issues
- Verify Cloudinary credentials
- Check file size limits
- Ensure proper file types

## 🎉 Acknowledgments

- **Angular Team** for the amazing framework
- **NestJS Team** for the robust backend framework
- **Prisma Team** for the excellent ORM
- **Tailwind CSS** for the utility-first CSS framework
- **Cloudinary** for media management services

---

**Made with ❤️ by the LMS Development Team**

*Last updated: July 2025* 