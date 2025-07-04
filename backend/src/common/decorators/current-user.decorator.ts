import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserResponse } from '../types';

interface RequestWithUser {
  user: UserResponse;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserResponse => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
