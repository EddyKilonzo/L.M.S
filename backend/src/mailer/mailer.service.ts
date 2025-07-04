import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface EmailTemplateData {
  [key: string]: string | number | boolean;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly templatesDir = join(
    process.cwd(),
    'src',
    'mailer',
    'templates',
  );
  private transporter: nodemailer.Transporter;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Email configuration - you can use Gmail, Outlook, or any SMTP service
    const emailConfig = {
      host: process.env.MAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT || process.env.SMTP_PORT || '587'),
      secure: process.env.MAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user:
          process.env.MAIL_USER ||
          process.env.SMTP_USER ||
          'your-email@gmail.com',
        pass:
          process.env.MAIL_PASSWORD ||
          process.env.SMTP_PASS ||
          'your-app-password',
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);

    // Verify connection configuration (completely silent)
    this.transporter.verify(() => {
      // Silent verification - no logging
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from:
          process.env.MAIL_FROM ||
          `"E-Learning Platform" <${process.env.MAIL_USER || process.env.SMTP_USER || 'noreply@example.com'}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      };

      const info = await this.transporter.sendMail(mailOptions);

      this.logger.log(`📧 Email sent successfully to ${options.to}`);
      this.logger.log(`📧 Message ID: ${info.messageId}`);

      // For development: Show verification code in console
      if (options.subject.includes('Verification Code')) {
        const codeMatch = options.html.match(/(\d{5})/);
        if (codeMatch) {
          this.logger.log(`🔐 VERIFICATION CODE: ${codeMatch[1]}`);
          console.log(
            `\n🔐 VERIFICATION CODE FOR ${options.to}: ${codeMatch[1]}\n`,
          );
        } else {
          console.log(
            '⚠️ Could not extract verification code from email content',
          );
          console.log('Email content:', options.html);
        }
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);

      // Fallback to console logging if email fails
      if (options.subject.includes('Verification Code')) {
        const codeMatch = options.html.match(/(\d{5})/);
        if (codeMatch) {
          console.log(
            `\n🔐 VERIFICATION CODE FOR ${options.to}: ${codeMatch[1]}\n`,
          );
          console.log(
            "📧 Email sending failed, but here's the verification code for testing",
          );
        }
      }

      return false;
    }
  }

  private loadTemplate(templateName: string): string {
    try {
      const templatePath = join(this.templatesDir, `${templateName}.ejs`);
      console.log('Template directory:', this.templatesDir);
      console.log('Template path:', templatePath);
      console.log('Current working directory:', process.cwd());
      return readFileSync(templatePath, 'utf-8');
    } catch (error) {
      console.error(`Failed to load template ${templateName}:`, error);
      this.logger.error(`Failed to load template ${templateName}:`, error);
      throw new Error(`Template ${templateName} not found`);
    }
  }

  private replacePlaceholders(
    template: string,
    data: EmailTemplateData,
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
    return result;
  }

  async sendVerificationEmail(
    email: string,
    token: string,
    firstName: string,
  ): Promise<boolean> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/verify-email?token=${token}`;

    const template = this.loadTemplate('email-verification');
    const html = this.replacePlaceholders(template, {
      firstName,
      verificationUrl,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
    });

    return await this.sendEmail({
      to: email,
      subject: 'Welcome! Please verify your email address',
      html,
    });
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    firstName: string,
  ): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/reset-password?token=${token}`;

    const template = this.loadTemplate('password-reset');
    const html = this.replacePlaceholders(template, {
      firstName,
      resetUrl,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
    });

    return await this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html,
    });
  }

  async sendCourseEnrollmentEmail(
    email: string,
    firstName: string,
    courseTitle: string,
    courseUrl: string,
  ): Promise<boolean> {
    const template = this.loadTemplate('course-enrollment');
    const html = this.replacePlaceholders(template, {
      firstName,
      courseTitle,
      courseUrl,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
    });

    return await this.sendEmail({
      to: email,
      subject: `Welcome to ${courseTitle}!`,
      html,
    });
  }

  async sendCourseCompletionEmail(
    email: string,
    firstName: string,
    courseTitle: string,
    certificateUrl: string,
  ): Promise<boolean> {
    const template = this.loadTemplate('course-completion');
    const html = this.replacePlaceholders(template, {
      firstName,
      courseTitle,
      certificateUrl,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
    });

    return await this.sendEmail({
      to: email,
      subject: `Congratulations! You've completed ${courseTitle}`,
      html,
    });
  }

  async sendNumberVerificationEmail(
    email: string,
    code: string,
    firstName: string,
  ): Promise<boolean> {
    const template = this.loadTemplate('number-verification');
    const html = this.replacePlaceholders(template, {
      firstName,
      verificationCode: code,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
    });
    return await this.sendEmail({
      to: email,
      subject: 'Your Verification Code',
      html,
    });
  }

  async sendWelcomeInstructorEmail(
    email: string,
    firstName: string,
  ): Promise<boolean> {
    const template = this.loadTemplate('welcome-instructor');
    const html = this.replacePlaceholders(template, {
      firstName,
      dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/dashboard`,
      helpUrl: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/help/instructor`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
    });
    return await this.sendEmail({
      to: email,
      subject: '🎓 Welcome to Our Teaching Platform!',
      html,
    });
  }

  async sendWelcomeStudentEmail(
    email: string,
    firstName: string,
  ): Promise<boolean> {
    const template = this.loadTemplate('welcome-student');
    const html = this.replacePlaceholders(template, {
      firstName,
      coursesUrl: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/courses`,
      helpUrl: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/help/student`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
    });
    return await this.sendEmail({
      to: email,
      subject: '🎓 Welcome to Our Learning Platform!',
      html,
    });
  }
}
