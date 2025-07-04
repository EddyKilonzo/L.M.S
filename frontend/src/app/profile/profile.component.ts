import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SharedNavbar } from '../shared/navbar/navbar.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastService } from '../services/toast.service';

// Mock course data type
interface CourseCard {
  id: number;
  title: string;
  image: string;
  instructor: string;
  rating: number;
  reviews: number;
}

// Mock teacher data type
interface TeacherCard {
  id: number;
  name: string;
  image: string;
  title: string;
  rating: number;
  reviews: number;
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

// Mock review data type
interface Review {
  id: number;
  courseName: string;
  rating: number;
  text: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SharedNavbar, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  user: any = null;
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
  }

  // My Courses mock data
  courses: CourseCard[] = [
    {
      id: 1,
      title: "Beginner's Guide to Design",
      image: '/assets/images/course-image2.jpg',
      instructor: 'Amanda Knowles',
      rating: 4.8,
      reviews: 1200,
    },
    {
      id: 2,
      title: "Beginner's Guide to Design",
      image: '/assets/images/course-image2.jpg',
      instructor: 'Amanda Knowles',
      rating: 4.8,
      reviews: 1200,
    },
    {
      id: 3,
      title: "Beginner's Guide to Design",
      image: '/assets/images/course-image2.jpg',
      instructor: 'Amanda Knowles',
      rating: 4.8,
      reviews: 1200,
    },
    {
      id: 4,
      title: "Beginner's Guide to Design",
      image: '/assets/images/course-image2.jpg',
      instructor: 'Amanda Knowles',
      rating: 4.8,
      reviews: 1200,
    },
    {
      id: 5,
      title: "Beginner's Guide to Design",
      image: '/assets/images/course-image2.jpg',
      instructor: 'Amanda Knowles',
      rating: 4.8,
      reviews: 1200,
    },
    {
      id: 6,
      title: "Beginner's Guide to Design",
      image: '/assets/images/course-image2.jpg',
      instructor: 'Amanda Knowles',
      rating: 4.8,
      reviews: 1200,
    },
    {
      id: 7,
      title: "Beginner's Guide to Design",
      image: '/assets/images/course-image2.jpg',
      instructor: 'Amanda Knowles',
      rating: 4.8,
      reviews: 1200,
    },
    {
      id: 8,
      title: "Beginner's Guide to Design",
      image: '/assets/images/course-image2.jpg',
      instructor: 'Amanda Knowles',
      rating: 4.8,
      reviews: 1200,
    },
    {
      id: 9,
      title: "Beginner's Guide to Design",
      image: '/assets/images/course-image2.jpg',
      instructor: 'Amanda Knowles',
      rating: 4.8,
      reviews: 1200,
    },
  ];

  // Search, sort, and pagination
  courseSearch = '';
  courseSort = 'Newest';
  currentPage = 1;
  pageSize = 9;

  get filteredCourses(): CourseCard[] {
    let filtered = this.courses.filter(c =>
      c.title.toLowerCase().includes(this.courseSearch.toLowerCase())
    );
    // Sort logic (mock)
    if (this.courseSort === 'Newest') {
      filtered = filtered.slice().reverse();
    }
    // Pagination
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(
      this.courses.filter(c =>
        c.title.toLowerCase().includes(this.courseSearch.toLowerCase())
      ).length / this.pageSize
    );
  }

  setPage(page: number) {
    this.currentPage = page;
  }

  // Teachers mock data
  teachers: TeacherCard[] = [
    {
      id: 1,
      name: 'Ronald Richards',
      image: '/assets/images/student1-removebg-preview.png',
      title: 'UI/UX Designer',
      rating: 4.9,
      reviews: 856,
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      image: '/assets/images/student1-removebg-preview.png',
      title: 'Frontend Developer',
      rating: 4.8,
      reviews: 723,
    },
    {
      id: 3,
      name: 'Michael Chen',
      image: '/assets/images/student1-removebg-preview.png',
      title: 'Backend Engineer',
      rating: 4.7,
      reviews: 645,
    },
    {
      id: 4,
      name: 'Emily Davis',
      image: '/assets/images/student1-removebg-preview.png',
      title: 'Data Scientist',
      rating: 4.9,
      reviews: 892,
    },
    {
      id: 5,
      name: 'David Wilson',
      image: '/assets/images/student1-removebg-preview.png',
      title: 'DevOps Engineer',
      rating: 4.6,
      reviews: 534,
    },
    {
      id: 6,
      name: 'Lisa Anderson',
      image: '/assets/images/student1-removebg-preview.png',
      title: 'Product Manager',
      rating: 4.8,
      reviews: 678,
    },
  ];

  teacherSearch = '';
  teacherSort = 'Relevance';
  teacherRatingFilter = '';
  teacherPage = 1;
  teacherPageSize = 6;

