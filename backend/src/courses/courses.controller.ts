import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from './dto';
import { UserResponse } from '../common/types';

interface RequestWithUser {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course (Admin/Instructor only)' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin/Instructor access required',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'INSTRUCTOR')
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @Request() req: RequestWithUser,
  ) {
    return await this.coursesService.create(createCourseDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Category ID filter',
  })
  @ApiQuery({
    name: 'difficulty',
    required: false,
    description: 'Difficulty level filter',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'Minimum price filter',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Maximum price filter',
  })
  @ApiResponse({ status: 200, description: 'List of courses' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('difficulty') difficulty?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const minPriceNum = minPrice ? parseFloat(minPrice) : undefined;
    const maxPriceNum = maxPrice ? parseFloat(maxPrice) : undefined;

    return await this.coursesService.findAll(
      pageNum,
      limitNum,
      search,
      categoryId,
      difficulty,
      minPriceNum,
      maxPriceNum,
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Search courses' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Search results' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'INSTRUCTOR', 'STUDENT')
  async searchCourses(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;

    return await this.coursesService.findAll(pageNum, limitNum, query);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular courses' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of courses to return',
  })
  @ApiResponse({ status: 200, description: 'Popular courses' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'INSTRUCTOR', 'STUDENT')
  async getPopularCourses(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 6;
    return await this.coursesService.getPopularCourses(limitNum);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all course categories' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  // Removed authentication guards to make categories public
  async getCategories() {
    return await this.coursesService.getCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create a new category (Admin/Instructor only)' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin/Instructor access required',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'INSTRUCTOR')
  async createCategory(@Body() createCategoryDto: { name: string }) {
    return await this.coursesService.createCategory(createCategoryDto.name);
  }

  @Get('instructor/:instructorId')
  @ApiOperation({ summary: 'Get courses by instructor' })
  @ApiParam({ name: 'instructorId', description: 'Instructor ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Instructor courses' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'INSTRUCTOR', 'STUDENT')
  async findByInstructor(
    @Param('instructorId') instructorId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    return await this.coursesService.findByInstructor(
      instructorId,
      pageNum,
      limitNum,
    );
  }

  @Get('my-courses')
  @ApiOperation({ summary: 'Get current instructor courses' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'My courses' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Instructor access required',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSTRUCTOR')
  async getMyCourses(
    @Request() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    return await this.coursesService.findByInstructor(
      req.user.id,
      pageNum,
      limitNum,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Course found' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(@Param('id') id: string) {
    return await this.coursesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update course (Admin/Instructor only)' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin/Instructor access required',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'INSTRUCTOR')
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() currentUser: UserResponse,
  ) {
    return await this.coursesService.update(id, updateCourseDto, currentUser);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete course (Admin or course owner)' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access or course ownership required',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'INSTRUCTOR')
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserResponse,
  ) {
    return await this.coursesService.remove(id, currentUser);
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'Get related courses' })
  @ApiParam({ name: 'id', description: 'Course ID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of related courses',
  })
  @ApiResponse({ status: 200, description: 'Related courses found' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findRelated(@Param('id') id: string, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 4;
    return await this.coursesService.findRelated(id, limitNum);
  }
}
