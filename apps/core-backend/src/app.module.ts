import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { dataSourceOptions } from './config/database.config';
import { ProfileModule } from './profile/profile.module';
import { AuthModule } from './auth/auth.module';
import { JwtCookieGuard } from './auth/jwt-cookie.guard';
import { S3VaultModule } from './s3-vault/s3-vault.module';
import { AuditModule } from './audit/audit.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { AccessModule } from './access/access.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    HealthModule,
    ProfileModule,
    AuditModule,
    S3VaultModule,
    MedicalRecordsModule,
    AccessModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtCookieGuard,
    },
  ],
})
export class AppModule {}
