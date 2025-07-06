import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { CoursesService } from '../services/courses.service';
import { CategoriesService } from '../services/categories.service';
import { CloudinaryService } from '../services/cloudinary.service';
import { ToastService } from '../services/toast.service';
import { SharedNavbar } from '../shared/navbar/navbar.component';

interface Module {
  id?: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id?: string;
  title: string;
  description: string;
  contentType: 'video' | 'pdf' | 'text';
  contentUrl?: string;
  order: number;
}

@Component({
  selector: 'app-course-creation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedNavbar],
  templateUrl: './course-creation.component.html',
  styleUrls: ['./course-creation.component.css']
})
export class CourseCreationComponent implements OnInit {
  courseForm: FormGroup;
  categories: any[] = [];
  isLoading = false;
  user: User | null = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  fileError: string | null = null;

  // Lesson file upload properties
  selectedLessonFiles: { [key: string]: File } = {};
  lessonFilePreviews: { [key: string]: string } = {};
  lessonFileErrors: { [key: string]: string } = {};
  uploadingLessonFiles: { [key: string]: boolean } = {};

  // Editing properties
  isEditing = false;
  courseId: string | null = null;
  existingCourse: any = null;

  constructor(
    private fb: FormBuilder,
    private coursesService: CoursesService,
    private categoriesService: CategoriesService,
    private toastService: ToastService,
    private authService: AuthService,
    private cloudinaryService: CloudinaryService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      objectives: this.fb.array([]),
      prerequisites: this.fb.array([]),
      categoryId: ['', Validators.required],
      difficulty: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      imageUrl: [''],
      modules: this.fb.array([])
    });
  }

  ngOnInit() {
    this.loadUser();
    this.loadCategories();
    
    // Check if we're editing a course
    this.route.params.subscribe(params => {
      this.courseId = params['id'] || null;
      if (this.courseId) {
        this.isEditing = true;
        this.loadCourseForEditing(this.courseId);
      } else {
        // Initialize form with default values for new course
        this.addObjective();
        this.addPrerequisite();
        this.addModule();
      }
    });
  }

  debugFormStructure() {
    console.log('Form structure:', this.courseForm.value);
    console.log('Form valid:', this.courseForm.valid);
    console.log('Form errors:', this.courseForm.errors);
  }

  loadUser() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (!user || user.role !== 'INSTRUCTOR') {
        this.toastService.show('Only instructors can create courses', 'error');
        this.router.navigate(['/profile']);
      }
    });
  }

  loadCategories() {
    this.categoriesService.getCategories().subscribe({
      next: (response: any) => {
        this.categories = response.data || [];
        console.log('Categories loaded:', this.categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.toastService.show('Failed to load categories', 'error');
      }
    });
  }

  loadCourseForEditing(courseId: string) {
    this.coursesService.getCourse(courseId).subscribe({
      next: (course: any) => {
        this.existingCourse = course;
        console.log('Loading course for editing:', course);
        this.populateFormWithCourseData(course);
      },
      error: (error: any) => {
        console.error('Error loading course for editing:', error);
        this.toastService.show('Failed to load course for editing', 'error');
        this.router.navigate(['/profile'], { queryParams: { tab: 'my-courses' } });
      }
    });
  }

  populateFormWithCourseData(course: any) {
    // Set course image if it exists
    if (course.imageUrl) {
      this.imagePreview = course.imageUrl;
    }

    // Populate basic course information
    this.courseForm.patchValue({
      title: course.title,
      description: course.description,
      categoryId: course.categoryId,
      difficulty: course.difficulty,
      price: course.price
    });

    // Populate objectives
    if (course.objectives && course.objectives.length > 0) {
      // Clear existing objectives
      while (this.objectives.length !== 0) {
        this.objectives.removeAt(0);
      }
      // Add objectives from course
      course.objectives.forEach((objective: string) => {
        this.objectives.push(this.fb.control(objective, Validators.required));
      });
    }

    // Populate prerequisites
    if (course.prerequisites && course.prerequisites.length > 0) {
      // Clear existing prerequisites
      while (this.prerequisites.length !== 0) {
        this.prerequisites.removeAt(0);
      }
      // Add prerequisites from course
      course.prerequisites.forEach((prerequisite: string) => {
        this.prerequisites.push(this.fb.control(prerequisite, Validators.required));
      });
    }

    // Populate modules and lessons
    if (course.modules && course.modules.length > 0) {
      // Clear existing modules
      while (this.modules.length !== 0) {
        this.modules.removeAt(0);
      }
      // Add modules from course
      course.modules.forEach((module: any) => {
        const moduleGroup = this.fb.group({
          title: [module.title, Validators.required],
          description: [module.description, Validators.required],
          order: [module.order, Validators.required],
          lessons: this.fb.array([])
        });

        // Add lessons to module
        if (module.lessons && module.lessons.length > 0) {
          module.lessons.forEach((lesson: any) => {
            const lessonGroup = this.fb.group({
              title: [lesson.title, Validators.required],
              description: [lesson.description, Validators.required],
              contentType: [lesson.contentType, Validators.required],
              contentUrl: [lesson.contentUrl],
              order: [lesson.order, Validators.required]
            });
            (moduleGroup.get('lessons') as FormArray).push(lessonGroup);
          });
        }

        this.modules.push(moduleGroup);
      });
    }

    // Ensure we have at least one objective, prerequisite, and module
    if (this.objectives.length === 0) {
      this.addObjective();
    }
    if (this.prerequisites.length === 0) {
      this.addPrerequisite();
    }
    if (this.modules.length === 0) {
      this.addModule();
    }
  }

  // Objectives FormArray methods
  get objectives() {
    return this.courseForm.get('objectives') as FormArray;
  }

  addObjective() {
    this.objectives.push(this.fb.control('', Validators.required));
  }

  removeObjective(index: number) {
    if (this.objectives.length > 1) {
      this.objectives.removeAt(index);
    }
  }

  // Prerequisites FormArray methods
  get prerequisites() {
    return this.courseForm.get('prerequisites') as FormArray;
  }

  addPrerequisite() {
    this.prerequisites.push(this.fb.control('', Validators.required));
  }

  removePrerequisite(index: number) {
    if (this.prerequisites.length > 1) {
      this.prerequisites.removeAt(index);
    }
  }

  // Modules FormArray methods
  get modules() {
    return this.courseForm.get('modules') as FormArray;
  }

  addModule() {
    const moduleGroup = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      order: [this.modules.length + 1, Validators.required],
      lessons: this.fb.array([])
    });

    // Add a default lesson to the new module
    this.addLesson(this.modules.length);

    this.modules.push(moduleGroup);
  }

  removeModule(moduleIndex: number) {
    if (this.modules.length > 1) {
      this.modules.removeAt(moduleIndex);
      this.updateModuleOrders();
    }
  }

  updateModuleOrders() {
    this.modules.controls.forEach((module, index) => {
      module.patchValue({ order: index + 1 });
    });
  }

  // Lessons FormArray methods
  getLessons(moduleIndex: number): FormArray {
    return this.modules.at(moduleIndex).get('lessons') as FormArray;
  }

  addLesson(moduleIndex: number) {
    const lessonGroup = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      contentType: ['video', Validators.required],
      contentUrl: [''],
      order: [this.getLessons(moduleIndex).length + 1, Validators.required]
    });

    this.getLessons(moduleIndex).push(lessonGroup);
  }

  removeLesson(moduleIndex: number, lessonIndex: number) {
    const lessons = this.getLessons(moduleIndex);
    if (lessons.length > 1) {
      lessons.removeAt(lessonIndex);
      this.updateLessonOrders(moduleIndex);
    }
  }

  updateLessonOrders(moduleIndex: number) {
    const lessons = this.getLessons(moduleIndex);
    lessons.controls.forEach((lesson, index) => {
      lesson.patchValue({ order: index + 1 });
    });
  }

  // File handling methods
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  private handleFile(file: File) {
    this.fileError = '';
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.fileError = 'Please select a valid image file (PNG, JPG, GIF, WebP)';
      return;
    }
    
    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.fileError = 'Image file size must be less than 10MB';
      return;
    }
    
    this.selectedFile = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
    
    this.toastService.show('Image selected successfully!', 'success');
  }

  removeFile() {
    this.selectedFile = null;
    this.imagePreview = null;
    this.fileError = '';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Lesson file upload methods
  onLessonFileSelected(event: any, moduleIndex: number, lessonIndex: number) {
    const file = event.target.files[0];
    const key = `${moduleIndex}-${lessonIndex}`;
    this.handleLessonFile(file, key);
  }

  onLessonDragOver(event: DragEvent, moduleIndex: number, lessonIndex: number) {
    event.preventDefault();
    event.stopPropagation();
  }

  onLessonDragLeave(event: DragEvent, moduleIndex: number, lessonIndex: number) {
    event.preventDefault();
    event.stopPropagation();
  }

  onLessonDrop(event: DragEvent, moduleIndex: number, lessonIndex: number) {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const key = `${moduleIndex}-${lessonIndex}`;
      this.handleLessonFile(files[0], key);
    }
  }

  private handleLessonFile(file: File, key: string) {
    this.lessonFileErrors[key] = '';
    
    // Get the lesson to check content type
    const [moduleIndex, lessonIndex] = key.split('-').map(Number);
    const lesson = this.getLessons(moduleIndex).at(lessonIndex);
    const contentType = lesson?.get('contentType')?.value || 'video';
    
    // Validate file type based on content type
    if (contentType === 'video') {
      const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'];
      if (!allowedTypes.includes(file.type)) {
        this.lessonFileErrors[key] = 'Please select a valid video file (MP4, AVI, MOV, WMV, FLV, WebM)';
        return;
      }
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        this.lessonFileErrors[key] = 'Video file size must be less than 500MB';
        return;
      }
    } else if (contentType === 'pdf') {
      if (file.type !== 'application/pdf') {
        this.lessonFileErrors[key] = 'Please select a valid PDF file';
        return;
      }
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        this.lessonFileErrors[key] = 'PDF file size must be less than 50MB';
        return;
      }
    } else if (contentType === 'image') {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.lessonFileErrors[key] = 'Please select a valid image file (PNG, JPG, GIF, WebP)';
        return;
      }
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        this.lessonFileErrors[key] = 'Image file size must be less than 10MB';
        return;
      }
    }

    this.selectedLessonFiles[key] = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      this.lessonFilePreviews[key] = reader.result as string;
    };
    reader.readAsDataURL(file);
    
    this.toastService.show('File selected successfully!', 'success');
  }

  async uploadLessonFile(moduleIndex: number, lessonIndex: number): Promise<string | null> {
    const key = `${moduleIndex}-${lessonIndex}`;
    const file = this.selectedLessonFiles[key];
    
    if (!file) {
      return null;
    }

    this.uploadingLessonFiles[key] = true;
    
    try {
      const lesson = this.getLessons(moduleIndex).at(lessonIndex);
      const contentType = lesson?.get('contentType')?.value || 'video';
      
      let uploadResult;
      if (contentType === 'video') {
        uploadResult = await this.cloudinaryService.uploadVideo(file, 'lms/videos').toPromise();
      } else if (contentType === 'pdf') {
        uploadResult = await this.cloudinaryService.uploadPDF(file, 'lms/documents').toPromise();
      } else if (contentType === 'image') {
        uploadResult = await this.cloudinaryService.uploadImage(file, 'lms/images').toPromise();
      } else {
        throw new Error('Unsupported content type');
      }
      
      if (uploadResult && uploadResult.url) {
        this.toastService.show('File uploaded successfully!', 'success');
        return uploadResult.url;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading lesson file:', error);
      this.toastService.show('Failed to upload file. Please try again.', 'error');
      return null;
    } finally {
      this.uploadingLessonFiles[key] = false;
    }
  }

  removeLessonFile(moduleIndex: number, lessonIndex: number) {
    const key = `${moduleIndex}-${lessonIndex}`;
    delete this.selectedLessonFiles[key];
    delete this.lessonFilePreviews[key];
    delete this.lessonFileErrors[key];
    delete this.uploadingLessonFiles[key];
  }

  getLessonFileKey(moduleIndex: number, lessonIndex: number): string {
    return `${moduleIndex}-${lessonIndex}`;
  }

  cancel() {
    this.router.navigate(['/profile'], { queryParams: { tab: 'my-courses' } });
  }

  // Form submission
  async onSubmit() {
    if (this.courseForm.valid) {
      this.isLoading = true;
      
      try {
        // Upload course image if selected
        let courseImageUrl = '';
        if (this.selectedFile) {
          this.toastService.show('Uploading course image...', 'info');
          const uploadResult = await this.cloudinaryService.uploadImage(
            this.selectedFile,
            'course-images'
          ).toPromise();
          
          if (uploadResult && uploadResult.url) {
            courseImageUrl = uploadResult.url;
            this.toastService.show('Course image uploaded successfully!', 'success');
          } else {
            throw new Error('Failed to upload course image');
          }
        } else if (this.existingCourse?.imageUrl) {
          // Keep existing image if no new image is selected
          courseImageUrl = this.existingCourse.imageUrl;
        }

        // Upload lesson files and prepare course data
        const courseData = this.courseForm.value;
        
        // Filter out empty objectives and prerequisites
        courseData.objectives = courseData.objectives.filter((obj: string) => obj.trim() !== '');
        courseData.prerequisites = courseData.prerequisites.filter((prereq: string) => prereq.trim() !== '');

        // Filter out empty modules and lessons, and upload lesson files
        courseData.modules = await Promise.all(
          courseData.modules
            .filter((module: any) => module.title.trim() !== '')
            .map(async (module: any, moduleIndex: number) => {
              const lessons = await Promise.all(
                module.lessons
                  .filter((lesson: any) => lesson.title.trim() !== '')
                  .map(async (lesson: any, lessonIndex: number) => {
                    // Upload lesson file if selected
                    const key = `${moduleIndex}-${lessonIndex}`;
                    if (this.selectedLessonFiles[key]) {
                      this.toastService.show(`Uploading lesson file: ${lesson.title}...`, 'info');
                      const fileUrl = await this.uploadLessonFile(moduleIndex, lessonIndex);
                      if (fileUrl) {
                        lesson.contentUrl = fileUrl;
                      } else {
                        throw new Error(`Failed to upload file for lesson: ${lesson.title}`);
                      }
                    }
                    return lesson;
                  })
              );
              
              return {
                ...module,
                lessons
              };
            })
        );

        // Add course image URL if uploaded or existing
        if (courseImageUrl) {
          courseData.imageUrl = courseImageUrl;
        }

        console.log('Course data to submit:', courseData);

        // Create or update the course
        if (this.isEditing && this.courseId) {
          this.coursesService.updateCourse(this.courseId, courseData).subscribe({
            next: (response) => {
              this.isLoading = false;
              this.toastService.show('Course updated successfully!', 'success');
              this.router.navigate(['/profile'], { queryParams: { tab: 'my-courses' } });
            },
            error: (error) => {
              this.isLoading = false;
              console.error('Error updating course:', error);
              this.toastService.show('Failed to update course. Please try again.', 'error');
            }
          });
        } else {
          this.coursesService.createCourse(courseData).subscribe({
            next: (response) => {
              this.isLoading = false;
              this.toastService.show('Course created successfully!', 'success');
              this.router.navigate(['/profile'], { queryParams: { tab: 'my-courses' } });
            },
            error: (error) => {
              this.isLoading = false;
              console.error('Error creating course:', error);
              this.toastService.show('Failed to create course. Please try again.', 'error');
            }
          });
        }
      } catch (error) {
        this.isLoading = false;
        console.error('Error during course submission:', error);
        this.toastService.show('Failed to save course. Please try again.', 'error');
      }
    } else {
      this.markFormGroupTouched(this.courseForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}