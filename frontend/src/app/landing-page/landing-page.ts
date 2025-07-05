import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { SharedNavbar } from '../shared/navbar/navbar.component';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  group,
  animateChild,
} from '@angular/animations';
import { CoursesService } from '../services/courses.service';
import { UsersService } from '../services/users.service';

// Course interface for the landing page
interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  category: {
    id: string;
    name: string;
  };
  price: number;
  difficulty: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    enrollments: number;
    reviews: number;
  };
}

// Instructor interface for the landing page
interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isVerified: boolean;
  about?: string;
  profileImage?: string;
  profileProgress?: number;
  createdAt: string;
  courseCount: number;
  _count?: {
    coursesTaught: number;
    enrollments: number;
  };
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedNavbar, HttpClientModule],
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.css'],
  animations: [
    trigger('bannerSlider', [
      transition(':increment', [
        group([
          query(
            ':enter',
            [
              style({ opacity: 0, transform: 'translateX(100%)' }),
              animate(
                '600ms cubic-bezier(.4,0,.2,1)',
                style({ opacity: 1, transform: 'translateX(0)' })
              ),
            ],
            { optional: true }
          ),
          query(
            ':leave',
            [
              style({ opacity: 1, transform: 'translateX(0)' }),
              animate(
                '600ms cubic-bezier(.4,0,.2,1)',
                style({ opacity: 0, transform: 'translateX(-100%)' })
              ),
            ],
            { optional: true }
          ),
        ]),
      ]),
      transition(':decrement', [
        group([
          query(
            ':enter',
            [
              style({ opacity: 0, transform: 'translateX(-100%)' }),
              animate(
                '600ms cubic-bezier(.4,0,.2,1)',
                style({ opacity: 1, transform: 'translateX(0)' })
              ),
            ],
            { optional: true }
          ),
          query(
            ':leave',
            [
              style({ opacity: 1, transform: 'translateX(0)' }),
              animate(
                '600ms cubic-bezier(.4,0,.2,1)',
                style({ opacity: 0, transform: 'translateX(100%)' })
              ),
            ],
            { optional: true }
          ),
        ]),
      ]),
    ]),
  ],
})
export class LandingPage implements OnInit, OnDestroy, AfterViewInit {
  banners = [
    {
      img: '/images/photo-1513258496099-48168024aec0-removebg-preview.png',
      alt: 'Learning Made Simple',
      title: 'L.M.S',
      subtitle: '(Learning Made Simple)',
      description:
        "Welcome to L.M.S, where learning knows no bounds. We believe that education is the key to personal and professional growth, and we're here to guide you on your journey to success.",
      button: 'Start your journey',
      theme: 'blue',
      icon: 'academic-cap',
      bgGradient: 'from-gray-50 to-blue-50',
      accentColor: 'blue',
    },
    {
      img: '/images/photo-1601392561050-340745ba9c25-removebg-preview.png',
      alt: 'Join Our Community',
      title: 'Join Our Community',
      subtitle: 'Over 1200+ Students',
      description:
        'Become part of a thriving community of learners. Connect, collaborate, and grow together with peers and mentors.',
      button: 'Join now',
      theme: 'indigo',
      icon: 'users',
      bgGradient: 'from-gray-50 to-indigo-50',
      accentColor: 'indigo',
    },
    {
      img: '/images/premium_photo-1683134573138-6c71-removebg-preview.png',
      alt: 'Trusted by Learners',
      title: '100,000+ Courses Sold',
      subtitle: 'Trusted by Learners',
      description:
        'Our platform offers a wide range of courses designed to help you achieve your goals. Find your next learning adventure today.',
      button: 'Browse courses',
      theme: 'blue',
      icon: 'star',
      bgGradient: 'from-gray-50 to-blue-50',
      accentColor: 'blue',
    },
    {
      img: '/images/photo-1544717305-2782549b5136-removebg-preview.png',
      alt: 'Success Stories',
      title: '87.6% Completion Rate',
      subtitle: 'Success Stories',
      description:
        'Our learners achieve more. With a high course completion rate, you can be confident in reaching your learning milestones.',
      button: 'See success stories',
      theme: 'indigo',
      icon: 'trophy',
      bgGradient: 'from-gray-50 to-indigo-50',
      accentColor: 'indigo',
    },
  ];

