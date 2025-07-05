# Cloudinary Integration

This module provides file upload functionality for images, videos, and PDFs using Cloudinary.

## Setup

1. **Install Dependencies**
   ```bash
   npm install cloudinary
   ```

2. **Environment Variables**
   Add the following to your `.env` file:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLOUDINARY_WEBHOOK_URL=your_webhook_url (optional)
   ```

3. **Get Cloudinary Credentials**
   - Sign up at [Cloudinary](https://cloudinary.com/)
   - Go to Dashboard → Account Details
   - Copy your Cloud Name, API Key, and API Secret

## Features

### File Upload
- **Images**: JPEG, PNG, GIF, WebP (max 10MB)
- **Videos**: MP4, AVI, MOV, WMV, FLV, WebM (max 500MB)
- **PDFs**: PDF files (max 50MB)

### Automatic Optimization
- Images are automatically optimized for web delivery
- Videos are transcoded for better compatibility
- Quality is set to 'auto:good' for optimal file size

### Folder Organization
- Images: `lms/images/`
- Videos: `lms/videos/`
- Documents: `lms/documents/`
- Custom folders can be specified

## API Endpoints

### Upload Files
- `POST /api/cloudinary/upload/image` - Upload images
- `POST /api/cloudinary/upload/video` - Upload videos
- `POST /api/cloudinary/upload/pdf` - Upload PDFs

### File Management
- `GET /api/cloudinary/signature` - Get upload signature for client-side uploads
- `GET /api/cloudinary/info/:publicId` - Get file information
- `DELETE /api/cloudinary/:publicId` - Delete file
- `POST /api/cloudinary/thumbnail/:videoPublicId` - Create video thumbnail

## Usage Examples

### Upload Image
```typescript
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class YourService {
  constructor(private cloudinaryService: CloudinaryService) {}

  async uploadCourseImage(fileBuffer: Buffer) {
    return this.cloudinaryService.uploadImage(
      fileBuffer,
      'lms/courses',
      { public_id: 'course-thumbnail' }
    );
  }
}
```

### Upload Video
```typescript
async uploadLessonVideo(fileBuffer: Buffer) {
  return this.cloudinaryService.uploadVideo(
    fileBuffer,
    'lms/lessons',
    { 
      public_id: 'lesson-video',
      eager: [
        { width: 1280, height: 720, crop: 'scale' }
      ]
    }
  );
}
```

### Upload PDF
```typescript
async uploadDocument(fileBuffer: Buffer) {
  return this.cloudinaryService.uploadPDF(
    fileBuffer,
    'lms/documents'
  );
}
```

## Response Format

All upload endpoints return:
```typescript
{
  public_id: string;
  url: string;
  secure_url: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number; // for videos
  pages?: number; // for PDFs
}
```

## Security

- All endpoints require authentication
- Only instructors and admins can upload files
- File type validation is enforced
- File size limits are applied
- Files are organized in folders for better management

## Testing

Use the provided REST client file `cloudinary.http` to test the endpoints:

1. Update the variables in the file
2. Login to get an auth token
3. Test upload endpoints with sample files
4. Verify file information and deletion

## Error Handling

The service includes comprehensive error handling for:
- Invalid file types
- File size limits
- Upload failures
- Network issues
- Cloudinary API errors 