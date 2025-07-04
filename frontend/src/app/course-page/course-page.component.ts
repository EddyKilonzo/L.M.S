import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedNavbar } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-course-page',
  standalone: true,
  imports: [CommonModule, SharedNavbar],
  templateUrl: './course-page.component.html',
  styleUrls: ['./course-page.component.css'],
})
export class CoursePageComponent {
  course = {
    title: 'Introduction to User Experience Design',
    description:
      'This course is meticulously crafted to provide you with a foundational understanding of the principles, methodologies, and tools that drive exceptional user experiences in the digital landscape.',
    rating: 4.5,
    reviews: 1200,
    totalHours: 22,
    lectures: 155,
    level: 'Beginner',
    author: 'Ronald Richards',
    authorTitle: 'UI/UX Designer',
    authorImage: 'assets/images/mentor-image.jpg',
    language: 'English, Spanish, Dutch, German',
    price: 82.5,
    discount: '50% Off',
    image: 'assets/images/course-image.jpg',
  };

  syllabus = [
    {
      title: 'Introduction to UX Design',
      lessons: 12,
      time: '1 hour',
      open: true,
    },
    {
      title: 'Basics of User-Centered Design',
      lessons: 10,
      time: '45 mins',
      open: false,
    },
    {
      title: 'Elements of User Experience',
      lessons: 8,
      time: '30 mins',
      open: false,
    },
    {
      title: 'Visual Design Principles',
      lessons: 15,
      time: '1.5 hours',
      open: false,
    },
  ];

  reviews = [
    {
      name: 'Mark Doe',
      date: 'Reviewed on Dec 2nd, 2024',
      rating: 5,
      review:
        'I was initially apprehensive, having no prior design experience. But the instructor, Jane Doe, did an amazing job of breaking down complex concepts into easily digestible modules. The video lectures were engaging, and the real-world exercises really helped solidify my understanding.',
    },
    {
      name: 'Mark Doe',
      date: 'Reviewed on Dec 2nd, 2024',
      rating: 5,
      review:
        'I was initially apprehensive, having no prior design experience. But the instructor, Jane Doe, did an amazing job of breaking down complex concepts into easily digestible modules. The video lectures were engaging, and the real-world exercises really helped solidify my understanding.',
    },
    {
      name: 'Mark Doe',
      date: 'Reviewed on Dec 2nd, 2024',
      rating: 5,
      review:
        'I was initially apprehensive, having no prior design experience. But the instructor, Jane Doe, did an amazing job of breaking down complex concepts into easily digestible modules. The video lectures were engaging, and the real-world exercises really helped solidify my understanding.',
    },
  ];

  testimonials = [
    {
      name: 'John Doe',
      title: 'Designer',
      quote: `Byway's tech courses are top-notch! As someone who's always looking to stay ahead in the rapidly evolving tech world, I appreciate the up-to-date content and engaging multimedia.`,
    },
    {
      name: 'John Doe',
      title: 'Designer',
      quote: `Byway's tech courses are top-notch! As someone who's always looking to stay ahead in the rapidly evolving tech world, I appreciate the up-to-date content and engaging multimedia.`,
    },
    {
      name: 'John Doe',
      title: 'Designer',
      quote: `Byway's tech courses are top-notch! As someone who's always looking to stay ahead in the rapidly evolving tech world, I appreciate the up-to-date content and engaging multimedia.`,
    },
  ];

  relatedCourses = [
    {
      title: "Beginner's Guide to Design",
      author: 'Ronald Richards',
      rating: 4.5,
      reviews: 1200,
      price: 149.9,
      image: 'assets/images/course-image.jpg',
    },
    {
      title: "Beginner's Guide to Design",
      author: 'Ronald Richards',
      rating: 4.5,
      reviews: 1200,
      price: 149.9,
      image: 'assets/images/course-image.jpg',
    },
    {
      title: "Beginner's Guide to Design",
      author: 'Ronald Richards',
      rating: 4.5,
      reviews: 1200,
      price: 149.9,
      image: 'assets/images/course-image.jpg',
    },
    {
      title: "Beginner's Guide to Design",
      author: 'Ronald Richards',
      rating: 4.5,
      reviews: 1200,
      price: 149.9,
      image: 'assets/images/course-image.jpg',
    },
  ];

  toggleSyllabus(item: any) {
    item.open = !item.open;
  }
}
