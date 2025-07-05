import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async getCategories() {
    try {
      const categories = await this.prisma.courseCategory.findMany({
        orderBy: {
          name: 'asc',
        },
      });

      return {
        success: true,
        data: categories,
        message: 'Categories retrieved successfully',
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to retrieve categories',
      };
    }
  }
}
