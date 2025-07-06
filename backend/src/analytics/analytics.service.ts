import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  DashboardStatsResponse,
  UserStatsResponse,
  CourseEnrollmentStatsResponse,
  InstructorStatsResponse,
  StudentProgressResponse,
  UserResponse,
} from '../common/types';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(user: UserResponse): Promise<DashboardStatsResponse> {
    if (user.role === 'ADMIN') {
      // Admin can see all stats
      const [totalStudents, totalInstructors, totalCourses, totalEnrollments, enrollments] =
        await Promise.all([
          this.prisma.user.count({
            where: { role: 'STUDENT' }
          }),
          this.prisma.user.count({
            where: { role: 'INSTRUCTOR' }
          }),
          this.prisma.course.count(),
          this.prisma.courseEnrollment.count(),
          this.prisma.courseEnrollment.findMany({
            include: {
              course: {
                select: {
                  price: true,
                },
              },
            },
          }),
        ]);

      // Calculate total revenue from enrollments
      const totalRevenue = enrollments.reduce((total, enrollment) => {
        return total + (enrollment.course.price || 0);
      }, 0);

      return {
        totalStudents,
        totalInstructors,
        totalCourses,
        totalEnrollments,
        totalRevenue,
      };
    } else if (user.role === 'INSTRUCTOR') {
      // Instructor can only see stats for their courses
      const [totalStudents, totalCourses, totalEnrollments, enrollments] =
        await Promise.all([
          this.prisma.user.count({
            where: {
              role: 'STUDENT',
              coursesEnrolled: {
                some: {
                  course: {
                    instructorId: user.id,
                  },
                },
              },
            },
          }),
          this.prisma.course.count({
            where: { instructorId: user.id },
          }),
          this.prisma.courseEnrollment.count({
            where: {
              course: {
                instructorId: user.id,
              },
            },
          }),
          this.prisma.courseEnrollment.findMany({
            where: {
              course: {
                instructorId: user.id,
              },
            },
            include: {
              course: {
                select: {
                  price: true,
                },
              },
            },
          }),
        ]);

      // Calculate total revenue from enrollments
      const totalRevenue = enrollments.reduce((total, enrollment) => {
        return total + (enrollment.course.price || 0);
      }, 0);

      return {
        totalStudents,
        totalInstructors: 1, // Instructor only sees themselves
        totalCourses,
        totalEnrollments,
        totalRevenue,
      };
    }

    throw new ForbiddenException('Access denied');
  }

  async getUserStatsByRole(): Promise<UserStatsResponse[]> {
    const result = await this.prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    });
    return result as UserStatsResponse[];
  }

  async getCourseEnrollmentStats(
    user: UserResponse,
  ): Promise<CourseEnrollmentStatsResponse[]> {
    if (user.role === 'ADMIN') {
      // Admin can see all course enrollment stats
      return await this.prisma.course.findMany({
        select: {
          id: true,
          title: true,
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
        orderBy: {
          enrollments: {
            _count: 'desc',
          },
        },
        take: 10,
      });
    } else if (user.role === 'INSTRUCTOR') {
      // Instructor can only see enrollment stats for their courses
      return await this.prisma.course.findMany({
        where: { instructorId: user.id },
        select: {
          id: true,
          title: true,
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
        orderBy: {
          enrollments: {
            _count: 'desc',
          },
        },
        take: 10,
      });
    }

    throw new ForbiddenException('Access denied');
  }

  async getInstructorStats(
    instructorId: string,
    user: UserResponse,
  ): Promise<InstructorStatsResponse> {
    // Check if user has permission to view this instructor's stats
    if (user.role === 'INSTRUCTOR' && user.id !== instructorId) {
      throw new ForbiddenException(
        'You can only view your own instructor stats',
      );
    }

    const [courses, totalStudents, totalRevenue] = await Promise.all([
      this.prisma.course.count({
        where: { instructorId },
      }),
      this.prisma.courseEnrollment.count({
        where: {
          course: {
            instructorId,
          },
        },
      }),
      this.prisma.course.aggregate({
        where: { instructorId },
        _sum: {
          price: true,
        },
      }),
    ]);

    return {
      courses,
      totalStudents,
      totalRevenue: totalRevenue._sum.price || 0,
    };
  }

  async getStudentProgress(
    studentId: string,
    user: UserResponse,
  ): Promise<StudentProgressResponse[]> {
    // Check if user has permission to view this student's progress
    if (user.role === 'STUDENT' && user.id !== studentId) {
      throw new ForbiddenException('You can only view your own progress');
    }

    if (user.role === 'INSTRUCTOR') {
      // Instructor can only see progress for students enrolled in their courses
      return await this.prisma.courseEnrollment.findMany({
        where: {
          studentId,
          course: {
            instructorId: user.id,
          },
        },
        select: {
          id: true,
          progress: true,
          completed: true,
          enrolledAt: true,
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });
    } else if (user.role === 'ADMIN') {
      // Admin can see any student's progress
      return await this.prisma.courseEnrollment.findMany({
        where: {
          studentId,
        },
        select: {
          id: true,
          progress: true,
          completed: true,
          enrolledAt: true,
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });
    }

    throw new ForbiddenException('Access denied');
  }

  async getRevenueOverTime(user: UserResponse) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const currentYear = new Date().getFullYear();
    const revenueData: Array<{ month: string; revenue: number }> = [];

    for (let i = 0; i < 12; i++) {
      const startDate = new Date(currentYear, i, 1);
      const endDate = new Date(currentYear, i + 1, 0);

      let whereClause: any = {
        enrolledAt: {
          gte: startDate,
          lte: endDate,
        },
      };

      // If instructor, only include their courses
      if (user.role === 'INSTRUCTOR') {
        whereClause.course = {
          instructorId: user.id,
        };
      }

      // Get enrollments for this month and sum the course prices
      const enrollments = await this.prisma.courseEnrollment.findMany({
        where: whereClause,
        include: {
          course: {
            select: {
              price: true,
            },
          },
        },
      });

      // Calculate total revenue for this month
      const monthlyRevenue = enrollments.reduce((total, enrollment) => {
        return total + (enrollment.course.price || 0);
      }, 0);

      console.log(`Month ${months[i]}: ${enrollments.length} enrollments, revenue: ${monthlyRevenue}`);

      revenueData.push({
        month: months[i],
        revenue: monthlyRevenue,
      });
    }

    return revenueData;
  }

  async getReviewsSummary(user: UserResponse) {
    // Get reviews for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let whereClause: any = {
      createdAt: {
        gte: thirtyDaysAgo,
      },
    };

    // If instructor, only include reviews for their courses
    if (user.role === 'INSTRUCTOR') {
      whereClause.course = {
        instructorId: user.id,
      };
    }

    // Get all reviews for the period
    const reviews = await this.prisma.courseReview.findMany({
      where: whereClause,
      select: {
        rating: true,
      },
    });

    // Calculate total reviews and average rating
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    // Count reviews by rating (1-5)
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (let rating = 1; rating <= 5; rating++) {
      ratingCounts[rating as keyof typeof ratingCounts] = reviews.filter(review => review.rating === rating).length;
    }

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      ratingCounts,
    };
  }
}
