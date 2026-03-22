import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecord } from '../entities/medical-record.entity';
import { AuthUser } from '../entities/auth-user.entity';
import { S3VaultService } from './s3-vault.service';
import { S3VaultController } from './s3-vault.controller';
import { CryptoService } from './crypto.service';
import { Person } from '../entities/person.entity';

@Module({
    imports: [TypeOrmModule.forFeature([MedicalRecord, AuthUser, Person])],
    controllers: [S3VaultController],
    providers: [S3VaultService, CryptoService],
    exports: [S3VaultService, CryptoService],
})
export class S3VaultModule { }
