import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

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

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
      // Simulate async email sending
      await new Promise((resolve) => setTimeout(resolve, 100));

      this.logger.log(`📧 Email sent to ${options.to}: ${options.subject}`);
      this.logger.debug(`Email content: ${options.html}`);

      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  private loadTemplate(templateName: string): string {
    try {
      const templatePath = join(this.templatesDir, `${templateName}.html`);
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
}
