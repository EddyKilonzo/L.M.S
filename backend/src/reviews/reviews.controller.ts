import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserResponse } from '../common/types';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 409,
    description: 'User already reviewed this course',
  })
  @Roles('STUDENT')
  async createReview(
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() user: UserResponse,
  ) {
    return await this.reviewsService.createReview(createReviewDto, user.id);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get all reviews for a course' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  async getCourseReviews(@Param('courseId') courseId: string) {
    return await this.reviewsService.getCourseReviews(courseId);
  }

  @Get('my-reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user reviews' })
  @ApiResponse({
    status: 200,
    description: 'User reviews retrieved successfully',
  })
  @Roles('STUDENT')
  async getMyReviews(@CurrentUser() user: UserResponse) {
    return await this.reviewsService.getUserReviews(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific review' })
  @ApiResponse({ status: 200, description: 'Review retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async getReview(@Param('id') id: string) {
    return await this.reviewsService.getReview(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a review' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only edit own reviews',
  })
  @Roles('STUDENT')
  async updateReview(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @CurrentUser() user: UserResponse,
  ) {
    return await this.reviewsService.updateReview(id, updateReviewDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only delete own reviews',
  })
  @Roles('STUDENT')
  async deleteReview(
    @Param('id') id: string,
    @CurrentUser() user: UserResponse,
  ) {
    return await this.reviewsService.deleteReview(id, user.id);
  }

  @Get('course/:courseId/average-rating')
  @ApiOperation({ summary: 'Get average rating for a course' })
  @ApiResponse({
    status: 200,
    description: 'Average rating retrieved successfully',
  })
  async getCourseAverageRating(@Param('courseId') courseId: string) {
    return await this.reviewsService.getCourseAverageRating(courseId);
  }
}
