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
import { Person } from '../entities/person.entity';
import { InitialSchema1770563243972 } from '../entities/migrations/1770563243972-InitialSchema';

dotenv.config();

// Base configuration
const baseConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'trustmed',
  entities: [
    Person,
    GlobalPatient,
    Institution,
    AuditLog,
    NotificationQueue,
    GuardianLink,
    RecordRegistry,
    AccessRequest,
  ],
  migrations: [InitialSchema1770563243972],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',

  // 👇 CHANGE: Explicitly disable SSL by default unless DB_SSL=true is set
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  // Check if we explicitly want SSL via env var
  const enableSsl = configService.get<string>('DB_SSL') === 'true';

  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', 'password'),
    database: configService.get<string>('DB_NAME', 'trustmed'),
    entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../entities/migrations/*{.ts,.js}'],
    migrationsRun: configService.get<string>('RUN_MIGRATIONS') === 'true',
    synchronize: configService.get<string>('NODE_ENV') !== 'production',
    logging: configService.get<string>('NODE_ENV') === 'development',
    autoLoadEntities: true,

    // 👇 CHANGE: Same here, disable SSL unless forced
    ssl: enableSsl ? { rejectUnauthorized: false } : false,
  };
};

const dataSource = new DataSource(baseConfig);
export default dataSource;
