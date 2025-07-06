import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
}

export interface UserStats {
  role: string;
  _count: {
    role: number;
  };
}

export interface CourseEnrollmentStats {
  id: string;
  title: string;
  _count: {
    enrollments: number;
  };
}

export interface InstructorStats {
  courses: number;
  totalStudents: number;
  totalRevenue: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
}

export interface ReviewsSummary {
  totalReviews: number;
  averageRating: number;
  ratingCounts: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/analytics/dashboard`);
  }

  getUserStatsByRole(): Observable<UserStats[]> {
    return this.http.get<UserStats[]>(`${this.apiUrl}/analytics/users/roles`);
  }

  getCourseEnrollmentStats(): Observable<CourseEnrollmentStats[]> {
    return this.http.get<CourseEnrollmentStats[]>(`${this.apiUrl}/analytics/courses/enrollment-stats`);
  }

  getInstructorStats(instructorId: string): Observable<InstructorStats> {
    return this.http.get<InstructorStats>(`${this.apiUrl}/analytics/instructor/${instructorId}`);
  }

  getRevenueOverTime(): Observable<RevenueData[]> {
    return this.http.get<RevenueData[]>(`${this.apiUrl}/analytics/revenue-over-time`);
  }

  getReviewsSummary(): Observable<ReviewsSummary> {
    return this.http.get<ReviewsSummary>(`${this.apiUrl}/analytics/reviews-summary`);
  }
} 