import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  about: string | null;
  profileImage: string | null;
  profileProgress: number;
  courseCount: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class InstructorsService {
  constructor(private http: HttpClient) {}

  getInstructors(): Observable<Instructor[]> {
    return this.http.get<Instructor[]>('/api/users/instructors');
  }
}
