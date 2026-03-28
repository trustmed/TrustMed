import { MigrationInterface, QueryRunner } from 'typeorm';

export class MedicalHistory1774724789047 implements MigrationInterface {
  name = 'MedicalHistory1774724789047';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "appointments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "date" TIMESTAMP NOT NULL, "doctor" character varying(100) NOT NULL, "type" character varying(100) NOT NULL, "location" character varying(100) NOT NULL, "address" character varying(200), "phone" character varying(50), "email" character varying(100), "status" "public"."appointments_status_enum" NOT NULL DEFAULT 'pending', "patientId" uuid NOT NULL, CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_13c2e57cb81b44f062ba24df57d" FOREIGN KEY ("patientId") REFERENCES "persons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_13c2e57cb81b44f062ba24df57d"`,
    );
    await queryRunner.query(`DROP TABLE "appointments"`);
  }
}
