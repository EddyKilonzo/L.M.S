import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, SubmitQuizAttemptDto, RequestWithUser } from './dto';

@Controller('quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuizzesController {
  constructor(private quizzesService: QuizzesService) {}

  @Post()
  @Roles('ADMIN', 'INSTRUCTOR')
  async createQuiz(@Body() quizData: CreateQuizDto) {
    return await this.quizzesService.createQuiz(quizData);
  }

  @Get('course/:courseId')
  @Roles('ADMIN', 'INSTRUCTOR', 'STUDENT')
  async getQuizzesByCourse(@Param('courseId') courseId: string) {
    return await this.quizzesService.getQuizzesByCourse(courseId);
  }

  @Get(':id')
  @Roles('ADMIN', 'INSTRUCTOR', 'STUDENT')
  async getQuiz(@Param('id') id: string) {
    return await this.quizzesService.getQuiz(id);
  }

  @Post(':quizId/submit')
  @Roles('STUDENT')
  async submitQuiz(
    @Param('quizId') quizId: string,
    @Body() answers: SubmitQuizAttemptDto,
    @Request() req: RequestWithUser,
  ) {
    return await this.quizzesService.submitQuizAttempt(
      req.user.id,
      quizId,
      answers,
    );
  }

  @Get(':quizId/attempts')
  @Roles('STUDENT')
  async getAttempts(
    @Param('quizId') quizId: string,
    @Request() req: RequestWithUser,
  ) {
    return await this.quizzesService.getStudentAttempts(req.user.id, quizId);
  }
}
