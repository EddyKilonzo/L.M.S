import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CoursesService {
  private apiUrl = 'http://localhost:3000/api/courses';

  constructor(private http: HttpClient) {}

  getCourses(): Observable<any> {
    return this.http.get(this.apiUrl).pipe(catchError(this.handleError));
  }

  getCourse(id: string): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
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
            'Please log in to access this resource.'
          )
      );
    }

    if (error.status === 403) {
      return throwError(() => new Error('Access denied. You do not have permission to perform this action.'));
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
