import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class QuizzesService {
  private apiUrl = 'http://localhost:3000/api/quizzes';

  constructor(private http: HttpClient) {}

  getQuiz(courseId: string): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/${courseId}`)
      .pipe(catchError(this.handleError));
  }

  submitQuiz(data: any): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/submit`, data)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('An error occurred', error);
    return throwError(error);
  }
}
