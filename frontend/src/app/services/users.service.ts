import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isVerified: boolean;
  about?: string;
  profileImage?: string;
  profileProgress?: number;
  createdAt: string;
  courseCount: number;
  _count?: {
    coursesTaught: number;
    enrollments: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any> {
    return this.http.get(this.apiUrl).pipe(catchError(this.handleError));
  }

  getInstructors(): Observable<Instructor[]> {
    return this.http
      .get<Instructor[]>(`${this.apiUrl}/instructors`)
      .pipe(catchError(this.handleError));
  }

  getUser(id: string): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  updateUser(id: string, userData: any): Observable<any> {
    return this.http
      .patch(`${this.apiUrl}/${id}`, userData)
      .pipe(catchError(this.handleError));
  }

  deleteUser(id: string): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
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
        () => new Error('User not found. Please check the URL and try again.')
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
