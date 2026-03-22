import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMedicalRecordTable1774144345789 implements MigrationInterface {
    name = 'CreateMedicalRecordTable1774144345789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "medical_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "file_name" character varying NOT NULL, "file_url" character varying NOT NULL, "file_type" character varying NOT NULL, "file_size" integer NOT NULL, "category" character varying NOT NULL, "notes" text, "doctor_name" character varying, "hospital_name" character varying, "record_date" date, "person_id" uuid, CONSTRAINT "PK_c200c0b76638124b7ed51424823" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "auth_users" ALTER COLUMN "firstName" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD CONSTRAINT "FK_d1792275ff345f83dd3760becdb" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "medical_records" DROP CONSTRAINT "FK_d1792275ff345f83dd3760becdb"`);
        await queryRunner.query(`ALTER TABLE "auth_users" ALTER COLUMN "firstName" SET NOT NULL`);
        await queryRunner.query(`DROP TABLE "medical_records"`);
    }

}