  // Courses data
  courses: Course[] = [];
  coursesLoading = true;

  // Real instructors data
  instructors: Instructor[] = [];
  instructorsLoading = true;

  // Stats counter properties
  stats = [
    {
      target: 250,
      current: 0,
      label: 'Courses by our best mentors',
      suffix: '+',
    },
    { target: 1000, current: 0, label: 'Students enrolled', suffix: '+' },
    { target: 15, current: 0, label: 'Expert instructors', suffix: '+' },
    { target: 2400, current: 0, label: 'Happy learners', suffix: '+' },
  ];

  currentSlide = 0;
  previousSlide = 0;
  private intervalId: any;
  private statsObserver: IntersectionObserver | null = null;
  private counterIntervals: any[] = [];
  private countersStarted = false;

  constructor(
    private coursesService: CoursesService,
    private usersService: UsersService
  ) {}

  ngOnInit() {
    this.startAutoSlide();
    this.loadInitialData();
  }

  loadInitialData() {
    this.loadTopCourses();
    this.loadTopInstructors();
  }

  ngAfterViewInit() {
    this.setupStatsObserver();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
    this.cleanupStatsObserver();
  }

  setupStatsObserver() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.statsObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !this.countersStarted) {
              this.startCounters();
              this.countersStarted = true;
            }
          });
        },
        { threshold: 0.1 }
      );

      const statsSection = document.getElementById('stats-section');
      if (statsSection) {
        this.statsObserver.observe(statsSection);
      }
    }
  }

  cleanupStatsObserver() {
    if (this.statsObserver) {
      this.statsObserver.disconnect();
    }
    this.counterIntervals.forEach((interval) => clearInterval(interval));
  }

  startCounters() {
    if (this.counterIntervals.length > 0) {
      return;
    }

    this.stats.forEach((stat, index) => {
      const interval = setInterval(() => {
        if (stat.current < stat.target) {
          stat.current += Math.ceil(stat.target / 50);
          if (stat.current > stat.target) {
            stat.current = stat.target;
          }
        } else {
          clearInterval(interval);
          this.counterIntervals = this.counterIntervals.filter(
            (i) => i !== interval
          );
        }
      }, 50);
      this.counterIntervals.push(interval);
    });
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 6000); // 6 seconds
  }

  stopAutoSlide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextSlide() {
    this.previousSlide = this.currentSlide;
    this.currentSlide = (this.currentSlide + 1) % this.banners.length;
  }

  prevSlide() {
    this.previousSlide = this.currentSlide;
    this.currentSlide =
      (this.currentSlide - 1 + this.banners.length) % this.banners.length;
  }

  goToSlide(index: number) {
    this.previousSlide = this.currentSlide;
    this.currentSlide = index;
  }

  loadTopCourses() {
    this.coursesLoading = true;

    this.coursesService.getCourses().subscribe({
      next: (response: any) => {
        if (!response) {
          this.courses = [];
        } else if (Array.isArray(response)) {
          this.courses = response;
        } else if (response.data && Array.isArray(response.data)) {
          this.courses = response.data;
        } else {
          this.courses = [];
        }
        this.coursesLoading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.courses = [];
        this.coursesLoading = false;
      },
    });
  }

  loadTopInstructors() {
    this.instructorsLoading = true;
    this.usersService.getInstructors().subscribe({
      next: (instructors: Instructor[]) => {
        this.instructors = instructors;
        this.instructorsLoading = false;
      },
      error: (error) => {
        console.error('Error loading instructors:', error);
        this.instructors = [];
        this.instructorsLoading = false;
      },
    });
  }

  getInstructorName(instructor: Instructor): string {
    return `${instructor.firstName} ${instructor.lastName}`;
  }

  getInstructorRating(instructor: Instructor): number {
    // Since we don't have actual ratings yet, return a default rating
    return 4.5;
  }

  getInstructorStudentCount(instructor: Instructor): number {
    return instructor._count?.enrollments || 0;
  }

  // Manual trigger for testing counters
  triggerCounters() {
    this.countersStarted = false;
    this.startCounters();
    this.countersStarted = true;
  }
}
