import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';
import {
  StorageUploadInput,
  StorageUploadResult,
  StorageViewInput,
  StorageViewResult,
} from './storage.interface';

@Injectable()
export class StorageService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(LocalStorageService)
    private readonly localStorageService: LocalStorageService,
    private readonly s3StorageService: S3StorageService,
  ) {}

  upload(input: StorageUploadInput): StorageUploadResult {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'production');
    const environment = nodeEnv.toLowerCase();

    if (environment === 'local' || environment === 'development') {
      return this.localStorageService.upload(input);
    }

    return this.s3StorageService.upload(input);
  }

  view(input: StorageViewInput): StorageViewResult {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'production');
    const environment = nodeEnv.toLowerCase();

    if (environment === 'local' || environment === 'development') {
      return this.localStorageService.view(input);
    }

    return this.s3StorageService.view(input);
  }
}
