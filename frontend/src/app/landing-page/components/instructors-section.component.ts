import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  InstructorsService,
  Instructor,
} from '../../services/instructors.service';

@Component({
  selector: 'app-instructors-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="bg-gray-50 py-16">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Meet Our Expert Instructors
          </h2>
          <p class="text-lg text-gray-600">
            Learn from industry experts who share their knowledge and experience
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (instructor of instructors; track instructor.id) {
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="aspect-w-1 aspect-h-1">
              <img
                [src]="
                  instructor.profileImage || '/assets/images/default-avatar.png'
                "
                [alt]="instructor.firstName + ' ' + instructor.lastName"
                class="w-full h-48 object-cover"
              />
            </div>
            <div class="p-6">
              <h3 class="text-xl font-semibold text-gray-900">
                {{ instructor.firstName }} {{ instructor.lastName }}
              </h3>
              <p class="text-gray-600 mt-2 line-clamp-2">
                {{ instructor.about || 'No description available' }}
              </p>
              <div class="mt-4 flex items-center justify-between">
                <span class="text-sm text-gray-500">
                  {{ instructor.courseCount }}
                  {{ instructor.courseCount === 1 ? 'Course' : 'Courses' }}
                </span>
                <button
                  [routerLink]="['/instructors', instructor.id]"
                  class="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .aspect-w-1 {
        position: relative;
        padding-bottom: 100%;
      }

      .aspect-h-1 {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }

      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `,
  ],
})
export class InstructorsSectionComponent implements OnInit {
  instructors: Instructor[] = [];

  constructor(private instructorsService: InstructorsService) {}

  ngOnInit() {
    this.instructorsService.getInstructors().subscribe((instructors) => {
      this.instructors = instructors;
    });
  }
}
