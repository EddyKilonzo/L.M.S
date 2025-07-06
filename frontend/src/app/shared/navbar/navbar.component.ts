import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
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
  user: User | null = null;
  showProfileDropdown = false;
  cartCount = 0;
  wishlistCount = 0;
  private authSubscription: Subscription | null = null;
  private cartSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('Navbar ngOnInit - starting auth subscription');
    this.authSubscription = this.authService.currentUser$.subscribe(
      (user) => {
        console.log('Navbar auth subscription received user:', user);
        console.log('User details:', {
          id: user?.id,
          email: user?.email,
          firstName: user?.firstName,
          lastName: user?.lastName,
          role: user?.role,
          isVerified: user?.isVerified
        });
        this.user = user;
        this.authenticated = !!user;
        console.log('Navbar state updated:', {
          authenticated: this.authenticated,
          user: this.user
        });
      }
    );

    this.cartSubscription = this.cartService.cartCount$.subscribe(
      (count: number) => {
        this.cartCount = count;
      }
    );
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  logout() {
    console.log('Logout clicked');
    this.authService.logout();
    this.showProfileDropdown = false;
    
    // Navigate to landing page after logout
    this.router.navigate(['/']);
  }

  goToCart() {
    // Navigate to cart page
    window.location.href = '/cart';
  }

  getInitials(): string {
    if (!this.user) return '';
    return `${this.user.firstName.charAt(0)}${this.user.lastName.charAt(0)}`.toUpperCase();
  }

  toggleProfileDropdown() {
    console.log('Toggle dropdown clicked, current state:', this.showProfileDropdown);
    console.log('Current user state:', this.user);
    console.log('Authenticated state:', this.authenticated);
    this.showProfileDropdown = !this.showProfileDropdown;
    console.log('New dropdown state:', this.showProfileDropdown);
    
    // Force change detection
    setTimeout(() => {
      console.log('Dropdown state after timeout:', this.showProfileDropdown);
    }, 0);
  }

  closeProfileDropdown() {
    this.showProfileDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Close dropdown if clicking outside
    if (this.showProfileDropdown) {
      const target = event.target as HTMLElement;
      const profileSection = target.closest('.profile-section');
      
      if (!profileSection) {
        console.log('Clicking outside dropdown, closing...');
        this.closeProfileDropdown();
      }
    }
  }
}
