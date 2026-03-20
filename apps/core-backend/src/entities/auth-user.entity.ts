import { Column, Entity, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Person } from './person.entity';

@Entity('auth_users')
export class AuthUser extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  clerkUserId: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100 , nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName: string | null;

  @Column({ type: 'boolean', default: false })
  isDemoDisabled: boolean;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @OneToOne(() => Person, (person) => person.authUser)
  person: Person;
}
