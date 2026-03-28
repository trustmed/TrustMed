import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { dataSourceOptions } from './config/database.config';
import { ProfileModule } from './profile/profile.module';
import { AuthModule } from './auth/auth.module';
import { JwtCookieGuard } from './auth/jwt-cookie.guard';
import { MedicalRecordModule } from './medical-record/medical-record.module';
import { AuditModule } from './audit/audit.module';
import { S3VaultModule } from './s3-vault/s3-vault.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AiModule } from './ai/ai.module';
import { MedicalHistoryModule } from './medical-history/medical-history.module';

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
    MedicalRecordModule,
    AuditModule,
    S3VaultModule,
    AppointmentsModule,
    AiModule,
    MedicalHistoryModule,
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
