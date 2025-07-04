import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto, SubmitQuizAttemptDto } from './dto';
import {
  QuizWithCourseResponse,
  QuizWithAttemptsResponse,
  QuizAttemptResponse,
  QuizAttemptWithQuizResponse,
} from '../common/types';

@Injectable()
export class QuizzesService {
  constructor(private prisma: PrismaService) {}

  async createQuiz(quizData: CreateQuizDto): Promise<QuizWithCourseResponse> {
    const { questions, ...quizInfo } = quizData;
    return (await this.prisma.quiz.create({
      data: {
        ...quizInfo,
        questions: {
          create: questions,
        },
      },
      include: {
        questions: true,
        course: true,
      },
    })) as QuizWithCourseResponse;
  }

  async getQuizzesByCourse(
    courseId: string,
  ): Promise<QuizWithAttemptsResponse[]> {
    return (await this.prisma.quiz.findMany({
      where: { courseId },
      include: {
        questions: true,
        _count: {
          select: {
            attempts: true,
          },
        },
      },
    })) as QuizWithAttemptsResponse[];
  }

  async getQuiz(id: string): Promise<QuizWithCourseResponse | null> {
    return (await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: true,
        course: true,
      },
    })) as QuizWithCourseResponse | null;
  }

  async submitQuizAttempt(
    studentId: string,
    quizId: string,
    answers: SubmitQuizAttemptDto,
  ): Promise<QuizAttemptResponse> {
    return await this.prisma.quizAttempt.create({
      data: {
        studentId,
        quizId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        answers: answers.answers as unknown as any,
        isCompleted: true,
        submittedAt: new Date(),
      },
    });
  }

  async getStudentAttempts(
    studentId: string,
    quizId: string,
  ): Promise<QuizAttemptWithQuizResponse[]> {
    return (await this.prisma.quizAttempt.findMany({
      where: {
        studentId,
        quizId,
      },
      include: {
        quiz: true,
      },
    })) as QuizAttemptWithQuizResponse[];
  }
}
