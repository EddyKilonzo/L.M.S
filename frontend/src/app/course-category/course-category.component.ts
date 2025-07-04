import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedNavbar } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-course-category',
  standalone: true,
  imports: [CommonModule, SharedNavbar],
  templateUrl: './course-category.component.html',
  styleUrls: ['./course-category.component.css'],
})
export class CourseCategoryComponent implements OnInit {
  openFilters: { [key: string]: boolean } = {
    rating: true,
    chapters: true,
    price: true,
    category: true,
  };

  toggleFilter(filter: string) {
    this.openFilters[filter] = !this.openFilters[filter];
  }

  // Mentor pagination
  mentorCurrentPage = 1;
  mentorPageSize = 5;
  paginatedMentors: any[] = [];
  totalMentorPages = 0;

  ngOnInit() {
    this.totalMentorPages = Math.ceil(
      this.mentors.length / this.mentorPageSize
    );
    this.updatePaginatedMentors();
  }

  updatePaginatedMentors() {
    const startIndex = (this.mentorCurrentPage - 1) * this.mentorPageSize;
    const endIndex = startIndex + this.mentorPageSize;
    this.paginatedMentors = this.mentors.slice(startIndex, endIndex);
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

  courses = [
    {
      title: "Beginner's Guide to Design",
      author: 'Ronald Richards',
      rating: 4.5,
      reviews: 1200,
      hours: 22,
      lectures: 155,
      level: 'Beginner',
      price: 149.9,
      image: 'assets/images/course-image.jpg',
    },
    {
      title: 'Intermediate Design Concepts',
      author: 'Jane Doe',
      rating: 4.7,
      reviews: 900,
      hours: 18,
      lectures: 120,
      level: 'Intermediate',
      price: 199.9,
      image: 'assets/images/course-image2.jpg',
    },
    {
      title: 'Advanced Design Techniques',
      author: 'John Smith',
      rating: 4.9,
      reviews: 600,
      hours: 25,
      lectures: 180,
      level: 'Advanced',
      price: 249.9,
      image: 'assets/images/course-image3.jpg',
    },
    {
      title: 'UI/UX Design Bootcamp',
      author: 'Emily Johnson',
      rating: 4.8,
      reviews: 1100,
      hours: 30,
      lectures: 200,
      level: 'Beginner',
      price: 299.9,
      image: 'assets/images/course-image4.jpg',
    },
    {
      title: 'Design Thinking and Innovation',
      author: 'Michael Brown',
      rating: 4.6,
      reviews: 700,
      hours: 20,
      lectures: 140,
      level: 'Intermediate',
      price: 179.9,
      image: 'assets/images/course-image5.jpg',
    },
    {
      title: 'Mastering Adobe XD',
      author: 'Sarah Wilson',
      rating: 4.7,
      reviews: 800,
      hours: 15,
      lectures: 100,
      level: 'Advanced',
      price: 219.9,
      image: 'assets/images/course-image6.jpg',
    },
    {
      title: "Beginner's Guide to Design",
      author: 'Ronald Richards',
      rating: 4.5,
      reviews: 1200,
      hours: 22,
      lectures: 155,
      level: 'Beginner',
      price: 149.9,
      image: 'assets/images/course-image.jpg',
    },
    {
      title: "Beginner's Guide to Design",
      author: 'Ronald Richards',
      rating: 4.5,
      reviews: 1200,
      hours: 22,
      lectures: 155,
      level: 'Beginner',
      price: 149.9,
      image: 'assets/images/course-image.jpg',
    },
    {
      title: "Beginner's Guide to Design",
      author: 'Ronald Richards',
      rating: 4.5,
      reviews: 1200,
      hours: 22,
      lectures: 155,
      level: 'Beginner',
      price: 149.9,
      image: 'assets/images/course-image.jpg',
    },
  ];

  mentors = [
    {
      name: 'Ronald Richards',
      title: 'UI/UX Designer',
      rating: 4.8,
      students: 2400,
      image: 'assets/images/mentor-image.jpg',
    },
    {
      name: 'Jane Doe',
      title: 'Senior Designer',
      rating: 4.7,
      students: 1800,
      image: 'assets/images/mentor-image2.jpg',
    },
    {
      name: 'John Smith',
      title: 'Design Lead',
      rating: 4.9,
      students: 1500,
      image: 'assets/images/mentor-image3.jpg',
    },
    {
      name: 'Emily Johnson',
      title: 'UI/UX Specialist',
      rating: 4.8,
      students: 2100,
      image: 'assets/images/mentor-image4.jpg',
    },
    {
      name: 'Michael Brown',
      title: 'Creative Director',
      rating: 4.6,
      students: 1300,
      image: 'assets/images/mentor-image5.jpg',
    },
    {
      name: 'Sarah Wilson',
      title: 'Adobe Expert',
      rating: 4.7,
      students: 1700,
      image: 'assets/images/mentor-image6.jpg',
    },
    {
      name: 'Ronald Richards',
      title: 'UI/UX Designer',
      rating: 4.8,
      students: 2400,
      image: 'assets/images/mentor-image.jpg',
    },
    {
      name: 'Ronald Richards',
      title: 'UI/UX Designer',
      rating: 4.8,
      students: 2400,
      image: 'assets/images/mentor-image.jpg',
    },
    {
      name: 'Ronald Richards',
      title: 'UI/UX Designer',
      rating: 4.8,
      students: 2400,
      image: 'assets/images/mentor-image.jpg',
    },
  ];

  featuredCourses = [
    {
      title: "Beginner's Guide to Design",
      author: 'Ronald Richards',
      rating: 4.5,
      reviews: 1200,
      hours: 22,
      lectures: 155,
      level: 'Beginner',
      price: 149.9,
      image: 'assets/images/course-image.jpg',
    },
    {
      title: "Beginner's Guide to Design",
      author: 'Ronald Richards',
      rating: 4.5,
      reviews: 1200,
      hours: 22,
      lectures: 155,
      level: 'Beginner',
      price: 149.9,
      image: 'assets/images/course-image.jpg',
    },
    {
      title: "Beginner's Guide to Design",
      author: 'Ronald Richards',
      rating: 4.5,
      reviews: 1200,
      hours: 22,
      lectures: 155,
      level: 'Beginner',
      price: 149.9,
      image: 'assets/images/course-image.jpg',
    },
    {
      title: "Beginner's Guide to Design",
      author: 'Ronald Richards',
      rating: 4.5,
      reviews: 1200,
      hours: 22,
      lectures: 155,
      level: 'Beginner',
      price: 149.9,
      image: 'assets/images/course-image.jpg',
    },
  ];
}
