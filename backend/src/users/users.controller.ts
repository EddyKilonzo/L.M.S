import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Delete,
  UseGuards,
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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto';
import { UserResponse } from '../common/types';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @Roles('ADMIN')
  async findAll() {
    return await this.usersService.findAll();
  }

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
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

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
  ) {
    return await this.usersService.update(id, updateData, currentUser);
  }

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
  ) {
    return await this.usersService.remove(id, currentUser);
  }
}
