import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: 'User first name' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ description: 'User last name' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ description: 'About the user' })
  @IsString()
  @IsOptional()
  about?: string;

  @ApiProperty({ description: 'Profile completion percentage' })
  @IsNumber()
  @IsOptional()
  profileProgress?: number;

  @ApiProperty({ description: 'Profile image URL' })
  @IsString()
  @IsOptional()
  profileImage?: string;
}
