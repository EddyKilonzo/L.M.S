import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedNavbar } from '../shared/navbar/navbar.component';
import { CoursesService, Course } from '../services/courses.service';
import { CategoriesService } from '../services/categories.service';
import { ToastService } from '../services/toast.service';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';



interface Category {
  id: string;
  name: string;
  courseCount?: number;
}

interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  courses?: Course[];
}

@Component({
  selector: 'app-course-category',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedNavbar, RouterModule],
  templateUrl: './course-category.component.html',
  styleUrls: ['./course-category.component.css'],
})
export class CourseCategoryComponent implements OnInit {
  // Make Math available in template
  Math = Math;
  
  openFilters: { [key: string]: boolean } = {
    category: true,
    difficulty: true,
    price: true,
  };

  // Real data from backend
  courses: Course[] = [];
  categories: Category[] = [];
  instructors: Instructor[] = [];
  featuredCourses: Course[] = [];
  
  // Loading states
  isLoading = false;
  isLoadingCategories = false;
  isLoadingInstructors = false;

  // Search and filter
  searchTerm = '';
  selectedCategory = '';
  selectedDifficulty = '';
  selectedPriceRange = '';
  selectedRating = '';

  // Pagination
  currentPage = 1;
  pageSize = 12;
  totalPages = 0;
  totalCourses = 0;

  // Mentor pagination
  mentorCurrentPage = 1;
  mentorPageSize = 5;
  paginatedMentors: Instructor[] = [];
  totalMentorPages = 0;

  constructor(
    private coursesService: CoursesService,
    private categoriesService: CategoriesService,
    private toastService: ToastService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadCourses();
  }

  loadCourses() {
    this.isLoading = true;
    this.coursesService.getCourses().subscribe({
      next: (response: any) => {
        this.courses = response.data || [];
        this.totalCourses = response.total || this.courses.length;
        this.totalPages = response.totalPages || Math.ceil(this.courses.length / this.pageSize);
        this.featuredCourses = this.courses.slice(0, 4); // First 4 courses as featured
        this.isLoading = false;
        console.log('Courses loaded:', this.courses);
        // Load instructors after courses are loaded
        this.loadInstructors();
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.toastService.show('Failed to load courses', 'error');
        this.isLoading = false;
      }
    });
  }

  loadCategories() {
    this.isLoadingCategories = true;
    this.categoriesService.getCategories().subscribe({
      next: (response: any) => {
        this.categories = response.data || [];
        this.isLoadingCategories = false;
        console.log('Categories loaded:', this.categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.toastService.show('Failed to load categories', 'error');
        this.isLoadingCategories = false;
      }
    });
  }

  loadInstructors() {
    this.isLoadingInstructors = true;
    // Extract unique instructors from courses
    const instructorMap = new Map<string, Instructor>();
    
    this.courses.forEach(course => {
      const instructorId = course.instructor.id;
      if (!instructorMap.has(instructorId)) {
        instructorMap.set(instructorId, {
          ...course.instructor,
          role: 'INSTRUCTOR', // Add the missing role property
          courses: []
        });
      }
      instructorMap.get(instructorId)?.courses?.push(course);
    });

    this.instructors = Array.from(instructorMap.values());
    this.totalMentorPages = Math.ceil(this.instructors.length / this.mentorPageSize);
    this.updatePaginatedMentors();
    this.isLoadingInstructors = false;
  }

  toggleFilter(filter: string) {
    this.openFilters[filter] = !this.openFilters[filter];
  }

  updatePaginatedMentors() {
    const startIndex = (this.mentorCurrentPage - 1) * this.mentorPageSize;
    const endIndex = startIndex + this.mentorPageSize;
    this.paginatedMentors = this.instructors.slice(startIndex, endIndex);
  }

  goToMentorPage(page: number) {
    if (page >= 1 && page <= this.totalMentorPages) {
      this.mentorCurrentPage = page;
      this.updatePaginatedMentors();
    }
  }

  nextMentorPage() {
    if (this.mentorCurrentPage < this.totalMentorPages) {
      this.mentorCurrentPage++;
      this.updatePaginatedMentors();
    }
  }

  prevMentorPage() {
    if (this.mentorCurrentPage > 1) {
      this.mentorCurrentPage--;
      this.updatePaginatedMentors();
    }
  }

  // Filter methods
  get filteredCourses(): Course[] {
    let filtered = this.courses;

    // Search filter
    if (this.searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        `${course.instructor.firstName} ${course.instructor.lastName}`.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(course => course.category.id === this.selectedCategory);
    }

    // Difficulty filter
    if (this.selectedDifficulty) {
      filtered = filtered.filter(course => course.difficulty === this.selectedDifficulty);
    }

    // Price range filter
    if (this.selectedPriceRange) {
      const [min, max] = this.selectedPriceRange.split('-').map(Number);
      filtered = filtered.filter(course => {
        if (max) {
          return course.price >= min && course.price <= max;
        } else {
          return course.price >= min;
        }
      });
    }

    // Rating filter
    if (this.selectedRating) {
      const minRating = Number(this.selectedRating);
      // Note: This would need to be implemented when you have actual ratings
      // For now, we'll skip rating filtering
    }

    return filtered;
  }

  // Helper methods for template
  getInstructorName(instructor: any): string {
    return `${instructor.firstName} ${instructor.lastName}`;
  }

  getInstructorStudentCount(instructor: any): number {
    const total = instructor.courses?.reduce((total: number, course: Course) => 
      total + (course._count?.enrollments || 0), 0) || 0;
    return total;
  }

  formatStudentCount(count: number): string {
    return count.toString();
  }

  getInstructorRating(instructor: any): number {
    // Calculate average rating from instructor's courses
    if (!instructor.courses || instructor.courses.length === 0) return 0;
    const ratings = instructor.courses
      .map((course: any) => course.averageRating)
      .filter((r: number) => typeof r === 'number');
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((a: number, b: number) => a + b, 0);
    return sum / ratings.length;
  }

  getCourseRating(course: Course): number {
    // Use real average rating from backend - handle missing property
    return (course as any).averageRating || 0;
  }

  getCourseHours(course: Course): number {
    // Calculate total hours from modules and lessons
    // For now, estimate 30 minutes per lesson
    const totalLessons = course.modules?.reduce((total, module) => 
      total + (module.lessons?.length || 0), 0) || 0;
    return Math.round(totalLessons * 0.5); // 30 minutes per lesson
  }

  getCourseLectures(course: Course): number {
    // Count total lessons across all modules
    return course.modules?.reduce((total, module) => 
      total + (module.lessons?.length || 0), 0) || 0;
  }

  // Cart functionality
  addToCart(event: Event, course: Course) {
    event.preventDefault();
    event.stopPropagation();
    
    this.cartService.addToCart(course);
    this.toastService.show('Course added to cart successfully!', 'success');
  }

  isInCart(courseId: string): boolean {
    return this.cartService.isInCart(courseId);
  }

  get isStudent(): boolean {
    return this.authService.currentUser?.role === 'STUDENT';
  }

  get isAdmin(): boolean {
    return this.authService.currentUser?.role === 'ADMIN';
  }
}
