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
      },
    });
    return user as UserResponse | null;
  }

  async update(
    id: string,
    updateData: UpdateUserDto,
    currentUser: UserResponse,
  ): Promise<UserResponse> {
    // Check if user is updating their own profile or is an admin
    if (currentUser.role !== 'ADMIN' && currentUser.id !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }
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
        },
      });
      return user as UserResponse;
    } catch (error) {
      // Graceful error handling
      if (error.code === 'P2025') {
        throw new ForbiddenException('User not found');
      }
      throw new Error('Failed to update user profile. Please try again.');
    }
  }

  async remove(id: string, currentUser: UserResponse): Promise<UserResponse> {
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
