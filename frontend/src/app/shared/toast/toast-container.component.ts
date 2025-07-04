import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  progress?: number;
}

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.css']
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription = this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
      // Update progress for each toast
      this.toasts.forEach(toast => {
        if (toast.duration && !toast.progress) {
          toast.progress = 100;
          const startTime = Date.now();
          const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, toast.duration! - elapsed);
            toast.progress = (remaining / toast.duration!) * 100;
            
            if (remaining <= 0) {
              clearInterval(interval);
            }
          }, 50); 
        }
      });
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  removeToast(toast: ToastMessage) {
    this.toastService.remove(toast);
  }

  trackByToast(index: number, toast: ToastMessage): string {
    return `${toast.message}-${toast.type}-${index}`;
  }

  getToastClasses(toast: ToastMessage): string {
    const baseClasses = 'transform transition-all duration-300 ease-in-out';
    
    switch (toast.type) {
      case 'success':
        return `${baseClasses} border-l-4 border-green-400`;
      case 'error':
        return `${baseClasses} border-l-4 border-red-400`;
      case 'warning':
        return `${baseClasses} border-l-4 border-yellow-400`;
      case 'info':
        return `${baseClasses} border-l-4 border-gray-400`;
      default:
        return baseClasses;
    }
  }

  getProgressBarClasses(toast: ToastMessage): string {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  }
} 