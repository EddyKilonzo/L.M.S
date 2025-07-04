import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from './dto';
import {
  CourseResponse,
  CourseWithInstructorAndCategoryResponse,
  PaginatedResponse,
  UserResponse,
} from '../common/types';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createCourseDto: CreateCourseDto,
    instructorId: string,
  ): Promise<CourseWithInstructorAndCategoryResponse> {
    return (await this.prisma.course.create({
      data: {
        ...createCourseDto,
        instructorId,
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: true,
      },
    })) as CourseWithInstructorAndCategoryResponse;
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    categoryId?: string,
    difficulty?: string,
    minPrice?: number,
    maxPrice?: number,
  ): Promise<PaginatedResponse<CourseWithInstructorAndCategoryResponse>> {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {} as Record<string, number>;
      if (minPrice !== undefined) {
        (where.price as Record<string, number>).gte = minPrice;
      }
      if (maxPrice !== undefined) {
        (where.price as Record<string, number>).lte = maxPrice;
      }
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          category: true,
          _count: {
            select: {
              enrollments: true,
              reviews: true,
            },
          },
        },
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      data: courses as unknown as CourseWithInstructorAndCategoryResponse[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(
    id: string,
  ): Promise<CourseWithInstructorAndCategoryResponse | null> {
    return (await this.prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: true,
        modules: {
          include: {
            lessons: true,
          },
        },
        reviews: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
    })) as CourseWithInstructorAndCategoryResponse | null;
  }

  async findByInstructor(
    instructorId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<CourseWithInstructorAndCategoryResponse>> {
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where: { instructorId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          category: true,
          _count: {
            select: {
              enrollments: true,
              reviews: true,
            },
          },
        },
      }),
      this.prisma.course.count({ where: { instructorId } }),
    ]);

    return {
      data: courses as unknown as CourseWithInstructorAndCategoryResponse[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPopularCourses(
    limit = 6,
  ): Promise<CourseWithInstructorAndCategoryResponse[]> {
    return (await this.prisma.course.findMany({
      take: limit,
      orderBy: {
        enrollments: {
          _count: 'desc',
        },
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: true,
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
    })) as unknown as CourseWithInstructorAndCategoryResponse[];
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
  ): Promise<CourseWithInstructorAndCategoryResponse> {
    return (await this.prisma.course.update({
      where: { id },
      data: updateCourseDto,
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: true,
      },
    })) as CourseWithInstructorAndCategoryResponse;
  }

  async remove(id: string, currentUser: UserResponse): Promise<CourseResponse> {
    // Check if user is admin or the course owner
    if (currentUser.role !== 'ADMIN') {
      const course = await this.prisma.course.findUnique({
        where: { id },
        select: { instructorId: true },
      });

      if (!course || course.instructorId !== currentUser.id) {
        throw new ForbiddenException('You can only delete your own courses');
      }
    }

    return (await this.prisma.course.delete({
      where: { id },
    })) as CourseResponse;
  }

  async getCategories(): Promise<
    { id: string; name: string; courseCount: number }[]
  > {
    const categories = await this.prisma.courseCategory.findMany({
      include: {
        _count: {
          select: {
            courses: true,
          },
        },
      },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      courseCount: category._count.courses,
    }));
  }

  async createCategory(name: string): Promise<{ id: string; name: string }> {
    const category = await this.prisma.courseCategory.create({
      data: { name },
    });

    return {
      id: category.id,
      name: category.name,
    };
  }
}
