import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateConsentRequests1774296327000 implements MigrationInterface {
  name = 'CreateConsentRequests1774296327000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Safely create the enum if it doesn't exist
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "public"."consent_requests_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "consent_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "requester_id" uuid NOT NULL, "patient_id" uuid NOT NULL, "record_id" uuid NOT NULL, "status" "public"."consent_requests_status_enum" NOT NULL DEFAULT 'PENDING', "expires_at" TIMESTAMP, CONSTRAINT "PK_consent_requests" PRIMARY KEY ("id"))`,
    );
    // Add foreign keys safely
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "consent_requests" ADD CONSTRAINT "FK_consent_requester" FOREIGN KEY ("requester_id") REFERENCES "auth_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "consent_requests" ADD CONSTRAINT "FK_consent_patient" FOREIGN KEY ("patient_id") REFERENCES "auth_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    );
    await queryRunner.query(
      `DO $$ BEGIN ALTER TABLE "consent_requests" ADD CONSTRAINT "FK_consent_record" FOREIGN KEY ("record_id") REFERENCES "medical_records"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "consent_requests" DROP CONSTRAINT IF EXISTS "FK_consent_record"`,
    );
    await queryRunner.query(
      `ALTER TABLE "consent_requests" DROP CONSTRAINT IF EXISTS "FK_consent_patient"`,
    );
    await queryRunner.query(
      `ALTER TABLE "consent_requests" DROP CONSTRAINT IF EXISTS "FK_consent_requester"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "consent_requests"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."consent_requests_status_enum"`,
    );
  }
}
