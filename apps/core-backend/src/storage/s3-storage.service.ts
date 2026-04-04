import { Injectable } from '@nestjs/common';
import {
  Storage,
  StorageUploadInput,
  StorageUploadResult,
  StorageViewInput,
  StorageViewResult,
} from './storage.interface';

@Injectable()
export class S3StorageService implements Storage {
  upload(input: StorageUploadInput): StorageUploadResult {
    const { file, customFileName } = input;

    return {
      message: 'S3 upload is not implemented yet (dummy success response)',
      fileName: customFileName?.trim() || file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  view(input: StorageViewInput): StorageViewResult {
    const svgBuffer = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="200"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="18" fill="#111827">S3 view is not implemented yet (dummy response)</text></svg>`,
    );

    return {
      fileName: input.fileName,
      mimeType: 'image/svg+xml',
      size: svgBuffer.length,
      buffer: svgBuffer,
    };
  }
}
