import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { GlobalPatient } from '../entities/global-patient.entity';
import { Institution } from '../entities/institution.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { NotificationQueue } from '../entities/notification-queue.entity';
import { GuardianLink } from '../entities/guardian-link.entity';
import { RecordRegistry } from '../entities/record-registry.entity';
import { AccessRequest } from '../entities/access-request.entity';

dotenv.config();

// Base configuration for TypeORM (used by both NestJS and CLI)
const baseConfig = {
  type: (process.env.DB_TYPE || 'mysql'),
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'trustmed',
  entities: [
    GlobalPatient,
    Institution,
    AuditLog,
    NotificationQueue,
    GuardianLink,
    RecordRegistry,
    AccessRequest,
  ],
  migrations: [],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: configService.get<string>('DB_TYPE', 'mysql') as any,
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 3306),
  username: configService.get<string>('DB_USERNAME', 'root'),
  password: configService.get<string>('DB_PASSWORD', 'password'),
  database: configService.get<string>('DB_NAME', 'trustmed'),
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../entities/migrations/*{.ts,.js}'],
  migrationsRun: configService.get<string>('RUN_MIGRATIONS') === 'true',
  synchronize: configService.get<string>('NODE_ENV') !== 'production',
  logging: configService.get<string>('NODE_ENV') === 'development',
  autoLoadEntities: true,
});

// For TypeORM CLI (migrations)
const dataSource = new DataSource(baseConfig as DataSourceOptions);
export default dataSource;
