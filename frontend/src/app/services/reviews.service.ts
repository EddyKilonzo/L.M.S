import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  course: {
    id: string;
    title: string;
  };
}

export interface CourseReviewsResponse {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export interface CreateReviewRequest {
  courseId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  private baseUrl = '/api/reviews';

  constructor(private http: HttpClient) {}

  // Create a new review
  createReview(data: CreateReviewRequest): Observable<Review> {
    return this.http.post<Review>(this.baseUrl, data);
  }

  // Get all reviews for a course
  getCourseReviews(courseId: string): Observable<CourseReviewsResponse> {
    return this.http.get<CourseReviewsResponse>(`${this.baseUrl}/course/${courseId}`);
  }

  // Get current user's reviews
  getMyReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/my-reviews`);
  }

  // Get a specific review
  getReview(id: string): Observable<Review> {
    return this.http.get<Review>(`${this.baseUrl}/${id}`);
  }

  // Update a review
  updateReview(id: string, data: UpdateReviewRequest): Observable<Review> {
    return this.http.put<Review>(`${this.baseUrl}/${id}`, data);
  }

  // Delete a review
  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Get average rating for a course
  getCourseAverageRating(courseId: string): Observable<{ averageRating: number; totalReviews: number }> {
    return this.http.get<{ averageRating: number; totalReviews: number }>(`${this.baseUrl}/course/${courseId}/average-rating`);
  }
} 