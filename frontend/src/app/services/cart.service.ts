import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Course } from './courses.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private storageKey = 'lms_cart';
  private cartSubject = new BehaviorSubject<Course[]>([]);
  public cart$ = this.cartSubject.asObservable();
  public cartCount$ = this.cart$.pipe(map(cart => cart.length));

  constructor() {
    this.loadCartFromStorage();
  }

  private loadCartFromStorage(): void {
    const cart = this.getCart();
    this.cartSubject.next(cart);
  }

  getCart(): Course[] {
    const cart = localStorage.getItem(this.storageKey);
    return cart ? JSON.parse(cart) : [];
  }

  getCartCount(): number {
    return this.getCart().length;
  }

  addToCart(course: Course): void {
    const cart = this.getCart();
    if (!cart.find(c => c.id === course.id)) {
      cart.push(course);
      localStorage.setItem(this.storageKey, JSON.stringify(cart));
      this.cartSubject.next(cart);
    }
  }

  removeFromCart(courseId: string): boolean {
    try {
      const cart = this.getCart().filter(c => c.id !== courseId);
      localStorage.setItem(this.storageKey, JSON.stringify(cart));
      this.cartSubject.next(cart);
      return true;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      return false;
    }
  }

  clearCart(): void {
    localStorage.removeItem(this.storageKey);
    this.cartSubject.next([]);
  }

  isInCart(courseId: string): boolean {
    return this.getCart().some(c => c.id === courseId);
  }

  getCartTotal(): number {
    return this.getCart().reduce((sum, course) => sum + (course.price || 0), 0);
  }
} 