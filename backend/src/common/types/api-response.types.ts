// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// User Types
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isVerified: boolean;
  /** Optional 'about' text; may be null */
  about?: string | null;
  /** Profile completion percentage */
  profileProgress?: number;
  /** Profile image URL */
  profileImage?: string | null;
  /** User creation date */
  createdAt: Date;
}

export interface UserWithTokenResponse {
  access_token: string;
  user: UserResponse;
}

// Course Types
export interface CourseResponse {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  prerequisites: string[];
  categoryId: string;
  difficulty: string;
  instructorId: string;
  price: number;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseWithInstructorResponse extends CourseResponse {
  instructor: UserResponse;
}

export interface CourseWithCategoryResponse extends CourseResponse {
  category: {
    id: string;
    name: string;
  };
}

export interface CourseWithInstructorAndCategoryResponse
  extends CourseResponse {
  instructor: UserResponse;
  category: {
    id: string;
    name: string;
  };
  averageRating?: number;
  totalReviews?: number;
  _count?: {
    enrollments: number;
    reviews: number;
  };
}

// Quiz Types
export interface QuizQuestionResponse {
  id: string;
  text: string;
  type: string;
  options: string[];
  correctAnswer: string;
}

export interface QuizResponse {
  id: string;
  title: string;
  description: string | null;
  courseId: string;
  timeLimit: number | null;
  questions: QuizQuestionResponse[];
}

export interface QuizWithCourseResponse extends QuizResponse {
  course: CourseResponse;
}

export interface QuizWithAttemptsResponse extends QuizResponse {
  _count: {
    attempts: number;
  };
}

// Content Types
export interface LessonResponse {
  id: string;
  title: string;
  description?: string;
  contentType: string;
  contentUrl?: string;
  order: number;
  moduleId: string;
}

export interface ModuleResponse {
  id: string;
  title: string;
  description?: string;
  order: number;
  courseId: string;
  lessons: LessonResponse[];
}

export interface ModuleWithCourseResponse extends ModuleResponse {
  course: CourseResponse;
}

export interface LessonWithModuleResponse extends LessonResponse {
  module: ModuleResponse;
}

export interface LessonWithCompletionsResponse extends LessonResponse {
  completedBy: Array<{
    student: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
}

// Enrollment Types
export interface EnrollmentResponse {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: Date;
  progress: number;
  completed: boolean;
  completedAt?: Date;
  certificateUrl?: string;
}

export interface EnrollmentWithCourseResponse extends EnrollmentResponse {
  course: CourseResponse;
}

export interface EnrollmentWithStudentResponse extends EnrollmentResponse {
  student: UserResponse;
}

export interface EnrollmentWithStudentAndCourseResponse
  extends EnrollmentResponse {
  student: UserResponse;
  course: CourseWithInstructorResponse;
}

// Analytics Types
export interface DashboardStatsResponse {
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
}

export interface UserStatsResponse {
  role: string;
  _count: { role: number };
}

export interface CourseEnrollmentStatsResponse {
  id: string;
  title: string;
  _count: { enrollments: number };
}

export interface InstructorStatsResponse {
  courses: number;
  totalStudents: number;
  totalRevenue: number;
}

export interface StudentProgressResponse {
  id: string;
  progress: number;
  completed: boolean;
  enrolledAt: Date;
  course: {
    id: string;
    title: string;
  };
}

// Student Lesson Completion Types
export interface StudentLessonCompletionResponse {
  id: string;
  studentId: string;
  lessonId: string;
  completedAt: Date;
}

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QuizAttemptResponse {
  id: string;
  studentId: string;
  quizId: string;
  score: number | null;
  submittedAt: Date;
  answers: any;
  isCompleted: boolean;
}

export interface QuizAttemptWithQuizResponse extends QuizAttemptResponse {
  quiz: QuizResponse;
}
