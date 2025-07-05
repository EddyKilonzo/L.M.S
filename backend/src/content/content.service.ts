import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateModuleDto,
  CreateLessonDto,
  UpdateModuleDto,
  UpdateLessonDto,
} from './dto';
import {
  ModuleResponse,
  ModuleWithCourseResponse,
  LessonResponse,
  LessonWithModuleResponse,
  LessonWithCompletionsResponse,
} from '../common/types';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async createModule(
    moduleData: CreateModuleDto,
  ): Promise<ModuleWithCourseResponse> {
    const { lessons, ...moduleInfo } = moduleData;
    return (await this.prisma.courseModule.create({
      data: {
        ...moduleInfo,
        ...(lessons && {
          lessons: {
            create: lessons,
          },
        }),
      },
      include: {
        lessons: true,
        course: true,
      },
    })) as ModuleWithCourseResponse;
  }

  async createLesson(
    lessonData: CreateLessonDto,
  ): Promise<LessonWithModuleResponse> {
    return (await this.prisma.lesson.create({
      data: lessonData,
      include: {
        module: true,
      },
    })) as unknown as LessonWithModuleResponse;
  }

  async getCourseModules(courseId: string): Promise<ModuleResponse[]> {
    return (await this.prisma.courseModule.findMany({
      where: { courseId },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    })) as ModuleResponse[];
  }

  async getModule(id: string): Promise<ModuleWithCourseResponse | null> {
    return (await this.prisma.courseModule.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
        course: true,
      },
    })) as ModuleWithCourseResponse | null;
  }

  async getLesson(id: string): Promise<LessonWithCompletionsResponse | null> {
    return (await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        module: true,
        completedBy: {
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
      },
    })) as LessonWithCompletionsResponse | null;
  }

  async updateModule(
    id: string,
    updateData: UpdateModuleDto,
  ): Promise<ModuleResponse> {
    return (await this.prisma.courseModule.update({
      where: { id },
      data: updateData,
      include: {
        lessons: true,
      },
    })) as ModuleResponse;
  }

  async updateLesson(
    id: string,
    updateData: UpdateLessonDto,
  ): Promise<LessonWithModuleResponse> {
    return (await this.prisma.lesson.update({
      where: { id },
      data: updateData,
      include: {
        module: true,
      },
    })) as unknown as LessonWithModuleResponse;
  }

  async deleteModule(id: string): Promise<ModuleResponse> {
    return (await this.prisma.courseModule.delete({
      where: { id },
    })) as ModuleResponse;
  }

  async deleteLesson(id: string): Promise<LessonResponse> {
    return (await this.prisma.lesson.delete({
      where: { id },
    })) as LessonResponse;
  }
}
