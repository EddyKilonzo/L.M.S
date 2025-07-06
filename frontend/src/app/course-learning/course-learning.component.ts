import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CoursesService } from '../services/courses.service';
import { SharedNavbar } from '../shared/navbar/navbar.component';
import { AuthService, User } from '../services/auth.service';
import { EnrollmentsService } from '../services/enrollments.service';
import { ToastService } from '../services/toast.service';
import { ProgressService } from '../services/progress.service';
import { ReviewsService, Review } from '../services/reviews.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  selector: 'app-course-learning',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SharedNavbar],
  templateUrl: './course-learning.component.html',
  styleUrls: ['./course-learning.component.css']
})
export class CourseLearningComponent implements OnInit {
  course: any = null;
  loading = true;
  error: string | null = null;
  user: User | null = null;
  isEnrolled = false;
  currentLesson: any = null;
  activeTab: 'content' | 'progress' | 'notes' = 'content';
  safePdfUrl: SafeResourceUrl | null = null;

  moreCourses: any[] = [];
  reviews: Review[] = [];
  loadingReviews = false;
  
  // Review creation
  showReviewForm = false;
  newReviewRating = 5;
  newReviewComment = '';
  submittingReview = false;
  userHasReviewed = false;

  // Track open module index for accordion behavior
  openModuleIndex: number | null = 0;
  
  // Progress tracking
  isMarkingComplete = false;
  courseProgress: any = null;
  isCourseCompleted = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private coursesService: CoursesService,
    private authService: AuthService,
    private enrollmentsService: EnrollmentsService,
    private progressService: ProgressService,
    private reviewsService: ReviewsService,
    private toastService: ToastService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const courseId = params['id'];
      if (courseId) {
        this.loadCourse(courseId);
        // Reset review form state when course changes
        this.showReviewForm = false;
        this.userHasReviewed = false;
      }
    });

    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      // Check enrollment status after user is loaded
      if (user && this.route.snapshot.params['id']) {
        this.checkEnrollmentStatus(this.route.snapshot.params['id']);
      }
      
      // Refresh reviews when user changes (in case they logged in/out)
      if (this.course?.id) {
        this.loadCourseReviews();
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscriptions if needed
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

  loadCourse(courseId: string) {
    this.loading = true;
    this.error = null;

    this.coursesService.getCourse(courseId).subscribe({
      next: (course: any) => {
        if (course) {
          // Add 'open' property to modules
          this.course = {
            ...course,
            modules: course.modules.map((module: any, idx: number) => ({
              ...module,
              open: idx === 0 // Only first module open by default
            }))
          };
          // Select first lesson by default
          const firstModule = this.course.modules[0];
          if (firstModule && firstModule.lessons && firstModule.lessons.length > 0) {
            this.currentLesson = firstModule.lessons[0];
          }
          // Mock: More courses by instructor (filter out current course)
          this.moreCourses = (course.instructor?.courses || []).filter((c: any) => c.id !== course.id);
          
          // Load course progress for students
          this.loadCourseProgress();
          
          // Load course reviews
          this.loadCourseReviews();
          
          // Reset review form state
          this.showReviewForm = false;
          this.userHasReviewed = false;
        } else {
          this.error = 'Course not found';
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading course:', error);
        this.error = 'Failed to load course details. Please try again later.';
        this.loading = false;
      }
    });
  }

  checkEnrollmentStatus(courseId: string) {
    if (!this.user) {
      console.log('No user available, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    console.log('Checking enrollment status for user:', this.user.id, 'course:', courseId);
    
    this.enrollmentsService.getMyEnrollments().subscribe({
      next: (enrollments: any) => {
        console.log('All enrollments:', enrollments);
        const isEnrolled = enrollments.some((enrollment: any) => 
          enrollment.course.id === courseId
        );
        this.isEnrolled = isEnrolled;
        console.log('Enrollment status for course', courseId, ':', this.isEnrolled);
        
        if (!isEnrolled) {
          this.toastService.show('You must be enrolled to access this course.', 'error');
          this.router.navigate(['/course', courseId]);
        }
      },
      error: (error: any) => {
        console.error('Error checking enrollment status:', error);
        this.toastService.show('Error verifying enrollment status.', 'error');
        this.router.navigate(['/course', courseId]);
      }
    });
  }

  selectLesson(lesson: any) {
    this.currentLesson = lesson;
    if (lesson.contentType === 'pdf' && lesson.contentUrl) {
      this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(lesson.contentUrl);
    } else {
      this.safePdfUrl = null;
    }
  }

  // Accordion toggle for modules
  toggleModule(idx: number) {
    if (this.openModuleIndex === idx) {
      this.openModuleIndex = null;
    } else {
      this.openModuleIndex = idx;
    }
  }

  setActiveTab(tab: 'content' | 'progress' | 'notes') {
    this.activeTab = tab;
  }

  getTotalLessons(): number {
    if (!this.course?.modules) return 0;
    return this.course.modules.reduce((total: number, module: any) => total + (module.lessons?.length || 0), 0);
  }

  getTotalModules(): number {
    return this.course?.modules?.length || 0;
  }

  goBackToCourse() {
    this.router.navigate(['/course', this.course?.id]);
  }

  // Progress tracking methods
  onVideoEnded() {
    // Auto-mark video as complete when it ends
    if (this.user?.role === 'STUDENT' && this.currentLesson?.contentType === 'video') {
      this.markLessonComplete();
    }
  }

  markLessonComplete() {
    if (!this.currentLesson || this.isMarkingComplete) return;

    this.isMarkingComplete = true;
    
    this.progressService.markLessonComplete(this.currentLesson.id).subscribe({
      next: (response) => {
        this.toastService.show('Lesson marked as complete!', 'success');
        this.isMarkingComplete = false;
        // Refresh course progress
        this.loadCourseProgress();
      },
      error: (error) => {
        console.error('Error marking lesson complete:', error);
        this.toastService.show('Failed to mark lesson as complete', 'error');
        this.isMarkingComplete = false;
      }
    });
  }

  loadCourseProgress() {
    if (!this.course?.id || this.user?.role !== 'STUDENT') return;

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

  loadCourseReviews() {
    if (!this.course?.id) return;
    
    this.loadingReviews = true;
    this.reviewsService.getCourseReviews(this.course.id).subscribe({
      next: (response) => {
        this.reviews = response.reviews;
        this.loadingReviews = false;
        console.log('Loaded course reviews:', response);
        
        // Check if current user has already reviewed this course
        if (this.user?.id) {
          this.userHasReviewed = this.reviews.some(review => review.student.id === this.user?.id);
        }
      },
      error: (error) => {
        console.error('Error loading course reviews:', error);
        this.loadingReviews = false;
        this.toastService.show('Failed to load reviews', 'error');
      }
    });
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
} 