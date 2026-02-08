import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { GlobalPatient } from './global-patient.entity';
import { Institution } from './institution.entity';
import { RecordRegistry } from './record-registry.entity';
import { AccessRequestStatus } from '@trustmed/types';


@Entity('access_requests')
export class AccessRequest extends BaseEntity {
    @Column({ name: 'requester_inst_id' })
    requesterInstId: string;

    @ManyToOne(() => Institution)
    @JoinColumn({ name: 'requester_inst_id' })
    requesterInst: Institution;

    @Column({ name: 'requester_staff_id', nullable: true })
    requesterStaffId: string;

    @Column({ name: 'patient_did' })
    patientDid: string;

    @ManyToOne(() => GlobalPatient)
    @JoinColumn({ name: 'patient_did' })
    patient: GlobalPatient;

    @Column({ name: 'record_registry_id', nullable: true })
    recordRegistryId: string;

    @ManyToOne(() => RecordRegistry)
    @JoinColumn({ name: 'record_registry_id' })
    recordRegistry: RecordRegistry;

    @Column({
        type: 'enum',
        enum: AccessRequestStatus,
        default: AccessRequestStatus.PENDING,
    })
    status: AccessRequestStatus;

    @Column({ name: 'rejection_reason', type: 'text', nullable: true })
    rejectionReason: string;

    @Column({ name: 'requested_at', type: 'timestamp' })
    requestedAt: Date;

    @Column({ name: 'granted_at', type: 'timestamp', nullable: true })
    grantedAt: Date;

    @Column({ name: 'expiry_at', type: 'timestamp', nullable: true })
    expiryAt: Date;
}
