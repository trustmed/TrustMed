import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateConsentRequests1774095977000 implements MigrationInterface {
    name = 'CreateConsentRequests1774095977000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // safely create the enum if it doesn't exist
        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."consent_requests_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "consent_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "requester_id" uuid NOT NULL, "patient_id" uuid NOT NULL, "record_id" uuid NOT NULL, "status" "public"."consent_requests_status_enum" NOT NULL DEFAULT 'PENDING', "expires_at" TIMESTAMP, CONSTRAINT "PK_6e56fb576d9de99095cc4a8ba65" PRIMARY KEY ("id"))`);
        
        // Add foreign keys safely by dropping them if they exist first, or using DO blocks. Since IF NOT EXISTS is simpler for tables, we can just catch errors for constraints if they already exist.
        await queryRunner.query(`DO $$ BEGIN ALTER TABLE "consent_requests" ADD CONSTRAINT "FK_490fca94f8560858aae172f8d2f" FOREIGN KEY ("requester_id") REFERENCES "auth_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`DO $$ BEGIN ALTER TABLE "consent_requests" ADD CONSTRAINT "FK_d67c5e43670ff460aa6cafc4ed5" FOREIGN KEY ("patient_id") REFERENCES "auth_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`DO $$ BEGIN ALTER TABLE "consent_requests" ADD CONSTRAINT "FK_afe2d4f2495e225421c31abf279" FOREIGN KEY ("record_id") REFERENCES "medical_records"("id") ON DELETE NO ACTION ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN null; END $$;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "consent_requests" DROP CONSTRAINT "FK_afe2d4f2495e225421c31abf279"`);
        await queryRunner.query(`ALTER TABLE "consent_requests" DROP CONSTRAINT "FK_d67c5e43670ff460aa6cafc4ed5"`);
        await queryRunner.query(`ALTER TABLE "consent_requests" DROP CONSTRAINT "FK_490fca94f8560858aae172f8d2f"`);
        await queryRunner.query(`DROP TABLE "consent_requests"`);
        await queryRunner.query(`DROP TYPE "public"."consent_requests_status_enum"`);
    }

}
