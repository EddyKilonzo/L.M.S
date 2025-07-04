import { IsNumber, Min, Max } from 'class-validator';

export class UpdateProgressDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;
}

export interface JwtPayload {
  email: string;
  sub: string;
  role: string;
}

export interface RequestWithUser {
  user: {
    id: string;
    email: string;
    role: string;
  };
}
