import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedNavbar } from '../shared/navbar/navbar.component';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, SharedNavbar, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  email = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.isLoading = true;
      
      this.authService.forgotPassword(this.email).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.toastService.success('Password reset link sent to your email!');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Forgot password error', err);
          let errorMessage = 'An error occurred. Please try again.';
          
          if (err.error?.message) {
            errorMessage = err.error.message;
          }
          
          this.toastService.error(errorMessage);
        },
      });
    } else {
      this.toastService.error('Please enter a valid email address');
    }
  }
} 