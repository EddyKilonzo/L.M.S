import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CourseProgress {
  enrollment: {
    id: string;
    progress: number;
    completed: boolean;
    completedAt?: Date;
  };
  completedLessons: number;
  totalLessons: number;
  progress: number;
  completedModules: number;
  totalModules: number;
  completedLessonIds: string[];
}

export interface EnrollmentStats {
  totalEnrollments: number;
  completedEnrollments: number;
  averageProgress: number;
  recentEnrollments: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private baseUrl = '/api/enrollments';

  constructor(private http: HttpClient) {}

  // Get student progress for a specific course
  getStudentProgress(courseId: string): Observable<CourseProgress> {
    return this.http.get<CourseProgress>(`${this.baseUrl}/progress/${courseId}`);
  }

  // Get enrollment statistics for a course (for instructors)
  getEnrollmentStats(courseId: string): Observable<EnrollmentStats> {
    return this.http.get<EnrollmentStats>(`${this.baseUrl}/course/${courseId}/stats`);
  }

  // Mark a lesson as complete
  markLessonComplete(lessonId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/lesson/${lessonId}/complete`, {});
  }

  // Update enrollment progress
  updateProgress(enrollmentId: string, progress: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${enrollmentId}/progress`, { progress });
  }
} 