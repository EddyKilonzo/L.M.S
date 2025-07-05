import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CoursesService } from '../services/courses.service';
import { SharedNavbar } from '../shared/navbar/navbar.component';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { ToastService } from '../services/toast.service';
import { EnrollmentsService } from '../services/enrollments.service';
import { ProgressService, CourseProgress } from '../services/progress.service';
import { ReviewsService, Review } from '../services/reviews.service';

import { Course } from '../services/courses.service';

interface CourseModule {
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

@Component({
  selector: 'app-course-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SharedNavbar],
  templateUrl: './course-page.component.html',
  styleUrls: ['./course-page.component.css']
})
export class CoursePageComponent implements OnInit {
  course: (Course & { modules: CourseModule[] }) | null = null;
  loading = true;
  error: string | null = null;
  relatedCourses: Course[] = [];
  reviews: Review[] = [];
  courseReviews: any = null;
  loadingReviews = false;
  
  // Review creation
  showReviewForm = false;
  newReviewRating = 5;
  newReviewComment = '';
  submittingReview = false;
  userHasReviewed = false;
  
  user: any = null;
  userRole: string | null = null;
  authenticated = false;
  activeTab: 'description' | 'instructor' | 'syllabus' | 'reviews' = 'description';
  isEnrolled = false;
  enrollmentLoading = false;
  isInCart = false;
  courseProgress: CourseProgress | null = null;
  isCourseCompleted = false;

  constructor(
    private route: ActivatedRoute,
    private coursesService: CoursesService,
    private authService: AuthService,
    private cartService: CartService,
    private toastService: ToastService,
    private enrollmentsService: EnrollmentsService,
    private progressService: ProgressService,
    private reviewsService: ReviewsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const courseId = params['id'];
      if (courseId) {
        this.loadCourse(courseId);
        this.loadRelatedCourses(courseId);
        this.checkIsInCart(courseId);
        // Reset review form state when course changes
        this.showReviewForm = false;
        this.userHasReviewed = false;
      }
    });

    // Track user and role
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.userRole = user?.role || null;
      this.authenticated = !!user;
      
      // Check enrollment status when user data is available
      if (user && this.course) {
        this.checkEnrollmentStatus();
      }
      
