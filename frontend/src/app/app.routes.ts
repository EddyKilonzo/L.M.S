import { Routes } from '@angular/router';
import { LandingPage } from './landing-page/landing-page';
import { Signup } from '../signup/signup';
import { Login } from './login/login';
import { CourseCategoryComponent } from './course-category/course-category.component';
import { CoursePageComponent } from './course-page/course-page.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { ProfileComponent } from './profile/profile.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'signup', component: Signup },
  { path: 'login', component: Login },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'courses', component: CourseCategoryComponent },
  { path: 'course/:id', component: CoursePageComponent },
  { path: 'profile', component: ProfileComponent },
];
