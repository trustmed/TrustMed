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
import { MedicalProfile } from '../entities/medical-profile.entity';
import { Allergy } from '../entities/allergy.entity';
import { Medication } from '../entities/medication.entity';
import { EmergencyContact } from '../entities/emergency-contact.entity';
import { AuthUser } from '../entities/auth-user.entity';
import { InitialSchema1770563243972 } from '../entities/migrations/1770563243972-InitialSchema';
import { AddMissingPersonColumns1773778275906 } from '../entities/migrations/1773778275906-AddMissingPersonColumns';
import { AuthUserTableCreate1773499292249 } from '../entities/migrations/1773499292249-AuthUserTableCreate';
import { LinkAuthUserToPerson1773600000002 } from '../entities/migrations/1773600000002-LinkAuthUserToPerson';
import { MedicalRecord } from '../entities/medical-record.entity';
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
    AuthUser,
    MedicalProfile,
    Allergy,
    Medication,
    EmergencyContact,
    MedicalRecord,
  ],
  migrations: [
    InitialSchema1770563243972,
    AddMissingPersonColumns1773778275906,
    AuthUserTableCreate1773499292249,
    LinkAuthUserToPerson1773600000002,
  ],
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
    synchronize: false, // Temporarily disabled to avoid sync issues
    logging: configService.get<string>('NODE_ENV') === 'development',
    autoLoadEntities: true,

    // 👇 CHANGE: Same here, disable SSL unless forced
    ssl: enableSsl ? { rejectUnauthorized: false } : false,
  };
};

const dataSource = new DataSource(baseConfig);
export default dataSource;