      // Refresh reviews when user changes (in case they logged in/out)
      if (this.course?.id) {
        this.loadCourseReviews();
      }
    });
  }

  private loadCourseReviews() {
    if (!this.course?.id) return;
    
    this.loadingReviews = true;
    this.reviewsService.getCourseReviews(this.course.id).subscribe({
      next: (response) => {
        this.courseReviews = response;
        this.reviews = response.reviews;
        this.loadingReviews = false;
        console.log('Loaded course reviews:', response);
        
        // Check if current user has already reviewed this course
        if (this.user?.id) {
          this.userHasReviewed = this.reviews.some(review => review.student.id === this.user.id);
        }
      },
      error: (error) => {
        console.error('Error loading course reviews:', error);
        this.loadingReviews = false;
        this.toastService.show('Failed to load reviews', 'error');
        this.reviews = [];
        this.courseReviews = null;
      }
    });
  }

  // Method to refresh reviews when needed
  refreshReviews() {
    if (this.course?.id) {
      this.loadCourseReviews();
    }
  }

  // Method to handle component activation (when navigating back)
  onActivate() {
    // Refresh reviews when component becomes active
    this.refreshReviews();
  }

  toggleReviewForm() {
    this.showReviewForm = !this.showReviewForm;
    if (this.showReviewForm) {
      this.newReviewRating = 5;
      this.newReviewComment = '';
    }
  }

  setReviewRating(rating: number) {
    this.newReviewRating = rating;
  }

  submitReview() {
    if (!this.course?.id || !this.user?.id || this.submittingReview) return;
    
    if (!this.newReviewComment.trim()) {
      this.toastService.show('Please provide a review comment', 'error');
      return;
    }

    this.submittingReview = true;
    
    this.reviewsService.createReview({
      courseId: this.course.id,
      rating: this.newReviewRating,
      comment: this.newReviewComment.trim()
    }).subscribe({
      next: (review) => {
        this.toastService.show('Review submitted successfully!', 'success');
        this.submittingReview = false;
        this.showReviewForm = false;
        this.userHasReviewed = true;
        
        // Refresh the reviews to get the updated data
        this.loadCourseReviews();
        
        // Reset form
        this.newReviewRating = 5;
        this.newReviewComment = '';
      },
      error: (error) => {
        console.error('Error submitting review:', error);
        this.submittingReview = false;
        if (error.status === 409) {
          this.toastService.show('You have already reviewed this course', 'error');
        } else {
          this.toastService.show('Failed to submit review', 'error');
        }
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
          const courseWithModules = {
            ...course,
            modules: course.modules.map(module => ({
              ...module,
              open: false
            }))
          };
          this.course = courseWithModules as Course & { modules: CourseModule[] };
          this.loadRelatedCourses(course.id); // Load related courses after loading the main course
          
          // Load course reviews after course is loaded
          this.loadCourseReviews();
          
          // Check enrollment status after course is loaded
          if (this.user) {
            this.checkEnrollmentStatus();
          }
        } else {
          this.error = 'Course not found';
        }
        this.loading = false;
      },
      error: (error: unknown) => {
        console.error('Error loading course:', error);
        this.error = 'Failed to load course details. Please try again later.';
        this.loading = false;
      }
    });
  }

  loadRelatedCourses(courseId: string) {
    this.coursesService.getRelatedCourses(courseId).subscribe({
      next: (courses: Course[]) => {
        if (!this.course || !this.course.category) {
          this.relatedCourses = [];
          return;
        }
        
        const currentCategoryId = this.course.category.id;
        
        // First, try to get courses from the same category
        const sameCategoryCourses = courses
          .filter(c => c.id !== courseId && c.category?.id === currentCategoryId)
          .slice(0, 3);
        
        // If we have courses from the same category, use them
        if (sameCategoryCourses.length > 0) {
          this.relatedCourses = sameCategoryCourses;
        } else {
          // Fallback: show other courses from different categories
          const otherCourses = courses
            .filter(c => c.id !== courseId)
            .slice(0, 3);
          this.relatedCourses = otherCourses;
        }
      },
      error: (error: unknown) => {
        console.error('Error loading related courses:', error);
        this.relatedCourses = []; // Reset on error
      }
    });
  }

  hasSameCategoryCourses(): boolean {
    if (!this.course || !this.course.category) return false;
    const currentCategoryId = this.course.category.id;
    return this.relatedCourses.some(course => course.category?.id === currentCategoryId);
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
    return this.course.modules.reduce((total, module) => total + (module.lessons?.length || 0), 0);
  }

  getTotalModules(): number {
    return this.course?.modules?.length || 0;
  }

  getInstructorCourseCount(): number {
    // This would typically come from the instructor data
    // For now, return a placeholder value
    return 5;
  }

  getRatingCount(rating: number): number {
    if (!this.reviews || this.reviews.length === 0) return 0;
    return this.reviews.filter(review => review.rating === rating).length;
  }

  getRatingPercentage(rating: number): number {
    if (!this.reviews || this.reviews.length === 0) return 0;
    const count = this.getRatingCount(rating);
    return Math.round((count / this.reviews.length) * 100);
  }

  setActiveTab(tab: 'description' | 'instructor' | 'syllabus' | 'reviews') {
    this.activeTab = tab;
  }

  enrollInCourse() {
    if (!this.course) return;
    
    // If user is not logged in, redirect to login
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }
    
    // If user is not a student, show message
    if (this.userRole !== 'STUDENT') {
      this.toastService.show('Only students can enroll in courses', 'error');
      return;
    }
    
    this.enrollmentLoading = true;
    
    // Use the actual enrollment service
    this.enrollmentsService.enroll(this.course.id).subscribe({
      next: () => {
        this.isEnrolled = true;
        this.enrollmentLoading = false;
        this.toastService.show('Successfully enrolled in course!', 'success');
      },
      error: (error: any) => {
        this.enrollmentLoading = false;
        if (error.status === 409) {
          this.toastService.show('You are already enrolled in this course.', 'info');
          this.isEnrolled = true;
        } else {
          this.toastService.show('Failed to enroll in course. Please try again.', 'error');
        }
      }
    });
  }

  accessCourse() {
    if (!this.course) return;
    
    // Navigate to a dedicated course learning page
    this.router.navigate(['/learn', this.course.id]);
  }

  accessLesson(lesson: any) {
    if (!this.isEnrolled) {
      this.toastService.show('Please enroll in this course to access lesson materials.', 'error');
      return;
    }

    console.log('Accessing lesson:', lesson);
    
    // Handle different content types
    switch (lesson.contentType) {
      case 'video':
        if (lesson.contentUrl) {
          // Open video in new tab or modal
          window.open(lesson.contentUrl, '_blank');
          this.toastService.show('Opening video lesson...', 'info');
        } else {
          this.toastService.show('Video content not available yet.', 'info');
        }
        break;
        
      case 'pdf':
        if (lesson.contentUrl) {
          // Open PDF in new tab
          window.open(lesson.contentUrl, '_blank');
          this.toastService.show('Opening PDF document...', 'info');
        } else {
          this.toastService.show('PDF content not available yet.', 'info');
        }
        break;
        
      case 'text':
        // Show text content in a modal or navigate to text lesson page
        this.toastService.show('Opening text lesson...', 'info');
        // You could implement a modal or navigate to a text lesson page here
        break;
        
      default:
        this.toastService.show('Content type not supported yet.', 'info');
    }
  }

  checkEnrollmentStatus() {
    if (!this.user || !this.course) {
      this.isEnrolled = false;
      console.log('Cannot check enrollment: user or course not available');
      return;
    }

    console.log('Checking enrollment status for course:', this.course?.id);
    console.log('Current user:', this.user.id);

    // Check if user is enrolled in this course
    this.enrollmentsService.getMyEnrollments().subscribe({
      next: (enrollments: any) => {
        console.log('All enrollments:', enrollments);
        const isEnrolled = enrollments.some((enrollment: any) => 
          enrollment.course.id === this.course?.id
        );
        this.isEnrolled = isEnrolled;
        console.log('Enrollment status for course', this.course?.id, ':', this.isEnrolled);
        
        // If enrolled, load course progress to check completion status
        if (this.isEnrolled && this.user?.role === 'STUDENT') {
          this.loadCourseProgress();
        }
      },
      error: (error: any) => {
        console.error('Error checking enrollment status:', error);
        this.isEnrolled = false;
      }
    });
  }

  loadCourseProgress() {
    if (!this.course?.id || !this.user || this.user.role !== 'STUDENT') return;

    this.progressService.getStudentProgress(this.course.id).subscribe({
      next: (progress) => {
        this.courseProgress = progress;
        this.isCourseCompleted = progress.enrollment.completed;
        console.log('Course progress loaded:', progress);
        console.log('Course completed:', this.isCourseCompleted);
      },
      error: (error) => {
        console.error('Error loading course progress:', error);
      }
    });
  }

  canShowEnrollButton(): boolean {
    // Show for all users (students, guests, instructors)
    return true;
  }

  canEnableEnrollButton(): boolean {
    // Only enable for logged-in students
    return this.userRole === 'STUDENT';
  }

  checkIsInCart(courseId: string) {
    this.isInCart = this.cartService.isInCart(courseId);
  }

  addToCart() {
    if (!this.course) return;
    
    // If user is not logged in, redirect to login
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }
    
    // If user is not a student, show message
    if (this.userRole !== 'STUDENT') {
      this.toastService.show('Only students can add courses to cart', 'error');
      return;
    }
    
    this.cartService.addToCart(this.course);
    this.isInCart = true;
    this.toastService.show('Course added to cart successfully!', 'success');
  }

  goToCart() {
    // If user is not logged in, redirect to login
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }
    
    // If user is not a student, show message
    if (this.userRole !== 'STUDENT') {
      this.toastService.show('Only students can access cart', 'error');
      return;
    }
    
    this.router.navigate(['/cart']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
