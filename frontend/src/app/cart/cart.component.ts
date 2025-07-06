import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { Course } from '../services/courses.service';
import { ToastService } from '../services/toast.service';
import { SharedNavbar } from '../shared/navbar/navbar.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedNavbar],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cart: Course[] = [];
  discount = 10; // Example discount

  constructor(
    private cartService: CartService, 
    private router: Router,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart() {
    this.cart = this.cartService.getCart();
  }

  removeFromCart(courseId: string) {
    const success = this.cartService.removeFromCart(courseId);
    if (success) {
      this.loadCart();
      this.toastService.show('Course removed from cart', 'success');
    } else {
      this.toastService.show('Failed to remove course from cart', 'error');
    }
  }

  getTotal(): number {
    return this.cart.reduce((sum, c) => sum + (c.price || 0), 0);
  }

  getDiscount(): number {
    return this.discount;
  }

  getFinalTotal(): number {
    return this.getTotal() - this.getDiscount();
  }

  get isAdmin(): boolean {
    return this.authService.currentUser?.role === 'ADMIN';
  }

  proceedToCheckout(course: Course) {
    // For single course checkout, we'll navigate to a checkout page
    // You can implement this based on your checkout flow
    this.router.navigate(['/checkout'], { 
      queryParams: { 
        courseId: course.id,
        singleCourse: 'true'
      }
    });
  }

  checkoutAllCourses() {
    // For multiple courses checkout
    this.router.navigate(['/checkout'], { 
      queryParams: { 
        multipleCourses: 'true'
      }
    });
  }

  goToCourses() {
    this.router.navigate(['/courses']);
  }

  clearCart() {
    this.cartService.clearCart();
    this.loadCart();
    this.toastService.show('Cart cleared', 'success');
  }
} 