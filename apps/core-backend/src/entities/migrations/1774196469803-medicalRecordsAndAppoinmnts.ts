import { MigrationInterface, QueryRunner } from "typeorm";

export class MedicalRecordsAndAppoinmnts1774196469803 implements MigrationInterface {
    name = 'MedicalRecordsAndAppoinmnts1774196469803'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."appointments_status_enum" AS ENUM('pending', 'accepted', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "appointments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "date" TIMESTAMP NOT NULL, "doctor" character varying(100) NOT NULL, "type" character varying(100) NOT NULL, "location" character varying(100) NOT NULL, "status" "public"."appointments_status_enum" NOT NULL DEFAULT 'pending', "patientId" uuid NOT NULL, CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD "patientId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD "uploaderId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD "s3Uri" text`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD "documentHash" text`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD "encryptedAesKey" text`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD "original_file_name" text`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD "mime_type" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "medical_records" ALTER COLUMN "file_name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "medical_records" ALTER COLUMN "file_url" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "medical_records" ALTER COLUMN "file_type" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP COLUMN "file_size"`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD "file_size" bigint`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP COLUMN "category"`);
        await queryRunner.query(`CREATE TYPE "public"."medical_records_category_enum" AS ENUM('lab_report', 'prescription', 'imaging', 'discharge_summary', 'vaccination', 'other')`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD "category" "public"."medical_records_category_enum" NOT NULL DEFAULT 'other'`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP COLUMN "doctor_name"`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD "doctor_name" character varying(200)`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP COLUMN "hospital_name"`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD "hospital_name" character varying(200)`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_13c2e57cb81b44f062ba24df57d" FOREIGN KEY ("patientId") REFERENCES "persons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_13c2e57cb81b44f062ba24df57d"`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP COLUMN "hospital_name"`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD "hospital_name" character varying`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP COLUMN "doctor_name"`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD "doctor_name" character varying`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP COLUMN "category"`);
        await queryRunner.query(`DROP TYPE "public"."medical_records_category_enum"`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD "category" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP COLUMN "file_size"`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD "file_size" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "medical_records" ALTER COLUMN "file_type" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "medical_records" ALTER COLUMN "file_url" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "medical_records" ALTER COLUMN "file_name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP COLUMN "mime_type"`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP COLUMN "original_file_name"`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP COLUMN "encryptedAesKey"`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP COLUMN "documentHash"`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP COLUMN "s3Uri"`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP COLUMN "uploaderId"`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP COLUMN "patientId"`);
        await queryRunner.query(`DROP TABLE "appointments"`);
        await queryRunner.query(`DROP TYPE "public"."appointments_status_enum"`);
    }

}
