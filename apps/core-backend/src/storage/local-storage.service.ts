import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import {
  Storage,
  StorageFile,
  StorageUploadInput,
  StorageUploadResult,
  StorageViewInput,
  StorageViewResult,
} from './storage.interface';

@Injectable()
export class LocalStorageService implements Storage {
  constructor(private readonly configService: ConfigService) {}

  private getStorageRootPath(): string {
    const storagePathEnv = this.configService.get<string>(
      'STORAGE_PATH',
      'uploads',
    );
    const storagePathParts = storagePathEnv
      .split('/')
      .map((part) => part.trim())
      .filter(Boolean);

    return path.join(process.cwd(), 'storage', ...storagePathParts);
  }

  private getOrCreateStorageDirectory(nestedDirectories: string[]): string {
    const directoryPath = path.join(
      this.getStorageRootPath(),
      ...nestedDirectories,
    );

    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    return directoryPath;
  }

  private validateNestedDirectories(nestedDirectories: string[]): string[] {
    const sanitizedSegments = nestedDirectories
      .map((segment) => segment.trim())
      .filter(Boolean);

    if (sanitizedSegments.length === 0) {
      throw new BadRequestException('nestedDirectories is required');
    }

    const hasInvalidSegment = sanitizedSegments.some(
      (segment) =>
        segment === '.' ||
        segment === '..' ||
        segment.includes('\\') ||
        !/^[a-zA-Z0-9._-]+$/.test(segment),
    );

    if (hasInvalidSegment) {
      throw new BadRequestException(
        'nestedDirectories contains invalid segments',
      );
    }

    return sanitizedSegments;
  }

  private validateFileName(fileName: string): string {
    const normalizedFileName = fileName.trim();

    if (!normalizedFileName) {
      throw new BadRequestException('fileName is required');
    }

    const baseName = path.basename(normalizedFileName);

    if (
      baseName !== normalizedFileName ||
      baseName === '.' ||
      baseName === '..' ||
      baseName.includes('\\') ||
      !/^[a-zA-Z0-9._-]+$/.test(baseName)
    ) {
      throw new BadRequestException('fileName is invalid');
    }

    return baseName;
  }

  private buildFileName(file: StorageFile, customFileName: string): string {
    const normalizedCustomFileName = customFileName.trim();

    if (!normalizedCustomFileName) {
      throw new BadRequestException('customFileName is required');
    }

    const customBaseName = path.parse(normalizedCustomFileName).name;
    const sanitizedBaseName = customBaseName.replace(/[^a-zA-Z0-9._-]/g, '_');

    if (!sanitizedBaseName) {
      throw new BadRequestException('customFileName is invalid');
    }

    const extension = path.extname(file.originalname);
    return `${sanitizedBaseName}${extension}`;
  }

  upload(input: StorageUploadInput): StorageUploadResult {
    const { file, customFileName, nestedDirectories } = input;

    const validatedNestedDirectories =
      this.validateNestedDirectories(nestedDirectories);
    const directoryPath = this.getOrCreateStorageDirectory(
      validatedNestedDirectories,
    );
    const fileName = this.buildFileName(file, customFileName);

    const filePath = path.join(directoryPath, fileName);
    fs.writeFileSync(filePath, file.buffer);

    return {
      message: 'File received successfully',
      fileName,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  view(input: StorageViewInput): StorageViewResult {
    const { fileName, nestedDirectories } = input;

    const validatedNestedDirectories =
      this.validateNestedDirectories(nestedDirectories);
    const validatedFileName = this.validateFileName(fileName);
    const directoryPath = path.join(
      this.getStorageRootPath(),
      ...validatedNestedDirectories,
    );
    const filePath = path.join(directoryPath, validatedFileName);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const buffer = fs.readFileSync(filePath);
    const stats = fs.statSync(filePath);

    return {
      fileName: validatedFileName,
      mimeType: this.detectMimeType(validatedFileName),
      size: stats.size,
      buffer,
    };
  }

  private detectMimeType(fileName: string): string {
    const extension = path.extname(fileName).toLowerCase();

    switch (extension) {
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.gif':
        return 'image/gif';
      case '.webp':
        return 'image/webp';
      case '.pdf':
        return 'application/pdf';
      case '.txt':
        return 'text/plain';
      case '.html':
        return 'text/html';
      case '.json':
        return 'application/json';
      default:
        return 'application/octet-stream';
    }
  }
}
