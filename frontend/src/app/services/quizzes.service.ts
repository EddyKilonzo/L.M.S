import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface QuizSubmission {
  quizId: string;
  answers: Record<string, string>;
  timeSpent: number;
}

export interface QuizSubmissionResponse {
  message: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
}

@Injectable({
  providedIn: 'root',
})
export class QuizzesService {
  private apiUrl = 'http://localhost:3000/api/quizzes';

  constructor(private http: HttpClient) {}

  getQuizzes(): Observable<unknown[]> {
    return this.http.get<unknown[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  getQuiz(id: string): Observable<unknown> {
    return this.http
      .get<unknown>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  submitQuiz(data: QuizSubmission): Observable<QuizSubmissionResponse> {
    return this.http
      .post<QuizSubmissionResponse>(`${this.apiUrl}/submit`, data)
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
          () => new Error('Quiz not found. Please check the URL and try again.')
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
