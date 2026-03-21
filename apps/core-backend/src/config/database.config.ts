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

import { Appointment } from '../entities/appointment.entity';
import { InitialSchema1770563243972 } from '../entities/migrations/1770563243972-InitialSchema';
import { AppointmentsTable1774000000000 } from '../entities/migrations/1774000000000-AppointmentsTable';
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
    Appointment,
  ],
  migrations: [
    InitialOracle1773847768524,
    InitialSchema1770563243972,
    AppointmentsTable1774000000000,
  ],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
