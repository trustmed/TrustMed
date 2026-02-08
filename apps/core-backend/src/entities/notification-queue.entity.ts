import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { GlobalPatient } from './global-patient.entity';

export enum NotificationType {
    PUSH = 'PUSH',
    EMAIL = 'EMAIL',
    SMS = 'SMS',
}

@Entity('notification_queue')
export class NotificationQueue {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: string;

    @Column({ name: 'target_did' })
    targetDid: string;

    @ManyToOne(() => GlobalPatient)
    @JoinColumn({ name: 'target_did' })
    target: GlobalPatient;

    @Column()
    message: string;

    @Column({
        type: 'enum',
        enum: NotificationType,
    })
    type: NotificationType;

    @Column({ name: 'is_sent', type: 'boolean', default: false })
    isSent: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
    sentAt: Date;
}
