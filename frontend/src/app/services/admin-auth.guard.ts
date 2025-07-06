import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const adminAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser;

  if (user && user.role === 'ADMIN') {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};

export const preventAdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser;

  if (user && user.role === 'ADMIN') {
    router.navigate(['/admin-dashboard']);
    return false;
  } else {
    return true;
  }
}; 