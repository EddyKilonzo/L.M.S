import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

export interface UploadResponse {
  public_id: string;
  url: string;
  secure_url: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
  pages?: number;
}

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Upload a file to Cloudinary
   * @param file - The file buffer or stream
   * @param folder - The folder to upload to (e.g., 'courses', 'profiles')
   * @param resourceType - The type of resource ('image', 'video', 'raw' for PDFs)
   * @param options - Additional upload options
   */
  async uploadFile(
    file: Buffer | Readable,
    folder: string = 'lms',
    resourceType: 'image' | 'video' | 'raw' = 'image',
    options: any = {},
  ): Promise<UploadResponse> {
    try {
      const uploadOptions = {
        folder,
        resource_type: resourceType,
        ...options,
      };

      // If it's a buffer, convert to stream
      const stream = Buffer.isBuffer(file)
        ? new Readable({
            read() {
              this.push(file);
              this.push(null);
            },
          })
        : file;

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result as UploadResponse);
            }
          },
        );

        stream.pipe(uploadStream);
      });
    } catch (error) {
      throw new Error(`Failed to upload file to Cloudinary: ${error.message}`);
    }
  }

  /**
   * Upload an image file
   */
  async uploadImage(
    file: Buffer | Readable,
    folder: string = 'lms/images',
    options: any = {},
  ): Promise<UploadResponse> {
    return this.uploadFile(file, folder, 'image', {
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
      ...options,
    });
  }

  /**
   * Upload a video file
   */
  async uploadVideo(
    file: Buffer | Readable,
    folder: string = 'lms/videos',
    options: any = {},
  ): Promise<UploadResponse> {
    return this.uploadFile(file, folder, 'video', {
      allowed_formats: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
      resource_type: 'video',
      transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }],
      ...options,
    });
  }

  /**
   * Upload a PDF file
   */
  async uploadPDF(
    file: Buffer | Readable,
    folder: string = 'lms/documents',
    options: any = {},
  ): Promise<UploadResponse> {
    return this.uploadFile(file, folder, 'raw', {
      allowed_formats: ['pdf'],
      resource_type: 'raw',
      ...options,
    });
  }

  /**
   * Delete a file from Cloudinary
   */
  async deleteFile(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'image',
  ): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
    } catch (error) {
      throw new Error(
        `Failed to delete file from Cloudinary: ${error.message}`,
      );
    }
  }

  /**
   * Get file information from Cloudinary
   */
  async getFileInfo(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'image',
  ): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType,
      });
      return result;
    } catch (error) {
      throw new Error(
        `Failed to get file info from Cloudinary: ${error.message}`,
      );
    }
  }

  /**
   * Generate a signed upload URL for client-side uploads
   */
  generateUploadSignature(
    folder: string = 'lms',
    resourceType: 'image' | 'video' | 'raw' = 'image',
    timestamp: number = Math.round(new Date().getTime() / 1000),
  ): {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
  } {
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    if (!apiSecret || !apiKey || !cloudName) {
      throw new Error(
        'Cloudinary environment variables are not properly configured',
      );
    }

    const params = {
      folder,
      resource_type: resourceType,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(params, apiSecret);

    return {
      signature,
      timestamp,
      apiKey,
      cloudName,
    };
  }

  /**
   * Create a video thumbnail
   */
  async createVideoThumbnail(
    videoPublicId: string,
    time: string = '00:00:01',
  ): Promise<UploadResponse> {
    try {
      const result = await cloudinary.uploader.explicit(videoPublicId, {
        type: 'upload',
        resource_type: 'video',
        eager: [
          {
            width: 300,
            height: 200,
            crop: 'scale',
            format: 'jpg',
            quality: 'auto:good',
          },
        ],
        eager_async: true,
        eager_notification_url: process.env.CLOUDINARY_WEBHOOK_URL,
      });

      return result as UploadResponse;
    } catch (error) {
      throw new Error(`Failed to create video thumbnail: ${error.message}`);
    }
  }

  /**
   * Optimize file for web delivery
   */
  getOptimizedUrl(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'image',
    options: any = {},
  ): string {
    const defaultOptions = {
      quality: 'auto:good',
      fetch_format: 'auto',
      ...options,
    };

    return cloudinary.url(publicId, {
      resource_type: resourceType,
      ...defaultOptions,
    });
  }
}
