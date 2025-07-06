import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Course {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  prerequisites: string[];
  categoryId: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  price: number;
  imageUrl?: string;
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
    about?: string;
  };
  category: {
    id: string;
    name: string;
  };
  modules: Array<{
    id: string;
    title: string;
    description: string;
    order: number;
    lessons: Array<{
      id: string;
      title: string;
      description: string;
      contentType: 'video' | 'pdf' | 'text';
      contentUrl?: string;
      order: number;
    }>;
  }>;
  _count: {
    reviews: number;
    enrollments: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseData {
  title: string;
  description: string;
  objectives: string[];
  prerequisites: string[];
  categoryId: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  price: number;
  imageUrl?: string;
  modules: {
    title: string;
    description: string;
    order: number;
    lessons: {
      title: string;
      description: string;
      contentType: 'video' | 'pdf' | 'text';
      contentUrl?: string;
      order: number;
    }[];
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class CoursesService {
  private apiUrl = 'http://localhost:3000/api/courses';

  constructor(private http: HttpClient) {}

  getCourses(params: HttpParams = new HttpParams()): Observable<{ data: Course[] }> {
    return this.http
      .get<{ data: Course[] }>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  getCourse(id: string): Observable<Course> {
    return this.http
      .get<Course>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getRelatedCourses(courseId: string): Observable<Course[]> {
    return this.http
      .get<Course[]>(`${this.apiUrl}/${courseId}/related`)
      .pipe(catchError(this.handleError));
  }

  createCourse(courseData: CreateCourseData): Observable<Course> {
    return this.http
      .post<Course>(this.apiUrl, courseData)
      .pipe(catchError(this.handleError));
  }

  updateCourse(
    id: string,
    courseData: Partial<CreateCourseData>
  ): Observable<Course> {
    return this.http
      .patch<Course>(`${this.apiUrl}/${id}`, courseData)
      .pipe(catchError(this.handleError));
  }

  deleteCourse(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getMyCourses(): Observable<Course[]> {
    return this.http
      .get<Course[]>(`${this.apiUrl}/my-courses`)
      .pipe(catchError(this.handleError));
  }

  getCoursesByInstructor(instructorId: string): Observable<Course[]> {
    return this.http
      .get<Course[]>(`${this.apiUrl}/instructor/${instructorId}`)
      .pipe(catchError(this.handleError));
  }

  getCategories(): Observable<{ id: string; name: string }[]> {
    return this.http.get<{ id: string; name: string }[]>(`${this.apiUrl}/categories`).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred', error);

    if (error.status === 0) {
      return throwError(
        () =>
          new Error(
            'Unable to connect to server. Please check your internet connection.'
          )
      );
    }

    if (error.status === 401) {
      return throwError(
        () => new Error('Please log in to access this resource.')
      );
    }

    if (error.status === 403) {
      return throwError(
        () =>
          new Error(
            'Access denied. You do not have permission to perform this action.'
          )
      );
    }

    if (error.status === 404) {
      return throwError(
        () => new Error('Course not found. Please check the URL and try again.')
      );
    }

    if (error.status >= 500) {
      return throwError(
        () => new Error('Server error. Please try again later.')
      );
    }

    return throwError(() => error);
  }
}