  get filteredTeachers(): TeacherCard[] {
    let filtered = this.teachers.filter(t =>
      t.name.toLowerCase().includes(this.teacherSearch.toLowerCase())
    );
    
    // Rating filter
    if (this.teacherRatingFilter) {
      const minRating = parseFloat(this.teacherRatingFilter);
      filtered = filtered.filter(t => t.rating >= minRating);
    }
    
    // Sort logic (mock)
    if (this.teacherSort === 'Relevance') {
      // No-op for now
    }
    
    // Pagination
    const start = (this.teacherPage - 1) * this.teacherPageSize;
    return filtered.slice(start, start + this.teacherPageSize);
  }

  get teacherTotalPages(): number {
    let filtered = this.teachers.filter(t =>
      t.name.toLowerCase().includes(this.teacherSearch.toLowerCase())
    );
    
    // Rating filter
    if (this.teacherRatingFilter) {
      const minRating = parseFloat(this.teacherRatingFilter);
      filtered = filtered.filter(t => t.rating >= minRating);
    }
    
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
  reviews: Review[] = [
    {
      id: 1,
      courseName: "Beginner's Guide to Design",
      rating: 5,
      text: 'I was initially apprehensive, having no prior design experience. But the instructor, John Doe, did an amazing job of breaking down complex concepts into easily digestible modules. The video lectures were engaging, and the real-world examples really helped solidify my understanding.'
    },
    {
      id: 2,
      courseName: "Beginner's Guide to Design",
      rating: 5,
      text: 'I was initially apprehensive, having no prior design experience. But the instructor, John Doe, did an amazing job of breaking down complex concepts into easily digestible modules. The video lectures were engaging, and the real-world examples really helped solidify my understanding.'
    },
    {
      id: 3,
      courseName: "Beginner's Guide to Design",
      rating: 5,
      text: 'I was initially apprehensive, having no prior design experience. But the instructor, John Doe, did an amazing job of breaking down complex concepts into easily digestible modules. The video lectures were engaging, and the real-world examples really helped solidify my understanding.'
    }
  ];

  editingReviewId: number | null = null;
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
      r.courseName.toLowerCase().includes(this.reviewSearch.toLowerCase()) ||
      r.text.toLowerCase().includes(this.reviewSearch.toLowerCase())
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
    this.editedReviewText = review.text;
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
      review.text = this.editedReviewText;
      review.rating = this.editedReviewRating;
    }
    this.cancelEditReview();
  }

  deleteReview(review: Review) {
    if (confirm('Are you sure you want to delete this review?')) {
      this.reviews = this.reviews.filter(r => r.id !== review.id);
      // Adjust page if needed
      if (this.reviewPage > this.reviewTotalPages) {
        this.reviewPage = this.reviewTotalPages || 1;
      }
    }
  }

  // For review menu open/close
  openReviewMenuId: number | null = null;
  confirmDeleteReviewId: number | null = null;

  toggleReviewMenu(reviewId: number) {
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
    this.reviews = this.reviews.filter(r => r.id !== review.id);
    this.closeReviewMenu();
    // Adjust page if needed
    if (this.reviewPage > this.reviewTotalPages) {
      this.reviewPage = this.reviewTotalPages || 1;
    }
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private http: HttpClient,
    private toastService: ToastService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      about: [''],
    });
  }

  ngOnInit() {
    console.log('Starting profile component initialization');
    this.authService.currentUser$.subscribe((user) => {
      console.log('Current user state:', {
        hasUser: !!user,
        userId: user?.id,
        role: user?.role,
        isVerified: user?.isVerified,
      });

      this.user = user;
      if (user) {
        console.log('Loading profile form with user data:', {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          about: user.about || '',
        });

        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          about: user.about || '',
        });
        this.imagePreview = user.avatarUrl || null;
        
        // Set default active tab based on user role
        if (user.role === 'INSTRUCTOR') {
          this.activeTab = 'my-courses';
        } else {
          this.activeTab = 'my-courses';
        }
      }
    });
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

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.toastService.show('Image selected successfully!', 'success');
      };
      reader.onerror = () => {
        this.toastService.show('Error reading image file.', 'error');
      };
      reader.readAsDataURL(file);
      
      // TODO: Implement actual image upload to server
      // For now, we just show a preview
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

  onSave() {
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

      console.log('Attempting profile update:', {
        userId: this.user.id,
        formData: { firstName, lastName, about, profileProgress },
        tokenExists: !!token,
        formValid: this.profileForm.valid,
      });

      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      });

      this.http
        .patch(
          `/api/users/${this.user.id}`,
          { firstName, lastName, about, profileProgress },
          { headers }
        )
        .subscribe({
          next: (response) => {
            console.debug('Profile update response:', response);
            this.toastService.show('Profile updated successfully!', 'success');
            this.authService.updateCurrentUser({
              ...this.user,
              firstName,
              lastName,
              about,
              profileProgress,
            });
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Profile update error:', {
              status: error.status,
              message: error.message,
              error: error.error,
              userId: this.user.id,
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
    } else {
      this.toastService.show('Please fill in all required fields.', 'warning');
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
    this.imagePreview = null;
    this.fileError = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
