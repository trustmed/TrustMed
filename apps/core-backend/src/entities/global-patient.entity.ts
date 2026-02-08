import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { Person } from './person.entity';

@Entity('global_patients')
export class GlobalPatient extends Person {
    @PrimaryColumn()
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
