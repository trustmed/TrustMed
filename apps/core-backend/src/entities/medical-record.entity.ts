import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Person } from './person.entity';

export enum RecordCategory {
  LAB_REPORT = 'lab_report',
  PRESCRIPTION = 'prescription',
  IMAGING = 'imaging',
  DISCHARGE_SUMMARY = 'discharge_summary',
  VACCINATION = 'vaccination',
  OTHER = 'other',
}

/**
 * Stores metadata for each encrypted medical record uploaded to S3.
 *
 * The raw file is **never** persisted to local disk — it is hashed (SHA-256),
 * encrypted (AES-256-GCM) and uploaded to S3 entirely in memory.
 * The AES key is envelope-encrypted with a master key before storage.
 */
@Entity('medical_records')
export class MedicalRecord extends BaseEntity {
  @ManyToOne(() => Person, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'person_id' })
  person?: Person;

  /** UUID of the patient this record belongs to. */
  @Column({ type: 'uuid' })
  patientId: string;

  /** UUID of the user (AuthUser.id) who uploaded the record. */
  @Column({ type: 'uuid' })
  uploaderId: string;

  /** Full S3 URI (e.g. `s3://bucket/encrypted/uuid-filename.pdf`). */
  @Column({ type: 'text', nullable: true })
  s3Uri: string;

  /** SHA-256 hex digest of the **raw** (unencrypted) file. */
  @Column({ type: 'text', nullable: true })
  documentHash: string;

  /**
   * Envelope-encrypted AES-256-GCM key.
   * Format: `iv_hex:authTag_hex:ciphertext_hex` (sealed by CryptoService).
   */
  @Column({ type: 'text', nullable: true })
  encryptedAesKey: string;

  /** Original file name as provided by the uploader. */
  @Column({ name: 'original_file_name', type: 'text', nullable: true })
  originalFileName: string;

  /** MIME type of the uploaded file (e.g. `application/pdf`). */
  @Column({ name: 'mime_type', type: 'varchar', length: 100, nullable: true })
  mimeType: string;

  /** Compatibility fields for dev branch */
  @Column({ name: 'file_name', type: 'varchar', nullable: true })
  fileName?: string;

  @Column({ name: 'file_url', type: 'varchar', nullable: true })
  fileUrl?: string;

  @Column({ name: 'file_type', type: 'varchar', nullable: true })
  fileType?: string;

  /** File size in bytes. */
  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize: number;

  @Column({
    type: 'enum',
    enum: RecordCategory,
    default: RecordCategory.OTHER,
  })
  category: RecordCategory;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'doctor_name', type: 'varchar', length: 200, nullable: true })
  doctorName: string | null;

  @Column({
    name: 'hospital_name',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  hospitalName: string | null;

  @Column({ name: 'record_date', type: 'date', nullable: true })
  recordDate: Date | null;
}
