import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ContentService } from './content.service';
import {
  CreateModuleDto,
  CreateLessonDto,
  UpdateModuleDto,
  UpdateLessonDto,
} from './dto';

@Controller('content')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContentController {
  constructor(private contentService: ContentService) {}

  @Post('modules')
  @Roles('ADMIN', 'INSTRUCTOR')
  async createModule(@Body() moduleData: CreateModuleDto) {
    return await this.contentService.createModule(moduleData);
  }

  @Post('lessons')
  @Roles('ADMIN', 'INSTRUCTOR')
  async createLesson(@Body() lessonData: CreateLessonDto) {
    return await this.contentService.createLesson(lessonData);
  }

  @Get('courses/:courseId/modules')
  @Roles('ADMIN', 'INSTRUCTOR', 'STUDENT')
  async getCourseModules(@Param('courseId') courseId: string) {
    return await this.contentService.getCourseModules(courseId);
  }

  @Get('modules/:id')
  @Roles('ADMIN', 'INSTRUCTOR', 'STUDENT')
  async getModule(@Param('id') id: string) {
    return await this.contentService.getModule(id);
  }

  @Get('lessons/:id')
  @Roles('ADMIN', 'INSTRUCTOR', 'STUDENT')
  async getLesson(@Param('id') id: string) {
    return await this.contentService.getLesson(id);
  }

  @Patch('modules/:id')
  @Roles('ADMIN', 'INSTRUCTOR')
  async updateModule(
    @Param('id') id: string,
    @Body() updateData: UpdateModuleDto,
  ) {
    return await this.contentService.updateModule(id, updateData);
  }

  @Patch('lessons/:id')
  @Roles('ADMIN', 'INSTRUCTOR')
  async updateLesson(
    @Param('id') id: string,
    @Body() updateData: UpdateLessonDto,
  ) {
    return await this.contentService.updateLesson(id, updateData);
  }

  @Delete('modules/:id')
  @Roles('ADMIN', 'INSTRUCTOR')
  async deleteModule(@Param('id') id: string) {
    return await this.contentService.deleteModule(id);
  }

  @Delete('lessons/:id')
  @Roles('ADMIN', 'INSTRUCTOR')
  async deleteLesson(@Param('id') id: string) {
    return await this.contentService.deleteLesson(id);
  }
}
