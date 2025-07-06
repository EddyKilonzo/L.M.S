import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { SharedNavbar } from '../shared/navbar/navbar.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastService } from '../services/toast.service';
import { CloudinaryService } from '../services/cloudinary.service';
import { CoursesService } from '../services/courses.service';
import { EnrollmentsService } from '../services/enrollments.service';
import { ProgressService } from '../services/progress.service';
import { ReviewsService, Review } from '../services/reviews.service';

// Real course data type from backend
interface CourseCard {
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
  progress?: number;
  averageProgress?: number;
  enrollment?: {
    id: string;
    progress: number;
    completed: boolean;
    completedAt?: Date;
  };
  modules?: Array<{
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      title: string;
    }>;
  }>;
  _count?: {
    enrollments: number;
    reviews: number;
  };
}

// Replace the old TeacherCard interface with the real instructor structure
interface TeacherCard {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  about?: string;
  coursesTaught: number;
}

// Mock message data type
interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
}

// Mock conversation data type
interface Conversation {
  id: number;
  user: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;
  messages: Message[];
}

// Using Review interface from ReviewsService

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SharedNavbar, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  user: User | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  isLoading = false;
  hasUnreadMessages = true; // Add this property for message notifications
  
  // File upload properties
  selectedFile: File | null = null;
  isDragOver = false;
  fileError: string | null = null;

  // Sidebar tab state
  activeTab: string = 'my-courses';
  setActiveTab(tab: string) {
    this.activeTab = tab;
    // Load students when students tab is activated
    if (tab === 'students' && this.user?.role === 'INSTRUCTOR') {
      this.loadStudents();
    }
    // Load analytics when analytics tab is activated
    if (tab === 'analytics' && this.user?.role === 'INSTRUCTOR') {
      this.loadAnalytics();
    }
    // Load reviews when reviews tab is activated
    if (tab === 'reviews' && this.user?.role === 'STUDENT') {
      this.loadMyReviews();
    }
    // Load teachers when teachers tab is activated (teachers are already loaded with courses)
    if (tab === 'teachers' && this.user?.role === 'STUDENT') {
      // Teachers are already loaded in loadEnrolledCourses(), no need to reload
    }
  }

  // Real courses data
  courses: CourseCard[] = [];
  
  // Student management
  students: any[] = [];
  filteredStudents: any[] = [];
  loadingStudents = false;
  selectedCourseFilter = '';
  
  // Analytics data
  analyticsData: any = null;
  loadingAnalytics = false;

  // Search, sort, and pagination
  courseSearch = '';
  courseSort = 'Newest';
  currentPage = 1;
  pageSize = 9;

  get filteredCourses(): CourseCard[] {
    let filtered = this.courses.filter(c =>
      c.title.toLowerCase().includes(this.courseSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(this.courseSearch.toLowerCase()) ||
      `${c.instructor.firstName} ${c.instructor.lastName}`.toLowerCase().includes(this.courseSearch.toLowerCase())
    );
    
    // Sort logic
    if (this.courseSort === 'Newest') {
      filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (this.courseSort === 'Oldest') {
      filtered = filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (this.courseSort === 'Price: Low to High') {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (this.courseSort === 'Price: High to Low') {
      filtered = filtered.sort((a, b) => b.price - a.price);
    }
    
    // Pagination
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    const filtered = this.courses.filter(c =>
      c.title.toLowerCase().includes(this.courseSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(this.courseSearch.toLowerCase()) ||
      `${c.instructor.firstName} ${c.instructor.lastName}`.toLowerCase().includes(this.courseSearch.toLowerCase())
    );
    return Math.ceil(filtered.length / this.pageSize);
  }

  setPage(page: number) {
    this.currentPage = page;
  }

  // Teachers mock data
  teachers: TeacherCard[] = [];

  teacherSearch = '';
  teacherSort = 'Relevance';
  teacherRatingFilter = '';
  teacherPage = 1;
  teacherPageSize = 6;

  get filteredTeachers(): TeacherCard[] {
    let filtered = this.teachers.filter(t =>
      `${t.firstName} ${t.lastName}`.toLowerCase().includes(this.teacherSearch.toLowerCase()) ||
      t.email.toLowerCase().includes(this.teacherSearch.toLowerCase())
    );
    
    // Apply rating filter if selected
    if (this.teacherRatingFilter) {
      const minRating = parseInt(this.teacherRatingFilter);
      // For now, we'll show all teachers since we don't have rating data
      // This can be enhanced later when we add instructor ratings
    }
    
    // Add sorting if needed (currently only 'Relevance' is supported)
    return filtered;
  }

  get teacherTotalPages(): number {
    let filtered = this.teachers.filter(t =>
      t.firstName.toLowerCase().includes(this.teacherSearch.toLowerCase()) ||
      t.lastName.toLowerCase().includes(this.teacherSearch.toLowerCase()) ||
      t.email.toLowerCase().includes(this.teacherSearch.toLowerCase())
    );
    
    return Math.ceil(filtered.length / this.teacherPageSize);
  }

  setTeacherPage(page: number) {
    this.teacherPage = page;
  }

  // Messages state
  selectedConversation: Conversation | null = null;

  conversations: Conversation[] = [
    {
      id: 1,
      user: 'Ronald Richards',
      avatar: '/assets/images/student1-removebg-preview.png',
      lastMessage: 'Hello! Thank you for reaching out to me. Feel free to ask any questions regarding the course, I will try to reply ASAP',
      lastTime: '10:20 am',
      messages: [
        {
          id: 1,
          sender: 'Me',
          text: 'Just wanted to tell you that I started your course and its going great!',
          time: '10:15 am',
          isMe: true,
        },
        {
          id: 2,
          sender: 'Ronald Richards',
          text: 'Hello! Thank you for reaching out to me. Feel free to ask any questions regarding the course, I will try to reply ASAP',
          time: '10:20 am',
          isMe: false,
        },
      ],
    },
    // Add more mock conversations if needed
  ];

  selectConversation(conv: Conversation) {
    this.selectedConversation = conv;
  }

  backToMessages() {
    this.selectedConversation = null;
  }

  // My Reviews state
  reviews: Review[] = [];
  loadingReviews = false;

  editingReviewId: string | null = null;
  editedReviewText: string = '';
  editedReviewRating: number = 5;

  // Pagination
  reviewPage = 1;
  reviewPageSize = 3;

  // My Reviews filters
  reviewSearch = '';
  reviewSort = 'Newest';

  get filteredReviews(): Review[] {
    let filtered = this.reviews.filter(r =>
      r.course.title.toLowerCase().includes(this.reviewSearch.toLowerCase()) ||
      (r.comment && r.comment.toLowerCase().includes(this.reviewSearch.toLowerCase()))
    );
    if (this.reviewSort === 'Newest') {
      filtered = filtered.slice().reverse();
    } else if (this.reviewSort === 'Highest') {
      filtered = filtered.slice().sort((a, b) => b.rating - a.rating);
    } else if (this.reviewSort === 'Lowest') {
      filtered = filtered.slice().sort((a, b) => a.rating - b.rating);
    }
    return filtered;
  }

  get paginatedReviews(): Review[] {
    const start = (this.reviewPage - 1) * this.reviewPageSize;
    return this.filteredReviews.slice(start, start + this.reviewPageSize);
  }

  get reviewTotalPages(): number {
    return Math.ceil(this.filteredReviews.length / this.reviewPageSize);
  }

  setReviewPage(page: number) {
    this.reviewPage = page;
  }

  startEditReview(review: Review) {
    this.editingReviewId = review.id;
    this.editedReviewText = review.comment || '';
    this.editedReviewRating = review.rating;
  }

  setEditedReviewRating(rating: number) {
    this.editedReviewRating = rating;
  }

  cancelEditReview() {
    this.editingReviewId = null;
    this.editedReviewText = '';
    this.editedReviewRating = 5; // Reset rating to default
  }

  saveEditReview(review: Review) {
    if (this.editedReviewText.trim()) {
      // Update review using the service
      this.reviewsService.updateReview(review.id, {
        rating: this.editedReviewRating,
        comment: this.editedReviewText
      }).subscribe({
        next: (updatedReview) => {
          // Update the review in the local array
          const index = this.reviews.findIndex(r => r.id === review.id);
          if (index !== -1) {
            this.reviews[index] = updatedReview;
          }
          this.toastService.show('Review updated successfully!', 'success');
        },
        error: (error) => {
          console.error('Error updating review:', error);
          this.toastService.show('Failed to update review', 'error');
        }
      });
    }
    this.cancelEditReview();
  }

  deleteReview(review: Review) {
    if (confirm('Are you sure you want to delete this review?')) {
      this.reviewsService.deleteReview(review.id).subscribe({
        next: () => {
          this.reviews = this.reviews.filter(r => r.id !== review.id);
          // Adjust page if needed
          if (this.reviewPage > this.reviewTotalPages) {
            this.reviewPage = this.reviewTotalPages || 1;
          }
          this.toastService.show('Review deleted successfully!', 'success');
        },
        error: (error: any) => {
          console.error('Error deleting review:', error);
          this.toastService.show('Failed to delete review', 'error');
        }
      });
    }
  }

  // For review menu open/close
  openReviewMenuId: string | null = null;
  confirmDeleteReviewId: string | null = null;

  toggleReviewMenu(reviewId: string) {
    this.openReviewMenuId = this.openReviewMenuId === reviewId ? null : reviewId;
    this.confirmDeleteReviewId = null;
  }

  closeReviewMenu() {
    this.openReviewMenuId = null;
    this.confirmDeleteReviewId = null;
  }

  askDeleteReview(review: Review) {
    this.confirmDeleteReviewId = review.id;
  }

  cancelDeleteReview() {
    this.confirmDeleteReviewId = null;
  }

  confirmDeleteReview(review: Review) {
    this.reviewsService.deleteReview(review.id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== review.id);
        this.closeReviewMenu();
        // Adjust page if needed
        if (this.reviewPage > this.reviewTotalPages) {
          this.reviewPage = this.reviewTotalPages || 1;
        }
        this.toastService.show('Review deleted successfully!', 'success');
      },
      error: (error: any) => {
        console.error('Error deleting review:', error);
        this.toastService.show('Failed to delete review', 'error');
      }
    });
  }

  public goToCourse(courseId: string) {
    console.log('goToCourse called with courseId:', courseId);
    console.log('Current user:', this.user);
    
    // For enrolled students, navigate to the learning interface
    // For instructors, navigate to the course page
    if (this.user?.role === 'STUDENT') {
      console.log('Navigating to learning interface for student');
      this.router.navigate(['/learn', courseId]);
    } else {
      console.log('Navigating to course page for instructor or other role');
      this.router.navigate(['/course', courseId]);
    }
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private http: HttpClient,
    private toastService: ToastService,
    private cloudinaryService: CloudinaryService,
    private coursesService: CoursesService,
    private enrollmentsService: EnrollmentsService,
    private progressService: ProgressService,
    private reviewsService: ReviewsService,
    private router: Router // Changed from RouterModule to Router
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      about: [''],
    });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.profileForm.patchValue({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          about: user.about || '',
        });
        
        // Show the saved profile image if it exists and no new image is selected
        if (user?.profileImage && !this.selectedFile) {
          this.imagePreview = user.profileImage;
        }
        
        // Load courses if user is an instructor
        if (user.role === 'INSTRUCTOR') {
          this.loadMyCourses();
        } else if (user.role === 'STUDENT') {
          this.loadEnrolledCourses();
        }
      }
    });
  }

  loadMyCourses() {
    this.coursesService.getMyCourses().subscribe({
      next: (response: any) => {
        this.courses = response.data || [];
        console.log('Loaded courses:', this.courses);
        // Debug: Check the first course structure
        if (this.courses.length > 0) {
          console.log('First course structure:', JSON.stringify(this.courses[0], null, 2));
        }
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.toastService.show('Failed to load courses', 'error');
      }
    });
  }

  loadEnrolledCourses() {
    this.enrollmentsService.getMyEnrollments().subscribe({
      next: (enrollments: any[]) => {
        this.courses = enrollments.map((enrollment: any) => ({
          ...enrollment.course,
          enrollment: enrollment
        }));
        // Extract unique instructors from enrolled courses
        const instructorsMap = new Map();
        for (const course of this.courses) {
          const inst = course.instructor;
          if (inst && !instructorsMap.has(inst.id)) {
            instructorsMap.set(inst.id, {
              id: inst.id,
              firstName: inst.firstName,
              lastName: inst.lastName,
              email: inst.email,
              profileImage: (inst as any).profileImage || '',
              about: (inst as any).about || '',
              coursesTaught: 1
            });
          } else if (inst) {
            instructorsMap.get(inst.id).coursesTaught += 1;
          }
        }
        this.teachers = Array.from(instructorsMap.values());
        console.log('Loaded enrolled courses:', this.courses);
        if (this.courses.length > 0) {
          console.log('First enrolled course structure:', JSON.stringify(this.courses[0], null, 2));
        }
      },
      error: (error: any) => {
        console.error('Error loading enrolled courses:', error);
        this.toastService.show('Failed to load enrolled courses', 'error');
      }
    });
  }

  manageCourse(course: CourseCard) {
    console.log('Managing course:', course);
    console.log('Course imageUrl:', course.imageUrl);
    console.log('Course full data:', JSON.stringify(course, null, 2));
    
    // Navigate to course creation component with course ID for editing
    this.router.navigate(['/course-creation', course.id]);
  }

  // Progress tracking methods
  getCourseProgress(course: CourseCard): number {
    if (this.user?.role === 'INSTRUCTOR') {
      // For instructors, show average student progress
      return this.getAverageStudentProgress(course);
    } else {
      // For students, show their own progress
      return this.getStudentProgress(course);
    }
  }

  getAverageStudentProgress(course: CourseCard): number {
    // For instructors, fetch enrollment stats from backend
    this.progressService.getEnrollmentStats(course.id).subscribe({
      next: (stats) => {
        // Update the course with real progress data
        const courseIndex = this.courses.findIndex((c: any) => c.id === course.id);
        if (courseIndex !== -1) {
          this.courses[courseIndex].averageProgress = stats.averageProgress;
        }
      },
      error: (error) => {
        console.error('Error fetching enrollment stats:', error);
      }
    });
    
    // Return stored progress or fallback to mock data
    const courseData = this.courses.find((c: any) => c.id === course.id);
    if (courseData && courseData.averageProgress !== undefined) {
      return Math.round(courseData.averageProgress);
    }
    return Math.floor(Math.random() * 70) + 20;
  }

  getStudentProgress(course: CourseCard): number {
    // If the course is completed, always return 100
    if (course.enrollment?.completed) {
      return 100;
    }
    // Otherwise, return the actual progress
    if (course.enrollment && course.enrollment.progress !== undefined) {
      return Math.round(course.enrollment.progress);
    }
    // Fallback to mock data if no real data available
    return Math.floor(Math.random() * 101);
  }

  getCompletedLessons(course: CourseCard): number {
    const totalLessons = this.getTotalLessons(course);
    const progress = this.getStudentProgress(course);
    return Math.floor((progress / 100) * totalLessons);
  }

  getTotalLessons(course: CourseCard): number {
    // Try to get real data from course modules
    if (course.modules && course.modules.length > 0) {
      return course.modules.reduce((total: number, module: any) => 
        total + (module.lessons?.length || 0), 0);
    }
    // Fallback to mock data
    return Math.floor(Math.random() * 16) + 5;
  }

  isCourseCompleted(course: CourseCard): boolean {
    return course.enrollment?.completed || false;
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toastService.show('Please select a valid image file.', 'error');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastService.show('Image size should be less than 5MB.', 'error');
        return;
      }

      // Store the selected file
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.toastService.show('Image selected successfully!', 'success');
      };
      reader.onerror = () => {
        this.toastService.show('Error reading image file.', 'error');
      };
      reader.readAsDataURL(file);
      
      console.log('Image selected:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
    }
  }

  get profileProgress(): number {
    let filled = 0;
    const total = 3; // firstName, lastName, about
    if (this.profileForm.get('firstName')?.value) filled++;
    if (this.profileForm.get('lastName')?.value) filled++;
    if (this.profileForm.get('about')?.value) filled++;
    return Math.round((filled / total) * 100);
  }

  async onSave() {
    if (this.profileForm.valid && this.user) {
      this.isLoading = true;
      const { firstName, lastName, about } = this.profileForm.getRawValue();
      const profileProgress = this.profileProgress;

      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No access token found in localStorage');
        this.toastService.show(
          'You must be logged in to update your profile',
          'error'
        );
        this.isLoading = false;
        return;
      }

      try {
        let profileImageUrl = this.user.profileImage; // Keep existing image if no new one selected

        // Upload new profile image if selected
        if (this.selectedFile) {
          this.toastService.show('Uploading profile image...', 'info');
          
          const uploadResult = await this.cloudinaryService.uploadImage(
            this.selectedFile,
            'profile-images'
          ).toPromise();
          
          if (uploadResult && uploadResult.url) {
            profileImageUrl = uploadResult.url;
            this.toastService.show('Profile image uploaded successfully!', 'success');
          } else {
            throw new Error('Failed to upload profile image');
          }
        }

        console.log('Attempting profile update:', {
          userId: this.user.id,
          formData: { firstName, lastName, about, profileProgress, profileImage: profileImageUrl },
          tokenExists: !!token,
          formValid: this.profileForm.valid,
        });

        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        });

        const updateData = {
          firstName,
          lastName,
          about,
          profileProgress,
          ...(profileImageUrl && { profileImage: profileImageUrl })
        };

        this.http
          .patch(
            `/api/users/${this.user.id}`,
            updateData,
            { headers }
          )
          .subscribe({
            next: (response) => {
              console.debug('Profile update response:', response);
              this.toastService.show('Profile updated successfully!', 'success');
              if (this.user) {
                this.authService.updateCurrentUser({
                  ...this.user,
                  firstName,
                  lastName,
                  about,
                  profileProgress,
                  profileImage: profileImageUrl,
                });
              }
              this.isLoading = false;
              this.selectedFile = null; // Clear the selected file after successful upload
            },
            error: (error) => {
              console.error('Profile update error:', {
                status: error.status,
                message: error.message,
                error: error.error,
                userId: this.user?.id,
              });

              if (error.status === 401) {
                this.toastService.show(
                  'Your session has expired. Please log in again.',
                  'error'
                );
                this.authService.logout();
                this.isLoading = false;
                return;
              }

              if (error.status === 403) {
                this.toastService.show(
                  'You do not have permission to update this profile.',
                  'error'
                );
                this.isLoading = false;
                return;
              }

              if (error.status === 404) {
                this.toastService.show('User profile not found.', 'error');
                this.isLoading = false;
                return;
              }

              this.toastService.show(
                error.error?.message ||
                  'Failed to update profile. Please try again.',
                'error'
              );
              this.isLoading = false;
            },
          });
      } catch (error) {
        console.error('Error during profile update:', error);
        this.toastService.show(
          'Failed to upload profile image. Please try again.',
          'error'
        );
        this.isLoading = false;
      }
    } else {
      this.toastService.show('Please fill in all required fields.', 'warning');
    }
  }

  async onSaveImage() {
    if (!this.selectedFile || !this.user) {
      this.toastService.show('Please select an image first.', 'warning');
      return;
    }
    this.isLoading = true;
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.toastService.show('You must be logged in to update your profile', 'error');
      this.isLoading = false;
      return;
    }
    try {
      this.toastService.show('Uploading profile image...', 'info');
      const uploadResult = await this.cloudinaryService.uploadImage(
        this.selectedFile,
        'profile-images'
      ).toPromise();
      if (uploadResult && uploadResult.url) {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        });
        this.http.patch(
          `/api/users/${this.user.id}`,
          { profileImage: uploadResult.url },
          { headers }
        ).subscribe({
          next: (response) => {
            this.toastService.show('Profile image updated successfully!', 'success');
            if (this.user) {
              this.authService.updateCurrentUser({
                ...this.user,
                profileImage: uploadResult.url,
              });
            }
            this.imagePreview = uploadResult.url;
            this.selectedFile = null;
            this.isLoading = false;
          },
          error: (error) => {
            this.toastService.show('Failed to update profile image.', 'error');
            this.isLoading = false;
          },
        });
      } else {
        throw new Error('Failed to upload profile image');
      }
    } catch (error) {
      this.toastService.show('Failed to upload profile image. Please try again.', 'error');
      this.isLoading = false;
    }
  }

  get username(): string {
    return this.user?.firstName ? this.user.firstName.toLowerCase() : 'user';
  }

  getInitial(): string {
    if (this.user?.firstName) {
      return this.user.firstName.charAt(0);
    }
    if (this.user?.email) {
      return this.user.email.charAt(0);
    }
    return '?';
  }

  getMemberSinceDate(): string {
    if (!this.user?.createdAt) {
      return 'N/A';
    }
    const date = new Date(this.user.createdAt);
    // Format as 'Apr 7, 2025'
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // File upload methods
  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.handleFile(file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  private handleFile(file: File) {
    this.fileError = null;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.fileError = 'Please select a valid image file (PNG, JPG, GIF)';
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      this.fileError = 'File size must be less than 10MB';
      return;
    }

    // Validate specific image formats
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      this.fileError = 'Please select a PNG, JPG, or GIF file';
      return;
    }

    this.selectedFile = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
    
    this.toastService.show('Image selected successfully!', 'success');
  }

  removeFile() {
    this.selectedFile = null;
    this.fileError = null;
    // Restore preview to saved image if it exists
    if (this.user?.profileImage) {
      this.imagePreview = this.user.profileImage;
    } else {
      this.imagePreview = null;
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Student management methods
  loadStudents() {
    if (this.user?.role !== 'INSTRUCTOR') return;
    
    this.loadingStudents = true;
    console.log('Loading students for instructor:', this.user.id);
    console.log('Instructor courses:', this.courses);
    
    // Get enrollments for each of instructor's courses
    const courseIds = this.courses.map(course => course.id);
    
    if (courseIds.length === 0) {
      console.log('No courses found for instructor');
      this.loadingStudents = false;
      this.students = [];
      this.filteredStudents = [];
      return;
    }
    
    console.log('Course IDs to fetch enrollments for:', courseIds);
    
    const enrollmentPromises = courseIds.map(courseId => 
      this.enrollmentsService.getCourseEnrollments(courseId).toPromise()
    );
    
    Promise.all(enrollmentPromises)
      .then((results) => {
        console.log('Enrollment results:', results);
        
        // Flatten all enrollments and add course info
        const allEnrollments: any[] = [];
        results.forEach((enrollments: any, index: number) => {
          console.log(`Enrollments for course ${courseIds[index]}:`, enrollments);
          if (enrollments && Array.isArray(enrollments)) {
            enrollments.forEach((enrollment: any) => {
              allEnrollments.push({
                ...enrollment,
                course: this.courses[index]
              });
            });
          }
        });
        
        console.log('Final students array:', allEnrollments);
        this.students = allEnrollments;
        this.filteredStudents = allEnrollments;
        this.loadingStudents = false;
        
        // If analytics tab is active, recalculate analytics with new student data
        if (this.activeTab === 'analytics') {
          this.calculateAnalytics();
        }
      })
      .catch((error) => {
        console.error('Error loading students:', error);
        this.loadingStudents = false;
        this.toastService.show('Failed to load students', 'error');
      });
  }

  filterStudentsByCourse() {
    if (!this.selectedCourseFilter) {
      this.filteredStudents = this.students;
    } else {
      this.filteredStudents = this.students.filter(student => 
        student.course.id === this.selectedCourseFilter
      );
    }
  }

  refreshStudentData() {
    this.loadStudents();
  }

  getStudentInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  getDaysSinceEnrollment(enrolledAt: string): number {
    const enrollmentDate = new Date(enrolledAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - enrollmentDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  viewStudentDetails(student: any) {
    // Navigate to student details page or show modal
    console.log('Viewing student details:', student);
    this.toastService.show('Student details feature coming soon!', 'info');
  }

  sendMessageToStudent(student: any) {
    // Navigate to messages tab with student selected
    this.setActiveTab('messages');
    // You can implement message functionality here
    console.log('Sending message to student:', student);
    this.toastService.show('Message feature coming soon!', 'info');
  }

  // Analytics methods
  loadAnalytics() {
    if (this.user?.role !== 'INSTRUCTOR') return;
    
    this.loadingAnalytics = true;
    
    // First ensure students are loaded, then calculate analytics
    if (this.students.length === 0) {
      // Load students first, then calculate analytics
      this.loadStudents();
      // Wait for students to load, then calculate analytics
      const checkStudentsLoaded = () => {
        if (!this.loadingStudents) {
          this.calculateAnalytics();
        } else {
          setTimeout(checkStudentsLoaded, 100);
        }
      };
      checkStudentsLoaded();
    } else {
      // Students already loaded, calculate analytics immediately
      this.calculateAnalytics();
    }
  }

  calculateAnalytics() {
    console.log('Calculating analytics...');
    console.log('Students array:', this.students);
    console.log('Courses array:', this.courses);
    
    // Calculate total students
    const totalStudents = this.students.length;
    console.log('Total students:', totalStudents);
    
    // Calculate total revenue (assuming each enrollment costs the course price)
    const totalRevenue = this.students.reduce((total, student) => {
      console.log('Student course price:', student.course?.price);
      return total + (student.course?.price || 0);
    }, 0);
    console.log('Total revenue:', totalRevenue);
    
    // Calculate active courses
    const activeCourses = this.courses.length;
    
    // Calculate average rating (mock for now, would come from reviews)
    const averageRating = 4.8; // This would be calculated from actual reviews
    
    // Calculate course performance
    const coursePerformance = this.courses.map(course => {
      const courseStudents = this.students.filter(student => student.course.id === course.id);
      const totalEnrollments = courseStudents.length;
      const completedEnrollments = courseStudents.filter(student => student.completed).length;
      const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;
      const averageProgress = courseStudents.length > 0 
        ? courseStudents.reduce((sum, student) => sum + (student.progress || 0), 0) / courseStudents.length 
        : 0;
      
      return {
        id: course.id,
        title: course.title,
        totalStudents: totalEnrollments,
        revenue: totalEnrollments * course.price,
        rating: 4.8, // Mock rating
        completionRate: completionRate,
        averageProgress: averageProgress,
        status: 'Active'
      };
    });
    
    this.analyticsData = {
      totalStudents,
      totalRevenue,
      activeCourses,
      averageRating,
      coursePerformance,
      recentActivity: this.getRecentActivity()
    };
    
    this.loadingAnalytics = false;
  }

  getRecentActivity() {
    // Generate recent activity based on student enrollments
    const activities: any[] = [];
    
    this.students.slice(0, 5).forEach(student => {
      const daysAgo = this.getDaysSinceEnrollment(student.enrolledAt);
      activities.push({
        type: 'enrollment',
        message: `New student enrolled in ${student.course.title}`,
        student: `${student.student.firstName} ${student.student.lastName}`,
        timeAgo: `${daysAgo} days ago`
      });
    });
    
    return activities;
  }

  refreshAnalytics() {
    console.log('Refreshing analytics...');
    this.loadAnalytics();
  }

  loadMyReviews() {
    if (this.user?.role !== 'STUDENT') return;
    
    this.loadingReviews = true;
    this.reviewsService.getMyReviews().subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.loadingReviews = false;
        console.log('Loaded my reviews:', reviews);
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.loadingReviews = false;
        this.toastService.show('Failed to load reviews', 'error');
      }
    });
  }

  // Helper method to get courses for a specific instructor
  getInstructorCourses(instructorId: string): CourseCard[] {
    return this.courses.filter(course => course.instructor.id === instructorId);
  }

  // Method to send message to instructor
  sendMessageToInstructor(instructor: TeacherCard) {
    // For now, just show a toast message
    this.toastService.show(`Message feature coming soon! You can contact ${instructor.firstName} ${instructor.lastName} at ${instructor.email}`, 'info');
  }
}

