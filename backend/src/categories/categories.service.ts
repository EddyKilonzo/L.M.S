import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoriesService {
  getCategories() {
    return [
      'Design',
      'Development',
      'Business',
      'IT & Software',
      'Marketing',
      'Lifestyle',
      'Photography',
      'Music',
      'Health & Fitness',
      'Personal Development',
    ];
  }
}
