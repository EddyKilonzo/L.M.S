import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  isVerified: boolean;
  createdAt: Date;
  about?: string;
  profileImage?: string;
  profileProgress?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'INSTRUCTOR' | 'STUDENT';
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface VerificationRequest {
  email: string;
  code: string;
}

export interface VerificationResponse {
  message: string;
}

export interface UserStatusResponse {
  exists: boolean;
  isVerified: boolean;
  role?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Check if user is logged in on app start
    this.checkAuthStatus();
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private checkAuthStatus() {
    console.log('AuthService checkAuthStatus called');
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');

    console.log('Auth data from localStorage:', {
      hasToken: !!token,
      hasUser: !!user,
      tokenLength: token?.length,
      userLength: user?.length
    });

    if (token && user) {
      try {
        const userData: User = JSON.parse(user);
        console.log('AuthService parsed user data:', userData);
        console.log('Restored user state:', {
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          isVerified: userData.isVerified,
        });
        console.log('AuthService setting currentUserSubject to restored user:', userData);
        this.currentUserSubject.next(userData);
        console.log('AuthService currentUserSubject set to restored user');
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        this.clearAuthData();
      }
    } else {
      console.log('No auth data found in localStorage');
      this.clearAuthData();
    }
  }

  private clearAuthData() {
    console.log('Clearing auth data...');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('pendingVerificationEmail');
    this.currentUserSubject.next(null);
    console.log('Auth data cleared, user subject set to null');
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    console.log('AuthService login called with:', data);
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((response) => {
        console.log('AuthService login response received:', response);
        console.log('User data from response:', response.user);
        // Store token and user data
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        console.log('AuthService setting currentUserSubject to:', response.user);
        this.currentUserSubject.next(response.user);
        console.log('AuthService currentUserSubject updated');
      }),
      catchError(this.handleError)
    );
  }

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http
      .post<RegisterResponse>(`${this.apiUrl}/register`, data)
      .pipe(catchError(this.handleError));
  }

  verifyCode(email: string, code: string): Observable<VerificationResponse> {
    return this.http
      .post<VerificationResponse>(`${this.apiUrl}/verify-code`, { email, code })
      .pipe(catchError(this.handleError));
  }

  resendVerificationCode(email: string): Observable<VerificationResponse> {
    return this.http
      .post<VerificationResponse>(`${this.apiUrl}/resend-verification`, { email })
      .pipe(catchError(this.handleError));
  }

  checkUserStatus(email: string): Observable<UserStatusResponse> {
    return this.http
      .get<UserStatusResponse>(`${this.apiUrl}/check-status?email=${email}`)
      .pipe(catchError(this.handleError));
  }

  forgotPassword(email: string): Observable<ForgotPasswordResponse> {
    return this.http
      .post<ForgotPasswordResponse>(`${this.apiUrl}/forgot-password`, { email })
      .pipe(catchError(this.handleError));
  }

  logout() {
    console.log('AuthService logout called');
    this.clearAuthData();
    console.log('AuthService logout completed - auth data cleared');
  }

  public updateCurrentUser(user: User) {
    this.currentUserSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  private handleError(error: Error | unknown) {
    console.error('An error occurred', error);

    // Handle HTTP errors
    if (error && typeof error === 'object' && 'status' in error) {
      const httpError = error as { status: number; message?: string };

      // Provide more specific error messages
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
          () =>
            new Error(
              'Invalid credentials. Please check your email and password.'
            )
        );
      }

      if (httpError.status === 403) {
        return throwError(() => new Error('Access denied. Please log in again.'));
      }

      if (httpError.status === 404) {
        return throwError(
          () => new Error('Service not found. Please contact support.')
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
