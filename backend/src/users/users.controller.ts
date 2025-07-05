import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Delete,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto';
import { UserResponse } from '../common/types';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('instructors')
  @ApiOperation({ summary: 'Get all instructors (Public)' })
  @ApiResponse({
    status: 200,
    description: 'List of all instructors with their courses count',
  })
  async findInstructors(): Promise<(UserResponse & { courseCount: number })[]> {
    return await this.usersService.findInstructors();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @Roles('ADMIN')
  async findAll(): Promise<UserResponse[]> {
    return await this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID (Admin, Instructor, or own profile)',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @Roles('ADMIN', 'INSTRUCTOR', 'STUDENT')
  async findOne(@Param('id') id: string): Promise<UserResponse> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update user (Admin or own profile)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access or own profile required',
  })
  @Roles('ADMIN', 'INSTRUCTOR', 'STUDENT')
  async update(
    @Param('id') id: string,
    @Body() updateData: UpdateUserDto,
    @CurrentUser() currentUser: UserResponse,
  ): Promise<UserResponse> {
    console.log('Update request - ID:', id);
    console.log('Current user:', currentUser);
    console.log('Update data:', updateData);

    try {
      const result = await this.usersService.update(
        id,
        updateData,
        currentUser,
      );
      return result;
    } catch (error: unknown) {
      interface PrismaError extends Error {
        code: string;
      }

      const isPrismaError = (err: unknown): err is PrismaError => {
        return err instanceof Error && 'code' in err;
      };

      const errorDetails = {
        userId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: isPrismaError(error) ? error.code : undefined,
      };

      console.error('Update failed:', errorDetails);

      if (isPrismaError(error) && error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }

      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user (Admin or own profile)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access or own profile required',
  })
  @Roles('ADMIN', 'INSTRUCTOR', 'STUDENT')
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserResponse,
  ): Promise<UserResponse> {
    return await this.usersService.remove(id, currentUser);
  }
}
