import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
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
import { EnrollmentsService } from './enrollments.service';
import { RequestWithUser } from './dto';

@ApiTags('enrollments')
@ApiBearerAuth()
@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(private enrollmentsService: EnrollmentsService) {}

  @Post('enroll/:courseId')
  @ApiOperation({ summary: 'Enroll in a course (Student only)' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({ status: 201, description: 'Enrolled successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student access required',
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @Roles('STUDENT')
  async enroll(
    @Param('courseId') courseId: string,
    @Request() req: RequestWithUser,
  ) {
    return await this.enrollmentsService.enroll(req.user.id, courseId);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get student enrollments' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Student enrollments' })
  @Roles('ADMIN', 'INSTRUCTOR', 'STUDENT')
  async getStudentEnrollments(@Param('studentId') studentId: string) {
    return await this.enrollmentsService.getStudentEnrollments(studentId);
  }

  @Get('my-enrollments')
  @ApiOperation({ summary: 'Get current student enrollments' })
  @ApiResponse({ status: 200, description: 'My enrollments' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student access required',
  })
  @Roles('STUDENT')
  async getMyEnrollments(@Request() req: RequestWithUser) {
    return await this.enrollmentsService.getStudentEnrollments(req.user.id);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get course enrollments (Admin/Instructor only)' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Course enrollments' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin/Instructor access required',
  })
  @Roles('ADMIN', 'INSTRUCTOR')
  async getCourseEnrollments(@Param('courseId') courseId: string) {
    return await this.enrollmentsService.getCourseEnrollments(courseId);
  }

  @Get('course/:courseId/stats')
  @ApiOperation({
    summary: 'Get course enrollment statistics (Admin/Instructor only)',
  })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Enrollment statistics' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin/Instructor access required',
  })
  @Roles('ADMIN', 'INSTRUCTOR')
  async getCourseEnrollmentStats(@Param('courseId') courseId: string) {
    return await this.enrollmentsService.getEnrollmentStats(courseId);
  }

  @Get('progress/:courseId')
  @ApiOperation({ summary: 'Get student progress in course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Student progress' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student access required',
  })
  @Roles('STUDENT')
  async getStudentProgress(
    @Param('courseId') courseId: string,
    @Request() req: RequestWithUser,
  ) {
    return await this.enrollmentsService.getStudentProgress(
      req.user.id,
      courseId,
    );
  }

  @Patch(':enrollmentId/progress')
  @ApiOperation({ summary: 'Update enrollment progress (Student only)' })
  @ApiParam({ name: 'enrollmentId', description: 'Enrollment ID' })
  @ApiResponse({ status: 200, description: 'Progress updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student access required',
  })
  @Roles('STUDENT')
  async updateProgress(
    @Param('enrollmentId') enrollmentId: string,
    @Body('progress') progress: number,
  ) {
    return await this.enrollmentsService.updateProgress(enrollmentId, progress);
  }

  @Post('lesson/:lessonId/complete')
  @ApiOperation({ summary: 'Mark lesson as complete (Student only)' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiResponse({ status: 201, description: 'Lesson marked as complete' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Student access required',
  })
  @Roles('STUDENT')
  async markLessonComplete(
    @Param('lessonId') lessonId: string,
    @Request() req: RequestWithUser,
  ) {
    return await this.enrollmentsService.markLessonComplete(
      req.user.id,
      lessonId,
    );
  }
}
