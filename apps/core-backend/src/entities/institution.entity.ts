import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Status } from '@trustmed/types';

@Entity('institutions')
export class Institution extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: 'license_number', unique: true })
  licenseNumber: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;

  @Column({ name: 'contact_details', type: 'json', nullable: true })
  contactDetails: any;
}
