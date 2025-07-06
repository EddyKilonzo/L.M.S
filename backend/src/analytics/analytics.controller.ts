import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AnalyticsService } from './analytics.service';
import { UserResponse } from '../common/types';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({
    summary:
      'Get dashboard statistics (Admin: all courses, Instructor: own courses)',
  })
  @ApiResponse({ status: 200, description: 'Dashboard statistics' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin/Instructor access required',
  })
  @Roles('ADMIN', 'INSTRUCTOR')
  async getDashboardStats(@CurrentUser() user: UserResponse) {
    return await this.analyticsService.getDashboardStats(user);
  }

  @Get('users/roles')
  @ApiOperation({ summary: 'Get user statistics by role (Admin only)' })
  @ApiResponse({ status: 200, description: 'User role statistics' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @Roles('ADMIN')
  async getUserStatsByRole() {
    return await this.analyticsService.getUserStatsByRole();
  }

  @Get('courses/enrollment-stats')
  @ApiOperation({
    summary:
      'Get course enrollment statistics (Admin: all courses, Instructor: own courses)',
  })
  @ApiResponse({ status: 200, description: 'Course enrollment statistics' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin/Instructor access required',
  })
  @Roles('ADMIN', 'INSTRUCTOR')
  async getCourseEnrollmentStats(@CurrentUser() user: UserResponse) {
    return await this.analyticsService.getCourseEnrollmentStats(user);
  }

  @Get('instructor/:instructorId')
  @ApiOperation({
    summary:
      'Get instructor statistics (Admin: any instructor, Instructor: own stats)',
  })
  @ApiParam({ name: 'instructorId', description: 'Instructor ID' })
  @ApiResponse({ status: 200, description: 'Instructor statistics' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access or own instructor stats required',
  })
  @Roles('ADMIN', 'INSTRUCTOR')
  async getInstructorStats(
    @Param('instructorId') instructorId: string,
    @CurrentUser() user: UserResponse,
  ) {
    return await this.analyticsService.getInstructorStats(instructorId, user);
  }

  @Get('student/:studentId/progress')
  @ApiOperation({
    summary:
      'Get student progress (Admin: any student, Instructor: students in their courses, Student: own progress)',
  })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Student progress' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Insufficient permissions to view this student progress',
  })
  @Roles('ADMIN', 'INSTRUCTOR', 'STUDENT')
  async getStudentProgress(
    @Param('studentId') studentId: string,
    @CurrentUser() user: UserResponse,
  ) {
    return await this.analyticsService.getStudentProgress(studentId, user);
  }

  @Get('revenue-over-time')
  @ApiOperation({
    summary:
      'Get revenue data over time (Admin: all revenue, Instructor: own course revenue)',
  })
  @ApiResponse({ status: 200, description: 'Revenue data over time' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin/Instructor access required',
  })
  @Roles('ADMIN', 'INSTRUCTOR')
  async getRevenueOverTime(@CurrentUser() user: UserResponse) {
    return await this.analyticsService.getRevenueOverTime(user);
  }

  @Get('reviews-summary')
  @ApiOperation({
    summary:
      'Get reviews summary (Admin: all reviews, Instructor: reviews for their courses)',
  })
  @ApiResponse({ status: 200, description: 'Reviews summary' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin/Instructor access required',
  })
  @Roles('ADMIN', 'INSTRUCTOR')
  async getReviewsSummary(@CurrentUser() user: UserResponse) {
    return await this.analyticsService.getReviewsSummary(user);
  }
}
