import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('patients')
export class Person extends BaseEntity {
    @Column({ length: 100 })
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ length: 100 })
    phone: string;

    @Column({ length: 100 })
    addressLine1: string;

    @Column({ length: 100 })
    addressLine2: string;

    @Column({ length: 100 })
    city: string;

    @Column({ length: 100 })
    zipCode: string;

    @Column({ length: 100 })
    gender: string;

    @Column({ length: 100 })
    dob: string;

    @Column({ type: 'timestamp' })
    lastLogin: Date;

}