import { Entity, Column } from 'typeorm';
import { Person } from './person.entity';

@Entity('patients')
export class Patient extends Person {
    @Column({ length: 100 })
    bloodGroup: string;

    @Column({ length: 100 })
    height: string;

    @Column({ length: 100 })
    weight: string;

    @Column({ length: 100 })
    publicKey: string;
}