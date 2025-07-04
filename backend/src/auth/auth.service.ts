import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

import {
  RegisterUserDto,
  LoginUserDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';
import { UserResponse, UserWithTokenResponse } from '../common/types';
import { MailerService } from '../mailer/mailer.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async register(registerDto: RegisterUserDto): Promise<UserResponse> {
    try {
      console.log('Starting registration for:', registerDto.email);

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const emailVerificationToken = randomBytes(32).toString('hex');
      const verificationCode = Math.floor(
        10000 + Math.random() * 90000,
      ).toString();
      const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      console.log('Creating user in database...');
      const user = await this.prisma.user.create({
        data: {
          ...registerDto,
          password: hashedPassword,
          emailVerificationToken,
          verificationCode,
          verificationCodeExpiry,
        },
      });

      console.log('User created successfully, sending verification email...');
      // Send verification code email
      try {
        await this.mailerService.sendNumberVerificationEmail(
          user.email,
          verificationCode,
          user.firstName,
        );
        console.log('Verification email sent successfully');
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't fail the registration if email fails, just log it
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    } catch (error: unknown) {
      console.error('Registration error:', error);

      // Handle Prisma unique constraint error for email
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        'meta' in error &&
        error.code === 'P2002' &&
        Array.isArray((error.meta as { target?: string[] })?.target) &&
        (error.meta as { target?: string[] }).target?.includes('email')
      ) {
        throw new ConflictException(
          'An account with this email already exists',
        );
      }

      // Re-throw other errors
      throw error;
    }
  }

  async login(loginDto: LoginUserDto): Promise<UserWithTokenResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (user && (await bcrypt.compare(loginDto.password, user.password))) {
      const payload = { email: user.email, sub: user.id, role: user.role };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isVerified: user.isVerified,
        },
      };
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        emailVerificationToken: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return {
        message:
          'If an account with that email exists, a password reset link has been sent',
      };
    }

    const resetToken = randomBytes(32).toString('hex');

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
      },
    });

    await this.mailerService.sendPasswordResetEmail(
      user.email,
      resetToken,
      user.firstName,
    );

    return {
      message:
        'If an account with that email exists, a password reset link has been sent',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: { resetPasswordToken: resetPasswordDto.token },
    });

    if (!user) {
      throw new BadRequestException('Invalid reset token');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
      },
    });

    return { message: 'Password reset successfully' };
  }

  async validateUser(payload: {
    sub: string;
    email: string;
    role: string;
  }): Promise<UserResponse | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isVerified: user.isVerified,
    };
  }

  async verifyCode(email: string, code: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.verificationCode || !user.verificationCodeExpiry) {
      throw new BadRequestException('Invalid or expired code');
    }
    if (user.verificationCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }
    if (user.verificationCodeExpiry < new Date()) {
      throw new BadRequestException('Verification code expired');
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationCodeExpiry: null,
      },
    });
    return { message: 'Account verified successfully' };
  }
}
