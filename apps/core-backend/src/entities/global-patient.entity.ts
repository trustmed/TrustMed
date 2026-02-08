import { Entity, Column } from 'typeorm';
import { OneToOne, JoinColumn } from 'typeorm';
import { Person } from './person.entity';
import { BaseEntity } from './base.entity';

@Entity('global_patients')
export class GlobalPatient extends BaseEntity {
  @OneToOne(() => Person, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @Column({ unique: true })
  did: string;

  @Column({ name: 'primary_doc_type', type: 'varchar', nullable: true })
  primaryDocType: string;

  @Column({ name: 'doc_identifier_hash', type: 'varchar', nullable: true })
  docIdentifierHash: string;

  @Column({ name: 'public_key', type: 'text', nullable: true })
  publicKey: string;

  @Column({ name: 'enc_profile_blob', type: 'text', nullable: true })
  encProfileBlob: string;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;
}
