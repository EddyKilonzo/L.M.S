import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Param,
  Delete,
  Get,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { CloudinaryService, UploadResponse } from './cloudinary.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../../auth/dto';

export class UploadFileDto {
  folder?: string;
  resourceType?: 'image' | 'video' | 'raw';
}

@ApiTags('Cloudinary')
@Controller('cloudinary')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload/image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload an image file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
          example: 'lms/images',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
  ): Promise<UploadResponse> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.',
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        'File size too large. Maximum size is 10MB.',
      );
    }

    return this.cloudinaryService.uploadImage(
      file.buffer,
      uploadFileDto.folder || 'lms/images',
    );
  }

  @Post('upload/video')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a video file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
          example: 'lms/videos',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Video uploaded successfully' })
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
  ): Promise<UploadResponse> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedMimeTypes = [
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only MP4, AVI, MOV, WMV, FLV, and WebM are allowed.',
      );
    }

    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        'File size too large. Maximum size is 500MB.',
      );
    }

    return this.cloudinaryService.uploadVideo(
      file.buffer,
      uploadFileDto.folder || 'lms/videos',
    );
  }

  @Post('upload/pdf')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a PDF file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
          example: 'lms/documents',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'PDF uploaded successfully' })
  async uploadPDF(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
  ): Promise<UploadResponse> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException(
        'Invalid file type. Only PDF files are allowed.',
      );
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        'File size too large. Maximum size is 50MB.',
      );
    }

    return this.cloudinaryService.uploadPDF(
      file.buffer,
      uploadFileDto.folder || 'lms/documents',
    );
  }

  @Delete(':publicId')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Delete a file from Cloudinary' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(
    @Param('publicId') publicId: string,
    @Query('resourceType') resourceType: 'image' | 'video' | 'raw' = 'image',
  ): Promise<{ message: string }> {
    await this.cloudinaryService.deleteFile(publicId, resourceType);
    return { message: 'File deleted successfully' };
  }

  @Get('signature')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({
    summary: 'Generate upload signature for client-side uploads',
  })
  @ApiResponse({ status: 200, description: 'Upload signature generated' })
  async getUploadSignature(
    @Query('folder') folder: string = 'lms',
    @Query('resourceType') resourceType: 'image' | 'video' | 'raw' = 'image',
  ) {
    return this.cloudinaryService.generateUploadSignature(folder, resourceType);
  }

  @Get('info/:publicId')
  @ApiOperation({ summary: 'Get file information from Cloudinary' })
  @ApiResponse({ status: 200, description: 'File information retrieved' })
  async getFileInfo(
    @Param('publicId') publicId: string,
    @Query('resourceType') resourceType: 'image' | 'video' | 'raw' = 'image',
  ) {
    return this.cloudinaryService.getFileInfo(publicId, resourceType);
  }

  @Post('thumbnail/:videoPublicId')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Create a video thumbnail' })
  @ApiResponse({
    status: 201,
    description: 'Video thumbnail created successfully',
  })
  async createVideoThumbnail(
    @Param('videoPublicId') videoPublicId: string,
    @Body('time') time: string = '00:00:01',
  ): Promise<UploadResponse> {
    return this.cloudinaryService.createVideoThumbnail(videoPublicId, time);
  }
}
