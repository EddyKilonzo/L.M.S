# LMS Backend

A comprehensive Learning Management System backend built with NestJS, Prisma, and PostgreSQL.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (Admin, Instructor, Student)
- **User Management**: Complete user lifecycle management
- **Course Management**: Create, read, update, delete courses with modules and lessons
- **Content Management**: Manage course modules and lessons
- **Enrollment System**: Student enrollment and progress tracking
- **Quiz System**: Create and manage quizzes with automatic scoring
- **Analytics Dashboard**: Basic analytics for admins and instructors

## Project Structure

```
src/
├── auth/                    # Authentication & Authorization
├── users/                   # User management
├── courses/                 # Course management
├── content/                 # Content management (modules, lessons)
├── enrollments/             # Enrollment & progress tracking
├── quizzes/                 # Quiz & Assessment System
├── analytics/               # Analytics Dashboard
├── prisma/                  # Prisma service
└── common/                  # Shared utilities, guards, decorators
```

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables in `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/lms_db"
   JWT_SECRET="your_super_secret_jwt_key_here_change_in_production"
   ```

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

4. Run database migrations:
   ```bash
   npx prisma db push
   ```

## Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

### Users
- `GET /users` - Get all users (Admin only)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user (Admin only)
- `DELETE /users/:id` - Delete user (Admin only)

### Courses
- `GET /courses` - Get all courses
- `GET /courses/:id` - Get course by ID
- `POST /courses` - Create course (Admin/Instructor)
- `PATCH /courses/:id` - Update course (Admin/Instructor)
- `DELETE /courses/:id` - Delete course (Admin)

### Content Management
- `POST /content/modules` - Create module (Admin/Instructor)
- `POST /content/lessons` - Create lesson (Admin/Instructor)
- `GET /content/courses/:courseId/modules` - Get course modules
- `GET /content/modules/:id` - Get module details
- `GET /content/lessons/:id` - Get lesson details

### Enrollments
- `POST /enrollments/enroll/:courseId` - Enroll in course (Student)
- `GET /enrollments/student/:studentId` - Get student enrollments
- `GET /enrollments/course/:courseId` - Get course enrollments (Admin/Instructor)
- `POST /enrollments/lesson/:lessonId/complete` - Mark lesson complete (Student)

### Quizzes
- `POST /quizzes` - Create quiz (Admin/Instructor)
- `GET /quizzes/course/:courseId` - Get course quizzes
- `GET /quizzes/:id` - Get quiz details
- `POST /quizzes/:quizId/submit` - Submit quiz (Student)

### Analytics
- `GET /analytics/dashboard` - Dashboard stats (Admin)
- `GET /analytics/instructor/:instructorId` - Instructor stats
- `GET /analytics/student/:studentId/progress` - Student progress

## Database Schema

The database includes the following main entities:
- Users (with roles: Admin, Instructor, Student)
- Courses with categories and difficulty levels
- Course modules and lessons
- Enrollments and progress tracking
- Quizzes and quiz attempts
- Reviews and ratings
- Discussion forums and messaging

## Development

### Adding New Features

1. Create a new module in `src/`
2. Add the module to `app.module.ts`
3. Update the Prisma schema if needed
4. Run `npx prisma generate` to regenerate the client
5. Add appropriate guards and decorators for authorization

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the UNLICENSED license.
