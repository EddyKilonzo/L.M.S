import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedNavbar } from '../shared/navbar/navbar.component';
import { ActivatedRoute } from '@angular/router';
import { CoursesService } from '../services/courses.service';
import { AuthService } from '../services/auth.service';
import { ReviewsService, Review, CourseReviewsResponse } from '../services/reviews.service';
import { ToastService } from '../services/toast.service';

import { Course } from '../services/courses.service';

interface CourseModule extends Omit<Course['modules'][0], 'open'> {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Array<{
    id: string;
    title: string;
    description: string;
    contentType: 'video' | 'pdf' | 'text';
    contentUrl?: string;
    order: number;
  }>;
  open: boolean;
}

interface CourseWithOpenModules extends Omit<Course, 'modules'> {
  modules: CourseModule[];
}

@Component({
  selector: 'app-course-page',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedNavbar],
  templateUrl: './course-page.component.html',
  styleUrls: ['./course-page.component.css'],
})
export class CoursePageComponent implements OnInit {
  course: CourseWithOpenModules | null = null;
  loading = true;
  error: string | null = null;
  relatedCourses: Course[] = [];
  activeTab: 'description' | 'instructor' | 'syllabus' | 'reviews' = 'description';
  
  // Reviews
  reviews: Review[] = [];
  reviewsResponse: CourseReviewsResponse | null = null;
  loadingReviews = false;
  user: any = null;

  constructor(
    private route: ActivatedRoute,
    private coursesService: CoursesService,
    private authService: AuthService,
    private reviewsService: ReviewsService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.user = this.authService.currentUser;
    
    this.route.params.subscribe((params) => {
      const courseId = params['id'];
      if (courseId) {
        this.loadCourse(courseId);
        this.loadRelatedCourses(courseId);
        this.loadCourseReviews(courseId);
      }
    });
  }

  loadCourse(courseId: string) {
    this.loading = true;
    this.error = null;

    this.coursesService.getCourse(courseId).subscribe({
      next: (course: Course) => {
        if (course) {
          // Add 'open' property to modules in a type-safe way
          const courseWithOpenModules: CourseWithOpenModules = {
            ...course,
            modules: course.modules.map((module) => ({
              ...module,
              open: false,
            })),
          };
          this.course = courseWithOpenModules;
          this.loadRelatedCourses(course.id); // Load related courses after loading the main course
        } else {
          this.error = 'Course not found';
        }
        this.loading = false;
      },
      error: (error: unknown) => {
        console.error('Error loading course:', error);
        this.error = 'Failed to load course details. Please try again later.';
        this.loading = false;
      },
    });
  }

  loadRelatedCourses(courseId: string) {
    this.coursesService.getRelatedCourses(courseId).subscribe({
      next: (courses: Course[]) => {
        // Filter out the current course and take max 3 related courses
        this.relatedCourses = courses
          .filter((c) => c.id !== courseId)
          .slice(0, 3);
      },
      error: (error: unknown) => {
        console.error('Error loading related courses:', error);
        this.relatedCourses = []; // Reset on error
      },
    });
  }

  toggleModule(module: CourseModule) {
    if (!module) return;
    module.open = !module.open;
  }

  getInstructorName(): string {
    if (!this.course?.instructor) return 'Unknown Instructor';
    const { firstName, lastName } = this.course.instructor;
    return `${firstName} ${lastName}`;
  }

  getInstructorInitials(): string {
    if (!this.course?.instructor) return '??';
    const { firstName, lastName } = this.course.instructor;
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }

  getInstructorImage(): string {
    if (!this.course?.instructor?.profileImage) return '';
    return this.course.instructor.profileImage;
  }

  getTotalLessons(): number {
    if (!this.course?.modules) return 0;
    return this.course.modules.reduce(
      (total, module) => total + (module.lessons?.length || 0),
      0
    );
  }

  getTotalModules(): number {
    return this.course?.modules?.length || 0;
  }

  get isAdmin(): boolean {
    return this.authService.currentUser?.role === 'ADMIN';
  }

  setActiveTab(tab: 'description' | 'instructor' | 'syllabus' | 'reviews') {
    this.activeTab = tab;
  }

  loadCourseReviews(courseId: string) {
    this.loadingReviews = true;
    this.reviewsService.getCourseReviews(courseId).subscribe({
      next: (response) => {
        this.reviews = response.reviews;
        this.reviewsResponse = response;
        this.loadingReviews = false;
        console.log('Loaded course reviews:', response);
      },
      error: (error) => {
        console.error('Error loading course reviews:', error);
        this.loadingReviews = false;
        this.toastService.show('Failed to load reviews', 'error');
      }
    });
  }

  getRoundedRating(rating: number): number {
    return Math.round(rating);
  }
}
