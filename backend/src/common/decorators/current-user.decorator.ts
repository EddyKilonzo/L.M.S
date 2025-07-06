import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserResponse } from '../types';

interface RequestWithUser {
  user: UserResponse;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserResponse => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    console.log(
      'CurrentUser decorator - request object keys:',
      Object.keys(request),
    );
    console.log('CurrentUser decorator - request.user:', request.user);
    return request.user;
  },
);
