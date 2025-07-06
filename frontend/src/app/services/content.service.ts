import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Content {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'text';
  url?: string;
  content?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentResponse {
  message: string;
  content: Content;
}

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private apiUrl = 'http://localhost:3000/api/content';

  constructor(private http: HttpClient) {}

  getContent(id: string): Observable<Content> {
    return this.http
      .get<Content>(`${this.apiUrl}/${id}`)
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
          () => new Error('Content not found. Please try again.')
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
