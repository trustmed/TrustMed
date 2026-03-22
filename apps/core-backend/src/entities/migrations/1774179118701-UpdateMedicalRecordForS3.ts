import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMedicalRecordForS31774179118701 implements MigrationInterface {
    name = 'UpdateMedicalRecordForS31774179118701'

    public async up(queryRunner: QueryRunner): Promise<void> {
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
        await queryRunner.query(`ALTER TABLE "medical_records" ADD "category" "public"."medical_records_category_enum" NOT NULL DEFAULT 'other'`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP COLUMN "doctor_name"`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD "doctor_name" character varying(200)`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP COLUMN "hospital_name"`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD "hospital_name" character varying(200)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "medical_records" DROP COLUMN "hospital_name"`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD "hospital_name" character varying`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP COLUMN "doctor_name"`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD "doctor_name" character varying`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP COLUMN "category"`);
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
    }

}
