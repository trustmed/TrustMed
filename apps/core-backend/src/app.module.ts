import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { dataSourceOptions } from './config/database.config';
import { ProfileModule } from './profile/profile.module';
import { AuthModule } from './auth/auth.module';
import { JwtCookieGuard } from './auth/jwt-cookie.guard';
import { AccessModule } from './access/access.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { ClerkAuthGuard } from './auth/clerk-auth.guard';

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
    AccessModule,
    MedicalRecordsModule,
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