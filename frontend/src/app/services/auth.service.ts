import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isVerified: boolean;
    createdAt: Date;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is logged in on app start
    this.checkAuthStatus();
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  get currentUser(): any {
    return this.currentUserSubject.value;
  }

  private checkAuthStatus() {
    console.log('Checking auth status...');
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');

    console.log('Auth data from localStorage:', {
      hasToken: !!token,
      hasUser: !!user,
    });

    if (token && user) {
      try {
        const userData = JSON.parse(user);
        console.log('Restored user state:', {
          id: userData.id,
          role: userData.role,
          isVerified: userData.isVerified,
        });
        this.currentUserSubject.next(userData);
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

  login(data: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((response) => {
        // Store token and user data
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      }),
      catchError(this.handleError)
    );
  }

  register(data: any): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/register`, data)
      .pipe(catchError(this.handleError));
  }

  verifyCode(email: string, code: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/verify-code`, { email, code })
      .pipe(catchError(this.handleError));
  }

  resendVerificationCode(email: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/resend-verification`, { email })
      .pipe(catchError(this.handleError));
  }

  checkUserStatus(email: string): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/check-status?email=${email}`)
      .pipe(catchError(this.handleError));
  }

  forgotPassword(email: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/forgot-password`, { email })
      .pipe(catchError(this.handleError));
  }

  logout() {
    console.log('AuthService logout called');
    this.clearAuthData();
    console.log('AuthService logout completed - auth data cleared');
  }

  public updateCurrentUser(user: any) {
    this.currentUserSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  private handleError(error: any) {
    console.error('An error occurred', error);

    // Provide more specific error messages
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
        () =>
          new Error(
            'Invalid credentials. Please check your email and password.'
          )
      );
    }

    if (error.status === 403) {
      return throwError(() => new Error('Access denied. Please log in again.'));
    }

    if (error.status === 404) {
      return throwError(
        () => new Error('Service not found. Please contact support.')
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
