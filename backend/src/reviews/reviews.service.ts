import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto } from './dto';

export interface ReviewResponse {
  id: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  course: {
    id: string;
    title: string;
  };
}

export interface CourseReviewsResponse {
  reviews: ReviewResponse[];
  averageRating: number;
  totalReviews: number;
}

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(
    createReviewDto: CreateReviewDto,
    studentId: string,
  ): Promise<ReviewResponse> {
    // Check if user is enrolled in the course
    const enrollment = await this.prisma.courseEnrollment.findFirst({
      where: {
        studentId,
        courseId: createReviewDto.courseId,
      },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        'You must be enrolled in this course to review it',
      );
    }

    // Check if user already reviewed this course
    const existingReview = await this.prisma.courseReview.findFirst({
      where: {
        studentId,
        courseId: createReviewDto.courseId,
      },
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this course');
    }

    const review = await this.prisma.courseReview.create({
      data: {
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
        studentId,
        courseId: createReviewDto.courseId,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
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

    return review as ReviewResponse;
  }

  async getCourseReviews(courseId: string): Promise<CourseReviewsResponse> {
    const [reviews, averageRating, totalReviews] = await Promise.all([
      this.prisma.courseReview.findMany({
        where: { courseId },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.courseReview.aggregate({
        where: { courseId },
        _avg: { rating: true },
      }),
      this.prisma.courseReview.count({
        where: { courseId },
      }),
    ]);

    return {
      reviews: reviews as ReviewResponse[],
      averageRating: averageRating._avg.rating || 0,
      totalReviews,
    };
  }

  async getUserReviews(studentId: string): Promise<ReviewResponse[]> {
    const reviews = await this.prisma.courseReview.findMany({
      where: { studentId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews as ReviewResponse[];
  }

  async getReview(id: string): Promise<ReviewResponse> {
    const review = await this.prisma.courseReview.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
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

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review as ReviewResponse;
  }

  async updateReview(
    id: string,
    updateReviewDto: UpdateReviewDto,
    studentId: string,
  ): Promise<ReviewResponse> {
    const review = await this.prisma.courseReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.studentId !== studentId) {
      throw new ForbiddenException('You can only edit your own reviews');
    }

    const updatedReview = await this.prisma.courseReview.update({
      where: { id },
      data: {
        ...(updateReviewDto.rating !== undefined && {
          rating: updateReviewDto.rating,
        }),
        ...(updateReviewDto.comment !== undefined && {
          comment: updateReviewDto.comment,
        }),
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
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

    return updatedReview as ReviewResponse;
  }

  async deleteReview(id: string, studentId: string): Promise<void> {
    const review = await this.prisma.courseReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.studentId !== studentId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prisma.courseReview.delete({
      where: { id },
    });
  }

  async getCourseAverageRating(
    courseId: string,
  ): Promise<{ averageRating: number; totalReviews: number }> {
    const [averageRating, totalReviews] = await Promise.all([
      this.prisma.courseReview.aggregate({
        where: { courseId },
        _avg: { rating: true },
      }),
      this.prisma.courseReview.count({
        where: { courseId },
      }),
    ]);

    return {
      averageRating: averageRating._avg.rating || 0,
      totalReviews,
    };
  }
}
