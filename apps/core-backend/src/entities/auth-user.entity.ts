import { Column, Entity, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Person } from './person.entity';

@Entity('auth_users')
export class AuthUser extends BaseEntity {
  @Column({ unique: true })
  clerkUserId: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @OneToOne(() => Person, (person) => person.authUser)
  person: Person;
}
