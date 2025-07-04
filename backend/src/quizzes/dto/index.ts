import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum QuestionType {
  MCQ = 'MCQ',
  TEXT = 'TEXT',
}

export class QuizQuestionDto {
  @IsString()
  text: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsArray()
  @IsString({ each: true })
  options: string[];

  @IsString()
  correctAnswer: string;
}

export class CreateQuizDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  courseId: string;

  @IsOptional()
  @IsNumber()
  timeLimit?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions: QuizQuestionDto[];
}

export class CreateQuizWithQuestionsDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  courseId: string;

  @IsOptional()
  @IsNumber()
  timeLimit?: number;

  questions: {
    create: QuizQuestionDto[];
  };
}

export class UpdateQuizDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  timeLimit?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions?: QuizQuestionDto[];
}

export class QuizAnswerDto {
  @IsString()
  questionId: string;

  @IsString()
  answer: string;
}

export interface QuizAnswers {
  [questionId: string]: string;
}

export class SubmitQuizAttemptDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerDto)
  answers: QuizAnswerDto[];
}

export interface JwtPayload {
  email: string;
  sub: string;
  role: string;
}

export interface RequestWithUser {
  user: {
    id: string;
    email: string;
    role: string;
  };
}
