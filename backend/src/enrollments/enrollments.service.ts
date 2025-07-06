import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import {
  EnrollmentResponse,
  EnrollmentWithStudentAndCourseResponse,
  EnrollmentWithStudentResponse,
  StudentLessonCompletionResponse,
} from '../common/types';

@Injectable()
export class EnrollmentsService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
  ) {}

  async enroll(
    studentId: string,
    courseId: string,
  ): Promise<EnrollmentWithStudentAndCourseResponse> {
    const existingEnrollment = await this.prisma.courseEnrollment.findFirst({
      where: {
        studentId,
        courseId,
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('Student is already enrolled in this course');
    }

    const enrollment = (await this.prisma.courseEnrollment.create({
      data: {
        studentId,
        courseId,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    })) as EnrollmentWithStudentAndCourseResponse;

    // Send enrollment email
    const courseUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/courses/${courseId}`;
    await this.mailerService.sendCourseEnrollmentEmail(
      enrollment.student.email,
      enrollment.student.firstName,
      enrollment.course.title,
      courseUrl,
    );

    return enrollment;
  }

  async getStudentEnrollments(
    studentId: string,
  ): Promise<EnrollmentWithStudentAndCourseResponse[]> {
    return (await this.prisma.courseEnrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            category: true,
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
      },
    })) as unknown as EnrollmentWithStudentAndCourseResponse[];
  }

  async getCourseEnrollments(
    courseId: string,
  ): Promise<EnrollmentWithStudentResponse[]> {
    return (await this.prisma.courseEnrollment.findMany({
      where: { courseId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })) as EnrollmentWithStudentResponse[];
  }

  async updateProgress(
    enrollmentId: string,
    progress: number,
  ): Promise<EnrollmentResponse> {
    const enrollment = await this.prisma.courseEnrollment.update({
      where: { id: enrollmentId },
      data: {
        progress,
        completed: progress >= 100,
        completedAt: progress >= 100 ? new Date() : null,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Send completion email if course is completed
    if (progress >= 100 && enrollment.completed) {
      const certificateUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/certificates/${enrollmentId}`;
      await this.mailerService.sendCourseCompletionEmail(
        enrollment.student.email,
        enrollment.student.firstName,
        enrollment.course.title,
        certificateUrl,
      );
    }

    return enrollment as EnrollmentResponse;
  }

  async markLessonComplete(
    studentId: string,
    lessonId: string,
  ): Promise<StudentLessonCompletionResponse> {
    const existingCompletion =
      await this.prisma.studentLessonCompletion.findFirst({
        where: {
          studentId,
          lessonId,
        },
      });

    if (existingCompletion) {
      return existingCompletion as StudentLessonCompletionResponse;
    }

    const completion = await this.prisma.studentLessonCompletion.create({
      data: {
        studentId,
        lessonId,
      },
    });

    // Calculate and update course progress
    await this.calculateAndUpdateCourseProgress(studentId, lessonId);

    return completion as StudentLessonCompletionResponse;
  }

  async calculateAndUpdateCourseProgress(
    studentId: string,
    lessonId: string,
  ): Promise<void> {
    // Get the course for this lesson
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: {
              include: {
                modules: {
                  include: {
                    lessons: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lesson) return;

    const courseId = lesson.module.course.id;
    const totalLessons = lesson.module.course.modules.reduce(
      (total, module) => total + module.lessons.length,
      0,
    );

    // Count completed lessons for this student in this course
    const completedLessons = await this.prisma.studentLessonCompletion.count({
      where: {
        studentId,
        lesson: {
          module: {
            courseId,
          },
        },
      },
    });

    const progress =
      totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    // Update enrollment progress
    await this.prisma.courseEnrollment.updateMany({
      where: {
        studentId,
        courseId,
      },
      data: {
        progress,
        completed: progress >= 100,
        completedAt: progress >= 100 ? new Date() : null,
      },
    });

    // Send completion email if course is completed
    if (progress >= 100) {
      const enrollment = await this.prisma.courseEnrollment.findFirst({
        where: {
          studentId,
          courseId,
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      if (enrollment) {
        const certificateUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/certificates/${enrollment.id}`;
        await this.mailerService.sendCourseCompletionEmail(
          enrollment.student.email,
          enrollment.student.firstName,
          enrollment.course.title,
          certificateUrl,
        );
      }
    }
  }

  async getStudentProgress(
    studentId: string,
    courseId: string,
  ): Promise<{
    enrollment: EnrollmentWithStudentAndCourseResponse;
    completedLessons: number;
    totalLessons: number;
    progress: number;
    completedModules: number;
    totalModules: number;
    completedLessonIds: string[];
  }> {
    const enrollment = await this.prisma.courseEnrollment.findFirst({
      where: { studentId, courseId },
      include: {
        student: true,
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                isVerified: true,
                createdAt: true,
                profileImage: true,
              },
            },
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    const totalLessons = enrollment.course.modules.reduce(
      (total, module) => total + module.lessons.length,
      0,
    );

    const completedLessons = await this.prisma.studentLessonCompletion.count({
      where: {
        studentId,
        lesson: {
          module: {
            courseId,
          },
        },
      },
    });

    // Get completed lesson IDs
    const completedLessonRecords = await this.prisma.studentLessonCompletion.findMany({
      where: {
        studentId,
        lesson: {
          module: {
            courseId,
          },
        },
      },
      select: { lessonId: true },
    });
    const completedLessonIds = completedLessonRecords.map(r => r.lessonId);

    const totalModules = enrollment.course.modules.length;
    const completedModules = await this.prisma.courseModule.count({
      where: {
        courseId,
        lessons: {
          some: {
            completedBy: {
              some: {
                studentId,
              },
            },
          },
        },
      },
    });

    // Transform the enrollment to match the API response type
    const transformedEnrollment = {
      ...enrollment,
      completedAt: enrollment.completedAt || undefined,
      certificateUrl: enrollment.certificateUrl || undefined,
    };

    return {
      enrollment: transformedEnrollment,
      completedLessons,
      totalLessons,
      progress: enrollment.progress,
      completedModules,
      totalModules,
      completedLessonIds,
    };
  }

  async getEnrollmentStats(courseId: string): Promise<{
    totalEnrollments: number;
    completedEnrollments: number;
    averageProgress: number;
    recentEnrollments: number;
  }> {
    const [totalEnrollments, completedEnrollments, recentEnrollments] =
      await Promise.all([
        this.prisma.courseEnrollment.count({ where: { courseId } }),
        this.prisma.courseEnrollment.count({
          where: { courseId, completed: true },
        }),
        this.prisma.courseEnrollment.count({
          where: {
            courseId,
            enrolledAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
        }),
      ]);

    const averageProgressResult = await this.prisma.courseEnrollment.aggregate({
      where: { courseId },
      _avg: { progress: true },
    });

    return {
      totalEnrollments,
      completedEnrollments,
      averageProgress: averageProgressResult._avg.progress || 0,
      recentEnrollments,
    };
  }
}
