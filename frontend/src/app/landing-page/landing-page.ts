import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedNavbar } from '../shared/navbar.component';
import { trigger, transition, style, animate, query, group, animateChild } from '@angular/animations';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, SharedNavbar],
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.css'],
  animations: [
    trigger('bannerSlider', [
      transition(':increment', [
        group([
          query(':enter', [
            style({ opacity: 0, transform: 'translateX(100%)' }),
            animate('600ms cubic-bezier(.4,0,.2,1)', style({ opacity: 1, transform: 'translateX(0)' }))
          ], { optional: true }),
          query(':leave', [
            style({ opacity: 1, transform: 'translateX(0)' }),
            animate('600ms cubic-bezier(.4,0,.2,1)', style({ opacity: 0, transform: 'translateX(-100%)' }))
          ], { optional: true })
        ])
      ]),
      transition(':decrement', [
        group([
          query(':enter', [
            style({ opacity: 0, transform: 'translateX(-100%)' }),
            animate('600ms cubic-bezier(.4,0,.2,1)', style({ opacity: 1, transform: 'translateX(0)' }))
          ], { optional: true }),
          query(':leave', [
            style({ opacity: 1, transform: 'translateX(0)' }),
            animate('600ms cubic-bezier(.4,0,.2,1)', style({ opacity: 0, transform: 'translateX(100%)' }))
          ], { optional: true })
        ])
      ])
    ])
  ]
})
export class LandingPage implements OnInit, OnDestroy {
  banners = [
    {
      img: '/images/photo-1513258496099-48168024aec0-removebg-preview.png',
      alt: 'Learning Made Simple',
      title: 'L.M.S',
      subtitle: '(Learning Made Simple)',
      description: 'Welcome to L.M.S, where learning knows no bounds. We believe that education is the key to personal and professional growth, and we\'re here to guide you on your journey to success.',
      button: 'Start your journey',
      theme: 'blue',
      icon: 'academic-cap',
      bgGradient: 'from-gray-50 to-blue-50',
      accentColor: 'blue'
    },
    {
      img: '/images/photo-1601392561050-340745ba9c25-removebg-preview.png',
      alt: 'Join Our Community',
      title: 'Join Our Community',
      subtitle: 'Over 1200+ Students',
      description: 'Become part of a thriving community of learners. Connect, collaborate, and grow together with peers and mentors.',
      button: 'Join now',
      theme: 'indigo',
      icon: 'users',
      bgGradient: 'from-gray-50 to-indigo-50',
      accentColor: 'indigo'
    },
    {
      img: '/images/premium_photo-1683134573138-6c71-removebg-preview.png',
      alt: 'Trusted by Learners',
      title: '100,000+ Courses Sold',
      subtitle: 'Trusted by Learners',
      description: 'Our platform offers a wide range of courses designed to help you achieve your goals. Find your next learning adventure today.',
      button: 'Browse courses',
      theme: 'blue',
      icon: 'star',
      bgGradient: 'from-gray-50 to-blue-50',
      accentColor: 'blue'
    },
    {
      img: '/images/photo-1544717305-2782549b5136-removebg-preview.png',
      alt: 'Success Stories',
      title: '87.6% Completion Rate',
      subtitle: 'Success Stories',
      description: 'Our learners achieve more. With a high course completion rate, you can be confident in reaching your learning milestones.',
      button: 'See success stories',
      theme: 'indigo',
      icon: 'trophy',
      bgGradient: 'from-gray-50 to-indigo-50',
      accentColor: 'indigo'
    },
  ];
  currentSlide = 0;
  previousSlide = 0;
  private intervalId: any;

  ngOnInit() {
    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
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
    this.currentSlide = (this.currentSlide - 1 + this.banners.length) % this.banners.length;
  }

  goToSlide(index: number) {
    this.previousSlide = this.currentSlide;
    this.currentSlide = index;
  }
}
