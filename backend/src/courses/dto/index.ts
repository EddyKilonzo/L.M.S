import {
  IsString,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Difficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export class CreateCourseDto {
  @ApiProperty({
    description: 'Course title',
    example: 'Introduction to Web Development',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Course description',
    example:
      'Learn the fundamentals of web development including HTML, CSS, and JavaScript.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Learning objectives',
    example: [
      'Understand HTML structure',
      'Style pages with CSS',
      'Add interactivity with JavaScript',
    ],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  objectives: string[];

  @ApiProperty({
    description: 'Course prerequisites',
    example: [
      'Basic computer skills',
      'No prior programming experience required',
    ],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  prerequisites: string[];

  @ApiProperty({
    description: 'Category ID',
    example: 'clx1234567890abcdef',
  })
  @IsString()
  categoryId: string;

  @ApiProperty({
    description: 'Course difficulty level',
    enum: Difficulty,
    example: Difficulty.BEGINNER,
  })
  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @ApiProperty({
    description: 'Course price in KSH',
    example: 9999.99,
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Course image URL',
    example: 'https://example.com/course-image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: 'Course modules with lessons',
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        order: { type: 'number' },
        lessons: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              contentType: { type: 'string', enum: ['video', 'pdf', 'text'] },
              contentUrl: { type: 'string' },
              order: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @IsOptional()
  @IsArray()
  modules?: {
    title: string;
    description: string;
    order: number;
    lessons: {
      title: string;
      description: string;
      contentType: 'video' | 'pdf' | 'text';
      contentUrl?: string;
      order: number;
    }[];
  }[];
}

export class UpdateCourseDto {
  @ApiProperty({
    description: 'Course title',
    example: 'Introduction to Web Development',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Course description',
    example:
      'Learn the fundamentals of web development including HTML, CSS, and JavaScript.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Learning objectives',
    example: [
      'Understand HTML structure',
      'Style pages with CSS',
      'Add interactivity with JavaScript',
    ],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  objectives?: string[];

  @ApiProperty({
    description: 'Course prerequisites',
    example: [
      'Basic computer skills',
      'No prior programming experience required',
    ],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisites?: string[];

  @ApiProperty({
    description: 'Category ID',
    example: 'clx1234567890abcdef',
    required: false,
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    description: 'Course difficulty level',
    enum: Difficulty,
    required: false,
  })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiProperty({
    description: 'Course price in KSH',
    example: 9999.99,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({
    description: 'Course image URL',
    example: 'https://example.com/course-image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: 'Course modules with lessons',
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        order: { type: 'number' },
        lessons: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              contentType: { type: 'string', enum: ['video', 'pdf', 'text'] },
              contentUrl: { type: 'string' },
              order: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @IsOptional()
  @IsArray()
  modules?: {
    title: string;
    description: string;
    order: number;
    lessons: {
      title: string;
      description: string;
      contentType: 'video' | 'pdf' | 'text';
      contentUrl?: string;
      order: number;
    }[];
  }[];
}
