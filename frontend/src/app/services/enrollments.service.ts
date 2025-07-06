import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completed: boolean;
  progress: number;
  course: {
    id: string;
    title: string;
    price: number;
    instructor: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
}

export interface EnrollmentResponse {
  message: string;
  enrollment: Enrollment;
}

@Injectable({
  providedIn: 'root',
})
export class EnrollmentsService {
  private apiUrl = 'http://localhost:3000/api/enrollments';

  constructor(private http: HttpClient) {}

  getEnrollments(): Observable<Enrollment[]> {
    return this.http
      .get<Enrollment[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getMyEnrollments(): Observable<Enrollment[]> {
    return this.http
      .get<Enrollment[]>(`${this.apiUrl}/my-enrollments`)
      .pipe(catchError(this.handleError));
  }

  getCourseEnrollments(courseId: string): Observable<Enrollment[]> {
    return this.http
      .get<Enrollment[]>(`${this.apiUrl}/course/${courseId}`)
      .pipe(catchError(this.handleError));
  }

  enrollInCourse(courseId: string): Observable<EnrollmentResponse> {
    return this.http
      .post<EnrollmentResponse>(`${this.apiUrl}`, { courseId })
      .pipe(catchError(this.handleError));
  }

  enroll(courseId: string): Observable<EnrollmentResponse> {
    return this.enrollInCourse(courseId);
  }

  private handleError(error: Error | unknown) {
    console.error('An error occurred', error);

    // Handle HTTP errors
    if (error && typeof error === 'object' && 'status' in error) {
      const httpError = error as { status: number; message?: string };

      if (httpError.status === 0) {
        return throwError(
          () =>
            new Error(
              'Unable to connect to server. Please check your internet connection.'
            )
        );
      }

      if (httpError.status === 401) {
        return throwError(
          () => new Error('Please log in to access this resource.')
        );
      }

      if (httpError.status === 403) {
        return throwError(
          () =>
            new Error(
              'Access denied. You do not have permission to perform this action.'
            )
        );
      }

      if (httpError.status === 404) {
        return throwError(
          () => new Error('Enrollment not found. Please try again.')
        );
      }

      if (httpError.status >= 500) {
        return throwError(
          () => new Error('Server error. Please try again later.')
        );
      }
    }

    return throwError(() => error);
  }
}
