import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from './auth.service';

export interface Instructor {
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

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  about?: string;
  profileImage?: string;
}

export interface UpdateUserResponse {
  message: string;
  user: User;
}

export interface DeleteUserResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  getInstructors(): Observable<Instructor[]> {
    return this.http
      .get<Instructor[]>(`${this.apiUrl}/instructors`)
      .pipe(catchError(this.handleError));
  }

  getUser(id: string): Observable<User> {
    return this.http
      .get<User>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  updateUser(id: string, userData: UpdateUserRequest): Observable<UpdateUserResponse> {
    return this.http
      .patch<UpdateUserResponse>(`${this.apiUrl}/${id}`, userData)
      .pipe(catchError(this.handleError));
  }

  deleteUser(id: string): Observable<DeleteUserResponse> {
    return this.http
      .delete<DeleteUserResponse>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
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
          () => new Error('User not found. Please check the URL and try again.')
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
