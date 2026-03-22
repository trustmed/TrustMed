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
import { InitialOracle1773847768524 } from '../entities/migrations/1773847768524-initial-oracle';
import { MedicalRecord } from '../entities/medical-record.entity';
import { CreateMedicalRecordTable1774144345789 } from '../entities/migrations/1774144345789-CreateMedicalRecordTable';
import { UpdateMedicalRecordForS31774179118701 } from '../entities/migrations/1774179118701-UpdateMedicalRecordForS3';
dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    Person,
    GlobalPatient,
    Institution,
    AuditLog,
    NotificationQueue,
    GuardianLink,
    RecordRegistry,
    AccessRequest,
    MedicalProfile,
    Allergy,
    Medication,
    EmergencyContact,
    AuthUser,
    MedicalRecord,
  ],
  migrations: [
    InitialOracle1773847768524,
    CreateMedicalRecordTable1774144345789,
    UpdateMedicalRecordForS31774179118701,
  ],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
