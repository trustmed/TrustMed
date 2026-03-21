import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the `appointments` table and related enum to match `Appointment` entity.
 */
export class AppointmentsTable1774000000000 implements MigrationInterface {
  name = 'AppointmentsTable1774000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."appointments_status_enum" AS ENUM('ACCEPTED', 'PENDING', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "appointments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdBy" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedBy" character varying,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "person_id" uuid,
        "appointment_no" character varying(20),
        "patient_name" character varying(150),
        "doctor_name" character varying(150),
        "appointment_type" character varying(100),
        "hospital_location" character varying(150),
        "date" date,
        "address" character varying(255),
        "phone_number" character varying(50),
        "email" character varying(150),
        "status" "public"."appointments_status_enum" NOT NULL DEFAULT 'PENDING',
        CONSTRAINT "PK_appointments_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_appointments_person_appointment_no" UNIQUE ("person_id", "appointment_no")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_appointments_person_id" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_appointments_person_id"`,
    );
    await queryRunner.query(`DROP TABLE "appointments"`);
    await queryRunner.query(`DROP TYPE "public"."appointments_status_enum"`);
  }
}
