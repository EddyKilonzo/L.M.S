import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedNavbar } from '../app/shared/navbar/navbar.component';
import { AuthService } from '../app/services/auth.service';
import { ToastService } from '../app/services/toast.service';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, SharedNavbar, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class Signup {
  model = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT' // Default role - matches backend enum
  };
  isLoading = false;

  constructor(
    private authService: AuthService, 
    private toastService: ToastService,
    private router: Router
  ) {}

  onSubmit(form: NgForm) {
    if (form.valid && this.model.password === this.model.confirmPassword) {
      this.isLoading = true;
      const { firstName, lastName, email, password, role } = this.model;
      
      // Prepare registration data
      const registrationData = {
        firstName,
        lastName,
        email,
        password,
        role: role as 'STUDENT' | 'INSTRUCTOR'
      };

      this.authService
        .register(registrationData)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            // Store email for verification
            localStorage.setItem('pendingVerificationEmail', this.model.email);
            this.toastService.success('Account created successfully! Please check your email for verification code.');
            this.router.navigate(['/verify-email'], { queryParams: { email: this.model.email } });
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Signup error', err);
            let errorMessage = 'An error occurred during signup. Please try again.';
            
            if (err.error?.message) {
              errorMessage = err.error.message;
            } else if (err.status === 409) {
              errorMessage = 'An account with this email already exists. If you haven\'t verified your email, you can resend the verification code on the verification page.';
            } else if (err.status === 400) {
              errorMessage = 'Please check your input and try again.';
            } else if (err.status === 0) {
              errorMessage = 'Unable to connect to server. Please check your internet connection.';
            }
            
            this.toastService.error(errorMessage);
          },
        });
    } else if (this.model.password !== this.model.confirmPassword) {
      this.toastService.error('Passwords do not match');
    } else {
      this.toastService.error('Please fill in all required fields');
    }
  }
}
