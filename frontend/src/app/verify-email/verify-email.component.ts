import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { SharedNavbar } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedNavbar],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent {
  verificationCode = '';
  email = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Get email from query params or localStorage
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || localStorage.getItem('pendingVerificationEmail') || '';
      if (this.email) {
        this.checkUserStatus();
      }
    });
  }

  checkUserStatus() {
    if (!this.email) return;
    
    this.authService.checkUserStatus(this.email).subscribe({
      next: (response) => {
        if (response.isVerified) {
          this.toastService.info('Your email is already verified! You can now log in.');
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        console.error('Status check error:', err);
        // Don't show error for status check, just continue
      }
    });
  }

  onSubmit() {
    if (!this.verificationCode || this.verificationCode.length !== 5) {
      this.toastService.error('Please enter a valid 5-digit verification code');
      return;
    }

    this.isLoading = true;
    this.authService.verifyCode(this.email, this.verificationCode).subscribe({
      next: () => {
        this.toastService.success('Email verified successfully! You can now log in.');
        localStorage.removeItem('pendingVerificationEmail');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Verification error:', err);
        let errorMessage = 'Verification failed. Please try again.';
        
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.status === 400) {
          errorMessage = 'Invalid or expired verification code.';
        }
        
        this.toastService.error(errorMessage);
      }
    });
  }

  resendCode() {
    if (!this.email) {
      this.toastService.error('Email address not found. Please try registering again.');
      return;
    }

    this.isLoading = true;
    this.authService.resendVerificationCode(this.email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toastService.success('Verification code resent to your email! Please check your inbox and spam folder.');
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Resend error:', err);
        let errorMessage = 'Failed to resend verification code. Please try again.';
        
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.status === 404) {
          errorMessage = 'User not found. Please register first.';
        } else if (err.status === 400) {
          errorMessage = 'User is already verified or invalid request.';
        }
        
        this.toastService.error(errorMessage);
      }
    });
  }
} 