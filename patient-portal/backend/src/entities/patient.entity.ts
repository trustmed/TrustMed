import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('patients')
export class Patient extends BaseEntity {
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
    state: string;

    @Column({ length: 100 })
    country: string;

    @Column({ length: 100 })
    zipCode: string;

    @Column({ length: 100 })
    gender: string;

    @Column({ length: 100 })
    dob: string;

    @Column({ length: 100 })
    bloodGroup: string;

    @Column({ length: 100 })
    height: string;

    @Column({ length: 100 })
    weight: string;

    @Column({ length: 100 })
    test: string;

}