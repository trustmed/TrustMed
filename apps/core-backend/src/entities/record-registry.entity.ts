import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { GlobalPatient } from './global-patient.entity';
import { Institution } from './institution.entity';

@Entity('record_registry')
export class RecordRegistry extends BaseEntity {
    @Column({ name: 'patient_did' })
    patientDid: string;

    @ManyToOne(() => GlobalPatient)
    @JoinColumn({ name: 'patient_did', referencedColumnName: 'did' })
    patient: GlobalPatient;

    @Column({ name: 'institution_id', nullable: true })
    institutionId: string | null;

    @ManyToOne(() => Institution, { nullable: true })
    @JoinColumn({ name: 'institution_id' })
    institution: Institution | null;

    @Column({ name: 'record_hash' })
    recordHash: string;

    @Column({ name: 'vault_id', nullable: true })
    vaultId: string;

    @Column({ name: 'metadata', type: 'json', nullable: true })
    metadata: any;

    @Column({ name: 'is_revoked', type: 'boolean', default: false })
    isRevoked: boolean;
}
