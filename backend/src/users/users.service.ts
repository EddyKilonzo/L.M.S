import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto';
import { UserResponse } from '../common/types';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<UserResponse[]> {
    return (await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
      },
    })) as UserResponse[];
  }

  async findInstructors(): Promise<(UserResponse & { courseCount: number })[]> {
    const instructors = await this.prisma.user.findMany({
      where: {
        role: 'INSTRUCTOR',
        isVerified: true, // Only show verified instructors
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        about: true,
        profileImage: true,
        profileProgress: true,
        createdAt: true,
        _count: {
          select: {
            coursesTaught: true,
          },
        },
      },
      orderBy: {
        coursesTaught: {
          _count: 'desc',
        },
      },
      take: 6, // Show 6 instructors on landing page
    });

    return instructors.map((instructor) => ({
      ...instructor,
      courseCount: instructor._count.coursesTaught,
    }));
  }

  async findOne(id: string): Promise<UserResponse | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        about: true,
        profileProgress: true,
        profileImage: true,
      },
    });
    return user as UserResponse | null;
  }

  async update(
    id: string,
    updateData: UpdateUserDto,
    currentUser: UserResponse,
  ): Promise<UserResponse> {
    console.log('UsersService.update - ID:', id);
    console.log('UsersService.update - currentUser:', currentUser);
    console.log('UsersService.update - updateData:', updateData);

    // Check if currentUser exists
    if (!currentUser) {
      console.log('UsersService.update - currentUser is null/undefined');
      throw new ForbiddenException('User authentication required');
    }

    // Check if user is updating their own profile or is an admin
    console.log('UsersService.update - currentUser.role:', currentUser.role);
    console.log('UsersService.update - currentUser.id:', currentUser.id);
    console.log('UsersService.update - target id:', id);
    console.log(
      'UsersService.update - is admin?',
      currentUser.role === 'ADMIN',
    );
    console.log('UsersService.update - is own profile?', currentUser.id === id);

    if (currentUser.role !== 'ADMIN' && currentUser.id !== id) {
      console.log('UsersService.update - Permission denied');
      throw new ForbiddenException('You can only update your own profile');
    }

    console.log(
      'UsersService.update - Permission granted, proceeding with update',
    );
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isVerified: true,
          about: true,
          profileProgress: true,
          profileImage: true,
        },
      });
      return user as UserResponse;
    } catch (error: unknown) {
      // Graceful error handling
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new ForbiddenException('User not found');
      }
      throw new Error('Failed to update user profile. Please try again.');
    }
  }

  async remove(id: string, currentUser: UserResponse): Promise<UserResponse> {
    // Check if currentUser exists
    if (!currentUser) {
      throw new ForbiddenException('User authentication required');
    }

    // Check if user is deleting their own profile or is an admin
    if (currentUser.role !== 'ADMIN' && currentUser.id !== id) {
      throw new ForbiddenException('You can only delete your own profile');
    }

    const user = await this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
      },
    });
    return user as UserResponse;
  }
}
