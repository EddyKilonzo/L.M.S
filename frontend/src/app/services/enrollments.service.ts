import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class EnrollmentsService {
  private apiUrl = 'http://localhost:3000/api/enrollments';

  constructor(private http: HttpClient) {}

  enroll(courseId: string): Observable<any> {
    return this.http
      .post(this.apiUrl, { courseId })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('An error occurred', error);
    return throwError(error);
  }
}
