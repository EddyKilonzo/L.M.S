import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../services/cart.service';
import { CoursesService, Course } from '../services/courses.service';
import { AuthService, User } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { SharedNavbar } from '../shared/navbar/navbar.component';
import { EnrollmentsService } from '../services/enrollments.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SharedNavbar],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  providers: [EnrollmentsService]
})
export class CheckoutComponent implements OnInit {
  course: Course | null = null;
  loading = true;
  error: string | null = null;
  isSingleCourse = false;
  user: User | null = null;

  // Payment method selection
  selectedPayment: 'card' | 'paypal' | 'mpesa' = 'card';

  // Form fields
  country: string = '';
  state: string = '';
  cardName: string = '';
  cardNumber: string = '';
  cardCVV: string = '';
  cardExpiry: string = '';
  billingCountry: string = '';
  mpesaPhoneNumber: string = '';
  mpesaAmount: string = '';

  // Coupon
  couponCode: string = '';
  couponDiscount: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private coursesService: CoursesService,
    private authService: AuthService,
    private toastService: ToastService,
    private enrollmentsService: EnrollmentsService // <-- Inject EnrollmentsService
  ) {}

  ngOnInit() {
    // Check if user is admin and redirect if so
    this.user = this.authService.currentUser;
    if (this.user?.role === 'ADMIN') {
      this.toastService.show('Admin users cannot access checkout functionality', 'error');
      this.router.navigate(['/admin-dashboard']);
      return;
    }

    this.route.queryParams.subscribe(params => {
      const courseId = params['courseId'];
      const singleCourse = params['singleCourse'];
      const multipleCourses = params['multipleCourses'];

      this.isSingleCourse = singleCourse === 'true';

      if (courseId && this.isSingleCourse) {
        this.loadCourse(courseId);
      } else if (multipleCourses === 'true') {
        // Handle multiple courses checkout
        this.loading = false;
        this.toastService.show('Multiple courses checkout coming soon!', 'info');
      } else {
        this.error = 'Invalid checkout parameters';
        this.loading = false;
      }
    });
  }

  loadCourse(courseId: string) {
    this.coursesService.getCourse(courseId).subscribe({
      next: (course: Course) => {
        this.course = course;
        this.loading = false;
      },
      error: (error: unknown) => {
        console.error('Error loading course:', error);
        this.error = 'Failed to load course details';
        this.loading = false;
      }
    });
  }

  getTotal(): number {
    return this.course?.price || 0;
  }

  getDiscount(): number {
    return this.couponDiscount;
  }

  getFinalTotal(): number {
    return this.getTotal() - this.getDiscount();
  }

  get isAdmin(): boolean {
    return this.user?.role === 'ADMIN';
  }

  applyCoupon() {
    // Simple coupon logic - you can expand this
    if (this.couponCode.toLowerCase() === 'welcome10') {
      this.couponDiscount = Math.round(this.getTotal() * 0.1); // 10% discount
      this.toastService.show('Coupon applied successfully!', 'success');
    } else {
      this.couponDiscount = 0;
      this.toastService.show('Invalid coupon code', 'error');
    }
  }

  proceedToPayment() {
    if (!this.user) {
      this.toastService.show('Please login to proceed with payment', 'error');
      this.router.navigate(['/login']);
      return;
    }

    // Check if user is admin
    if (this.user.role === 'ADMIN') {
      this.toastService.show('Admin users cannot proceed with payment', 'error');
      this.router.navigate(['/admin-dashboard']);
      return;
    }

    if (!this.course) {
      this.toastService.show('Course not found', 'error');
      return;
    }

    // Validate required fields based on payment method
    if (this.selectedPayment === 'card') {
      if (!this.cardName || !this.cardNumber || !this.cardCVV || !this.cardExpiry) {
        this.toastService.show('Please fill in all card details', 'error');
        return;
      }
    } else if (this.selectedPayment === 'mpesa') {
      if (!this.mpesaPhoneNumber) {
        this.toastService.show('Please enter M-pesa phone number', 'error');
        return;
      }
    }

    // Here you would integrate with your payment gateway
    // For now, we'll simulate a successful payment
    this.toastService.show('Payment processing...', 'info');
    setTimeout(() => {
      // Remove from cart after successful payment
      this.cartService.removeFromCart(this.course!.id);
      
      console.log('Attempting to enroll in course:', this.course!.id);
      console.log('Current user:', this.user);
      
      // Enroll the student in the course
      this.enrollmentsService.enroll(this.course!.id).subscribe({
        next: (response) => {
          console.log('Enrollment successful:', response);
          this.toastService.show('Payment successful! You are now enrolled.', 'success');
          this.router.navigate(['/course-learning', this.course!.id]);
        },
        error: (err: any) => {
          console.error('Enrollment error:', err);
          console.error('Error status:', err.status);
          console.error('Error message:', err.message);
          
          if (err.status === 409) {
            this.toastService.show('You are already enrolled in this course.', 'info');
            this.router.navigate(['/course', this.course!.id]);
          } else if (err.status === 404) {
            this.toastService.show('Course not found. Please try again.', 'error');
          } else if (err.status === 401) {
            this.toastService.show('Please login again to complete enrollment.', 'error');
            this.router.navigate(['/login']);
          } else {
            this.toastService.show(`Payment succeeded, but enrollment failed: ${err.message || 'Unknown error'}. Please contact support.`, 'error');
          }
          // Do not redirect; stay on the current page
        }
      });
    }, 2000);
  }

  goBack() {
    this.router.navigate(['/cart']);
  }

  goToDashboard() {
    this.router.navigate(['/admin-dashboard']);
  }
} 