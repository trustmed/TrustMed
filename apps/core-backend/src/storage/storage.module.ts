import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';

@Module({
  controllers: [StorageController],
  providers: [StorageService, LocalStorageService, S3StorageService],
})
export class StorageModule {}
