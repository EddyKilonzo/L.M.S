import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-shared-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class SharedNavbar implements OnInit, OnDestroy {
  authenticated = false;
  user: any = null;
  showProfileDropdown = false;
  wishlistCount = 0; // You can connect this to your wishlist service later
  cartCount = 0;
  private subscription: Subscription = new Subscription();
  private cartSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.subscription = this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.authenticated = !!user;
      
      // For testing - set wishlist count when user is authenticated
      if (this.authenticated) {
        this.wishlistCount = 3; // Test data
      } else {
        this.wishlistCount = 0;
      }
    });

    // Subscribe to cart changes
    this.cartSubscription = this.cartService.cart$.subscribe(cart => {
      this.cartCount = cart.length;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.cartSubscription.unsubscribe();
  }

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  closeProfileDropdown() {
    this.showProfileDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Close dropdown if clicking outside
    if (this.showProfileDropdown) {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-dropdown')) {
        this.closeProfileDropdown();
      }
    }
  }

  logout() {
    try {
      console.log('Logout clicked - starting logout process');
      
      // Clear auth data
      this.authService.logout();
      console.log('Auth service logout completed');
      
      // Close dropdown
      this.closeProfileDropdown();
      console.log('Dropdown closed');
      
      // Show success message
      this.toastService.show('Successfully logged out', 'success');
      console.log('Toast shown');
      
      // Navigate to home
      this.router.navigate(['/']).then(() => {
        console.log('Navigation to home completed');
      }).catch(err => {
        console.error('Navigation error:', err);
      });
      
      console.log('Logout process completed');
    } catch (error) {
      console.error('Error during logout:', error);
      this.toastService.show('Error during logout', 'error');
    }
  }

  getInitials(): string {
    if (!this.user) return 'U';
    const firstName = this.user.firstName || '';
    const lastName = this.user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }
}
