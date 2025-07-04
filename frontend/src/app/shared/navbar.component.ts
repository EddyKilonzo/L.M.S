import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shared-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="w-full bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between z-20 relative">
      <!-- Left: Logo and Categories -->
      <div class="flex items-center gap-6">
        <img src="/images/logo.png" alt="LMS Logo" class="h-14 w-auto mr-2" />
        <span class="font-bold text-lg flex items-center gap-1">
          L.M.S
        </span>
        <button class="text-gray-600 hover:text-blue-700 px-3 py-1 rounded flex items-center gap-1 border border-gray-300 bg-white">
          Categories
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>
      <!-- Center: Search -->
      <div class="flex-1 flex justify-center px-8">
        <input type="text" placeholder="Search courses" class="w-full max-w-lg border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500" />
      </div>
      <!-- Right: Actions -->
      <div class="flex items-center gap-4">
        <a href="#" class="text-gray-600 hover:text-blue-700 text-sm font-medium">Teach on L.M.S</a>
        <ng-container *ngIf="!authenticated">
          <button class="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-100">Log In</button>
          <button class="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800">Sign Up</button>
        </ng-container>
        <ng-container *ngIf="authenticated">
          <button class="border border-gray-300 rounded px-2 py-1 flex items-center hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h18v18H3V3z" /></svg>
          </button>
          <button class="border border-gray-300 rounded px-2 py-1 flex items-center hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </button>
          <button class="border border-gray-300 rounded px-2 py-1 flex items-center hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
          <span *ngIf="authenticated" class="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold">J</span>
        </ng-container>
      </div>
    </nav>
  `,
  styles: []
})
export class SharedNavbar {
  @Input() authenticated = false;
} 