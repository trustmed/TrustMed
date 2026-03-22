import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { STORAGE_PROVIDER } from './storage.interface';
import { S3Provider } from './s3.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: STORAGE_PROVIDER,
      useClass: S3Provider,
    },
  ],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
