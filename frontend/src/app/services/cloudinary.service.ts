import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CloudinaryUploadResponse {
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

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private baseUrl = '/api/cloudinary';

  constructor(private http: HttpClient) {}

  uploadFile(file: File, folder: string = 'lms/files'): Observable<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return this.http.post<CloudinaryUploadResponse>(`${this.baseUrl}/upload/file`, formData);
  }

  uploadImage(file: File, folder: string = 'lms/images'): Observable<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return this.http.post<CloudinaryUploadResponse>(`${this.baseUrl}/upload/image`, formData);
  }

  uploadVideo(file: File, folder: string = 'lms/videos'): Observable<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return this.http.post<CloudinaryUploadResponse>(`${this.baseUrl}/upload/video`, formData);
  }

  uploadPDF(file: File, folder: string = 'lms/documents'): Observable<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return this.http.post<CloudinaryUploadResponse>(`${this.baseUrl}/upload/pdf`, formData);
  }
} 