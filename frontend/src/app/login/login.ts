import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { SharedNavbar } from '../shared/navbar/navbar.component';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, SharedNavbar, FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  model = { email: '', password: '' };
  isLoading = false;

  constructor(
    private authService: AuthService, 
    private toastService: ToastService,
    private router: Router
  ) {}

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.isLoading = true;
      this.authService.login(this.model).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.toastService.success('Login successful! Welcome back.');
          
          // Redirect based on user role
          if (response.user.role === 'ADMIN') {
            this.router.navigate(['/admin-dashboard']);
          } else if (response.user.role === 'STUDENT') {
            this.router.navigate(['/courses']);
          } else {
            // For instructors, redirect to profile or course creation
            this.router.navigate(['/profile']);
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Login error', err);
          let errorMessage = 'Login failed. Please check your credentials.';
          
          if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.status === 401) {
            errorMessage = 'Invalid email or password.';
          } else if (err.status === 0) {
            errorMessage = 'Unable to connect to server. Please check your internet connection.';
          }
          
          this.toastService.error(errorMessage);
        },
      });
    } else {
      this.toastService.error('Please fill in all required fields');
    }
  }
}
