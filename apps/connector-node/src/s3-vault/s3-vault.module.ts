import { Module } from '@nestjs/common';
import { S3VaultService } from './s3-vault.service.js';
import { S3VaultController } from './s3-vault.controller.js';

@Module({
    controllers: [S3VaultController],
    providers: [S3VaultService],
    exports: [S3VaultService],
})
export class S3VaultModule { }
