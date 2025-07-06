import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AnalyticsService, DashboardStats, RevenueData, ReviewsSummary } from '../services/analytics.service';
import { CoursesService, Course } from '../services/courses.service';
import { forkJoin, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../services/auth.service';
import { RouterModule } from '@angular/router';
import { SharedNavbar } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, NgxChartsModule, FormsModule, RouterModule, SharedNavbar],
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  loading = false;
  error: string | null = null;
  activeTab: string = 'dashboard'; // Default active tab

  dashboardStats: DashboardStats | null = null;
  salesChartData: any[] = [];
  salesChartView: [number, number] = [0, 260];
  salesChartColorScheme: any = {
    domain: ['#2563eb', '#22c55e', '#f59e42'],
  };

  reviewsSummary: ReviewsSummary = {
    totalReviews: 0,
    averageRating: 0,
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  courses: Course[] = [];
  categories: { id: string; name: string }[] = [];
  courseFilter: string = '';
  selectedCategory: string = '';
  adminUser: User | null = null;
  selectedCourse: Course | null = null;
  isCourseDetailsLoading: boolean = false;
  private resizeTimeout: any;
  private userSub: Subscription | undefined;

  constructor(
    private analyticsService: AnalyticsService,
    private coursesService: CoursesService,
    private authService: AuthService,
  ) {}

  // Tab switching method
  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
  }

  filteredCourses(): Course[] {
    let filtered = this.courses || [];
    if (this.selectedCategory) {
      filtered = filtered.filter(course => course.category?.id === this.selectedCategory);
    }
    if (this.courseFilter.trim()) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(this.courseFilter.toLowerCase())
      );
    }
    return filtered;
  }

  ngOnInit(): void {
    console.log('AdminDashboard ngOnInit - starting initialization');
    this.userSub = this.authService.currentUser$.subscribe(user => {
      console.log('AdminDashboard received user from auth service:', user);
      this.adminUser = user;
      console.log('AdminDashboard adminUser set to:', this.adminUser);
    });
    
    // Check current auth state immediately
    const currentUser = this.authService.getCurrentUser();
    console.log('AdminDashboard current user from getCurrentUser():', currentUser);
    
    // Fetch categories
    this.coursesService.getCategories().subscribe({
      next: (cats: { id: string; name: string }[]) => {
        this.categories = cats;
      },
      error: (err: any) => {
        console.error('Failed to load categories', err);
      }
    });
    this.loading = true;
    // Delay chart view update to ensure DOM is ready
    setTimeout(() => {
      this.updateChartView();
    }, 100);
    console.log('Starting to load dashboard data...');
    
    // Check if user is authenticated
    const token = localStorage.getItem('access_token');
    console.log('Auth token present:', !!token);
    
    if (!token) {
      console.error('No authentication token found');
      this.error = 'Authentication required. Please log in.';
      this.loading = false;
      return;
    }
    
    // Initialize with fallback data
    this.dashboardStats = {
      totalStudents: 0,
      totalInstructors: 0,
      totalCourses: 0,
      totalEnrollments: 0,
      totalRevenue: 0
    };
    
    this.reviewsSummary = {
      totalReviews: 0,
      averageRating: 0,
      ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
    
    this.salesChartData = [{
      name: 'Revenue',
      series: [
        { name: 'Jan', value: 0 },
        { name: 'Feb', value: 0 },
        { name: 'Mar', value: 0 },
        { name: 'Apr', value: 0 },
        { name: 'May', value: 0 },
        { name: 'Jun', value: 0 },
        { name: 'Jul', value: 0 },
        { name: 'Aug', value: 0 },
        { name: 'Sep', value: 0 },
        { name: 'Oct', value: 0 },
        { name: 'Nov', value: 0 },
        { name: 'Dec', value: 0 }
      ]
    }];
    
    let completedRequests = 0;
    const totalRequests = 4;
    
    const checkCompletion = () => {
      completedRequests++;
      if (completedRequests === totalRequests) {
        this.loading = false;
      }
    };
    
    // Add a timeout to prevent infinite loading
    setTimeout(() => {
      if (this.loading) {
        console.warn('Dashboard loading timeout - forcing completion');
        this.loading = false;
        this.error = 'Some data failed to load. Please refresh the page.';
      }
    }, 15000); // 15 second timeout
    
    // Test backend connectivity first
    console.log('Testing backend connectivity...');
    this.analyticsService.getDashboardStats().subscribe({
      next: (stats) => {
        console.log('✅ Backend connectivity test successful:', stats);
      },
      error: (err) => {
        console.error('❌ Backend connectivity test failed:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error details:', err.error);
      }
    });
    
    // Test each API call individually to identify the issue
    this.analyticsService.getDashboardStats().subscribe({
      next: (stats) => {
        console.log('Dashboard stats loaded:', stats);
        this.dashboardStats = stats;
        checkCompletion();
      },
      error: (err) => {
        console.error('Dashboard stats error:', err);
        checkCompletion();
      }
    });

    this.coursesService.getCourses().subscribe({
      next: (result) => {
        console.log('Courses loaded:', result);
        this.courses = result.data; // Use the array inside the data property
        checkCompletion();
      },
      error: (err) => {
        console.error('Courses error:', err);
        checkCompletion();
      }
    });

    this.analyticsService.getRevenueOverTime().subscribe({
      next: (revenueData) => {
        console.log('Revenue data loaded:', revenueData);
        if (revenueData && revenueData.length > 0) {
          this.initializeSalesChartData(revenueData);
        } else {
          console.warn('No revenue data received, using fallback data');
          this.initializeSalesChartData([]);
        }
        checkCompletion();
      },
      error: (err) => {
        console.error('Revenue data error:', err);
        console.error('Error details:', err.error || err.message);
        this.initializeSalesChartData([]);
        checkCompletion();
      }
    });

    this.analyticsService.getReviewsSummary().subscribe({
      next: (reviewsSummary) => {
        console.log('Reviews summary loaded:', reviewsSummary);
        if (reviewsSummary && typeof reviewsSummary.totalReviews === 'number') {
          this.reviewsSummary = reviewsSummary;
        } else {
          console.warn('Invalid reviews summary format:', reviewsSummary);
          this.reviewsSummary = {
            totalReviews: 0,
            averageRating: 0,
            ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          };
        }
        checkCompletion();
      },
      error: (err) => {
        console.error('Reviews summary error:', err);
        console.error('Error details:', err.error || err.message);
        this.reviewsSummary = {
          totalReviews: 0,
          averageRating: 0,
          ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
        checkCompletion();
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    // Debounce resize events
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.updateChartView();
    }, 250);
  }

  updateChartView() {
    // Calculate responsive chart dimensions
    const containerWidth = window.innerWidth;
    const sidebarWidth = containerWidth < 768 ? 200 : 260;
    const padding = containerWidth < 768 ? 32 : 64; // 2rem or 4rem
    const chartWidth = containerWidth - sidebarWidth - padding;
    
    if (containerWidth < 768) {
      // Mobile
      this.salesChartView = [chartWidth, 250];
    } else if (containerWidth < 1024) {
      // Tablet
      this.salesChartView = [chartWidth, 300];
    } else {
      // Desktop
      this.salesChartView = [chartWidth, 300];
    }
    
    console.log(`Chart view updated: ${this.salesChartView[0]}x${this.salesChartView[1]} (container: ${containerWidth}px)`);
  }

  initializeSalesChartData(revenueData: RevenueData[]) {
    // Transform the revenue data into the format expected by ngx-charts
    if (revenueData && revenueData.length > 0) {
      this.salesChartData = [
        {
          name: 'Revenue',
          series: revenueData.map(item => ({
            name: item.month,
            value: item.revenue
          }))
        }
      ];
    } else {
      // Fallback data if no revenue data is available
      this.salesChartData = [{
        name: 'Revenue',
        series: [
          { name: 'Jan', value: 0 },
          { name: 'Feb', value: 0 },
          { name: 'Mar', value: 0 },
          { name: 'Apr', value: 0 },
          { name: 'May', value: 0 },
          { name: 'Jun', value: 0 },
          { name: 'Jul', value: 0 },
          { name: 'Aug', value: 0 },
          { name: 'Sep', value: 0 },
          { name: 'Oct', value: 0 },
          { name: 'Nov', value: 0 },
          { name: 'Dec', value: 0 }
        ]
      }];
    }
    console.log('Chart data initialized:', this.salesChartData);
  }

  formatCurrency(amount: number): string {
    return `KSH${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  getReviewCount(star: number): number {
    return this.reviewsSummary.ratingCounts[star as keyof typeof this.reviewsSummary.ratingCounts] || 0;
  }

  selectCourse(course: Course) {
    console.log('Course card clicked:', course);
    
    // Ensure the course object has safe defaults
    const safeCourse = {
      ...course,
      modules: course.modules || [],
      _count: course._count || { enrollments: 0, reviews: 0 },
      price: course.price || 0,
      title: course.title || 'Untitled Course',
      description: course.description || '',
      instructor: course.instructor || { firstName: 'Unknown', lastName: 'Instructor', email: '', id: '' },
      category: course.category || { name: 'Uncategorized', id: '' }
    };
    
    this.selectedCourse = safeCourse; // Show panel immediately with safe data
    this.isCourseDetailsLoading = true;
    console.log('Course details panel should be visible now');
    
    this.coursesService.getCourse(course.id).subscribe({
      next: (details) => {
        // Ensure the detailed course object also has safe defaults
        this.selectedCourse = {
          ...details,
          modules: details.modules || [],
          _count: details._count || { enrollments: 0, reviews: 0 },
          price: details.price || 0,
          title: details.title || 'Untitled Course',
          description: details.description || '',
          instructor: details.instructor || { firstName: 'Unknown', lastName: 'Instructor', email: '', id: '' },
          category: details.category || { name: 'Uncategorized', id: '' }
        };
        console.log('Selected course details:', this.selectedCourse);
        this.isCourseDetailsLoading = false;
      },
      error: (err) => {
        this.isCourseDetailsLoading = false;
        console.error('Error loading course details:', err);
        // Keep the safe course object even if detailed loading fails
        console.log('Keeping safe course object due to loading error');
      }
    });
  }

  closeCourseDetails() {
    this.selectedCourse = null;
  }

  ngOnDestroy(): void {
    if (this.userSub) this.userSub.unsubscribe();
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  }
}
