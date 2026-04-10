import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';
import {
  StorageUploadInput,
  StorageUploadResult,
  StorageViewInput,
  StorageViewResult,
  StorageDeleteInput,
} from './storage.interface';

@Injectable()
export class StorageService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(LocalStorageService)
    private readonly localStorageService: LocalStorageService,
    private readonly s3StorageService: S3StorageService,
  ) {}

  private isLocal(): boolean {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'production');
    const environment = nodeEnv.toLowerCase();
    return environment === 'local' || environment === 'development';
  }

  async upload(input: StorageUploadInput): Promise<StorageUploadResult> {
    if (this.isLocal()) {
      return this.localStorageService.upload(input);
    }
    return this.s3StorageService.upload(input);
  }

  async view(input: StorageViewInput): Promise<StorageViewResult> {
    if (this.isLocal()) {
      return this.localStorageService.view(input);
    }
    return this.s3StorageService.view(input);
  }

  async delete(input: StorageDeleteInput): Promise<void> {
    if (this.isLocal()) {
      return this.localStorageService.delete(input);
    }
    return this.s3StorageService.delete(input);
  }
}
