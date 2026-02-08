import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { GlobalPatient } from './global-patient.entity';
import { GuardianRelationship } from '@trustmed/types';


@Entity('guardian_links')
export class GuardianLink {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: string;

    @Column({ name: 'minor_did' })
    minorDid: string;

    @ManyToOne(() => GlobalPatient)
    @JoinColumn({ name: 'minor_did', referencedColumnName: 'did' })
    minor: GlobalPatient;

    @Column({ name: 'guardian_did' })   
    guardianDid: string;

    @ManyToOne(() => GlobalPatient)
    @JoinColumn({ name: 'guardian_did', referencedColumnName: 'did' })
    guardian: GlobalPatient;

    @Column({
        type: 'enum',
        enum: GuardianRelationship,
    })
    relationship: GuardianRelationship;

    @Column({ name: 'doc_reference', nullable: true })
    docReference: string;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
