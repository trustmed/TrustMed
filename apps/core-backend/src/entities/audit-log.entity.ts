import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('audit_logs')
export class AuditLog extends BaseEntity {
  @Column({ name: 'event_type' })
  eventType: string;

  @Column({ name: 'actor_did' })
  actorDid: string;

  @Column({ name: 'target_resource', nullable: true })
  targetResource: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'timestamp', type: 'timestamp' })
  timestamp: Date;

  @Column({ name: 'additional_data', type: 'json', nullable: true })
  additionalData: any;
}
