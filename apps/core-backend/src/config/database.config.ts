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
import { ConsentRequest } from '../entities/consent-request.entity';
import { InitialOracle1773847768524 } from '../entities/migrations/1773847768524-initial-oracle';
import { MedicalRecord } from '../entities/medical-record.entity';
import { Appointment } from '../entities/appointment.entity';
import { CreateMedicalRecordTable1774144345789 } from '../entities/migrations/1774144345789-CreateMedicalRecordTable';
import { CreateConsentRequests1774296327000 } from '../entities/migrations/1774296327000-CreateConsentRequests';
import { MedicalHistory1774724789047 } from '../entities/migrations/1774724789047-medical-history';
import { Fixmedicalhistoryfilterissue1774727471819 } from '../entities/migrations/1774727471819-fixmedicalhistoryfilterissue';
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
    ConsentRequest,
    Appointment,
  ],
  migrations: [
    InitialOracle1773847768524,
    CreateMedicalRecordTable1774144345789,
    CreateConsentRequests1774296327000,
    MedicalHistory1774724789047,
    Fixmedicalhistoryfilterissue1774727471819,
  ],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
