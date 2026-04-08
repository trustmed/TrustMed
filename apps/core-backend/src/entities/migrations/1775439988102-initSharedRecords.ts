import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSharedRecords1775439988102 implements MigrationInterface {
    name = 'InitSharedRecords1775439988102'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "shared_link_medical_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "shared_link_id" uuid NOT NULL, "medical_record_id" uuid NOT NULL, CONSTRAINT "PK_a2c9c20f5b0ad18d3747038a07f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_shared_link_medical_record_unique" ON "shared_link_medical_records" ("shared_link_id", "medical_record_id") `);
        await queryRunner.query(`CREATE TYPE "public"."shared_link_records_status_enum" AS ENUM('active', 'expired', 'deactivated')`);
        await queryRunner.query(`CREATE TABLE "shared_link_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "auth_user_id" uuid NOT NULL, "recipient_name" character varying(200) NOT NULL, "shared_date" date NOT NULL, "status" "public"."shared_link_records_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "PK_03eabb479077b7a3534897a008e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "shared_link_medical_records" ADD CONSTRAINT "FK_4ea862b93aa17322108000c3ec2" FOREIGN KEY ("shared_link_id") REFERENCES "shared_link_records"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shared_link_medical_records" ADD CONSTRAINT "FK_75f65ff3c76a61b5f2d0d2d9b47" FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shared_link_records" ADD CONSTRAINT "FK_671536676d1743c055426210b30" FOREIGN KEY ("auth_user_id") REFERENCES "auth_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shared_link_records" DROP CONSTRAINT "FK_671536676d1743c055426210b30"`);
        await queryRunner.query(`ALTER TABLE "shared_link_medical_records" DROP CONSTRAINT "FK_75f65ff3c76a61b5f2d0d2d9b47"`);
        await queryRunner.query(`ALTER TABLE "shared_link_medical_records" DROP CONSTRAINT "FK_4ea862b93aa17322108000c3ec2"`);
        await queryRunner.query(`DROP TABLE "shared_link_records"`);
        await queryRunner.query(`DROP TYPE "public"."shared_link_records_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_shared_link_medical_record_unique"`);
        await queryRunner.query(`DROP TABLE "shared_link_medical_records"`);
    }

}
