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
      const [totalUsers, totalCourses, totalEnrollments, totalRevenue] =
        await Promise.all([
          this.prisma.user.count(),
          this.prisma.course.count(),
          this.prisma.courseEnrollment.count(),
          this.prisma.course.aggregate({
            _sum: {
              price: true,
            },
          }),
        ]);

      return {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalRevenue: totalRevenue._sum.price || 0,
      };
    } else if (user.role === 'INSTRUCTOR') {
      // Instructor can only see stats for their courses
      const [totalUsers, totalCourses, totalEnrollments, totalRevenue] =
        await Promise.all([
          this.prisma.user.count({
            where: {
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
          this.prisma.course.aggregate({
            where: { instructorId: user.id },
            _sum: {
              price: true,
            },
          }),
        ]);

      return {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalRevenue: totalRevenue._sum.price || 0,
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
    }

    // Admin can see all student progress
    return await this.prisma.courseEnrollment.findMany({
      where: { studentId },
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
}
