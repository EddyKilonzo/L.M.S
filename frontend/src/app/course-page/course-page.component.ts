import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SharedNavbar } from '../shared/navbar/navbar.component';
import { CoursesService, Course } from '../services/courses.service';
import { AuthService } from '../services/auth.service';
import { ReviewsService, Review, CourseReviewsResponse } from '../services/reviews.service';
import { ToastService } from '../services/toast.service';
import { CartService } from '../services/cart.service';
import { EnrollmentsService } from '../services/enrollments.service';
import { Subscription } from 'rxjs';

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
export class CoursePageComponent implements OnInit, OnDestroy {
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

  // Enrollment checking
  isEnrolled = false;
  loadingEnrollment = false;

  private enrollmentSubscription: Subscription | null = null;
  private routerEventsSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private coursesService: CoursesService,
    private authService: AuthService,
    private reviewsService: ReviewsService,
    private toastService: ToastService,
    private cartService: CartService,
    private enrollmentsService: EnrollmentsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.authService.currentUser;
    console.log('CoursePageComponent ngOnInit - User:', this.user);
    console.log('CoursePageComponent ngOnInit - User role:', this.user?.role);
    console.log('CoursePageComponent ngOnInit - isStudent:', this.isStudent);
    console.log('CoursePageComponent ngOnInit - isAdmin:', this.isAdmin);
    
    this.route.params.subscribe((params) => {
      const courseId = params['id'];
      if (courseId) {
        this.loadCourse(courseId);
        this.loadRelatedCourses(courseId);
        this.loadCourseReviews(courseId);
        this.checkEnrollmentStatus(courseId);
      }
    });

    // Refresh enrollment status when user changes
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      console.log('CoursePageComponent user changed - User:', user);
      console.log('CoursePageComponent user changed - User role:', user?.role);
      if (this.course) {
        this.checkEnrollmentStatus(this.course.id);
      }
    });

    // Refresh enrollment status when route changes (user navigates back)
    this.routerEventsSubscription = this.router.events.subscribe(() => {
      if (this.course) {
        this.refreshEnrollmentStatus();
      }
    });
  }

  ngOnDestroy() {
    this.enrollmentSubscription?.unsubscribe();
    this.routerEventsSubscription?.unsubscribe();
  }

  refreshEnrollmentStatus() {
    if (this.course) {
      this.checkEnrollmentStatus(this.course.id);
    }
  }

  checkEnrollmentStatus(courseId: string) {
    console.log('checkEnrollmentStatus called with courseId:', courseId);
    console.log('checkEnrollmentStatus - user:', this.user);
    console.log('checkEnrollmentStatus - user role:', this.user?.role);
    
    // Only check enrollment for students
    if (!this.user || this.user.role !== 'STUDENT') {
      console.log('checkEnrollmentStatus - not a student, skipping enrollment check');
      this.isEnrolled = false;
      this.loadingEnrollment = false;
      return;
    }

    console.log('checkEnrollmentStatus - checking enrollment for student');
    this.loadingEnrollment = true;
    this.enrollmentSubscription = this.enrollmentsService.getMyEnrollments().subscribe({
      next: (enrollments) => {
        console.log('checkEnrollmentStatus - enrollments received:', enrollments);
        this.isEnrolled = enrollments.some(enrollment => enrollment.courseId === courseId);
        this.loadingEnrollment = false;
        console.log(`Enrollment status for course ${courseId}: ${this.isEnrolled}`);
      },
      error: (error) => {
        console.error('Error checking enrollment status:', error);
        // If there's a permission error, assume not enrolled and continue
        this.isEnrolled = false;
        this.loadingEnrollment = false;
        
        // Don't show error toast for permission issues - this is expected for non-students
        if (error.status !== 403) {
          this.toastService.show('Unable to check enrollment status', 'error');
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

  getStudentInitials(student: any): string {
    if (!student?.firstName || !student?.lastName) return '??';
    return `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();
  }

  getInstructorInitialsFor(instructor: any): string {
    if (!instructor?.firstName || !instructor?.lastName) return '??';
    return `${instructor.firstName[0]}${instructor.lastName[0]}`.toUpperCase();
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

  getEstimatedDuration(): string {
    const totalLessons = this.getTotalLessons();
    // Estimate 30 minutes per lesson on average
    const totalMinutes = totalLessons * 30;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    } else {
      return `${minutes}m`;
    }
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

  // Cart functionality
  addToCart() {
    if (!this.course) return;
    
    this.cartService.addToCart(this.course);
    this.toastService.success('Course added to cart successfully!');
  }

  buyNow() {
    if (!this.course) return;
    
    // Add to cart first, then navigate to checkout
    this.cartService.addToCart(this.course);
    this.router.navigate(['/checkout'], { 
      queryParams: { 
        courseId: this.course.id,
        singleCourse: 'true'
      }
    });
  }

  isInCart(): boolean {
    if (!this.course || !this.course.id) {
      console.log('isInCart: Course not loaded yet');
      return false;
    }
    const inCart = this.cartService.isInCart(this.course.id);
    console.log(`isInCart: Course ${this.course.id} in cart: ${inCart}`);
    return inCart;
  }

  get isStudent(): boolean {
    return this.authService.currentUser?.role === 'STUDENT';
  }

  isCompleted(): boolean {
    // Check if the user is enrolled and the course is completed
    if (!this.isEnrolled || !this.course) return false;
    
    // For now, we'll use a simple check - you can enhance this later
    // to check actual completion status from the enrollment data
    return false; // TODO: Implement actual completion checking
  }

  startLearning() {
    if (!this.course) return;
    this.router.navigate(['/course-learning', this.course.id]);
  }

  goToAdminDashboard() {
    this.router.navigate(['/admin-dashboard']);
  }

  goToInstructorDashboard() {
    this.router.navigate(['/profile']);
  }
}
