import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1770563243972 implements MigrationInterface {
    name = 'InitialSchema1770563243972'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "persons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying(100) NOT NULL, "email" character varying NOT NULL, "phone" character varying(100) NOT NULL, "addressLine1" character varying(100) NOT NULL, "addressLine2" character varying(100) NOT NULL, "city" character varying(100) NOT NULL, "zipCode" character varying(100) NOT NULL, "gender" character varying(100) NOT NULL, "dob" character varying(100) NOT NULL, "password_hash" character varying(100), "lastLogin" TIMESTAMP, CONSTRAINT "UQ_928155276ca8852f3c440cc2b2c" UNIQUE ("email"), CONSTRAINT "PK_74278d8812a049233ce41440ac7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "global_patients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "did" character varying NOT NULL, "primary_doc_type" character varying, "doc_identifier_hash" character varying, "public_key" text, "enc_profile_blob" text, "is_verified" boolean NOT NULL DEFAULT false, "person_id" uuid, CONSTRAINT "UQ_59bfba8727c74ae24b023da8124" UNIQUE ("did"), CONSTRAINT "REL_f1588ada264c6b95949ea8b031" UNIQUE ("person_id"), CONSTRAINT "PK_b52fcbfa76e1bc08eb648310090" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."institutions_status_enum" AS ENUM('ACTIVE', 'SUSPENDED')`);
        await queryRunner.query(`CREATE TABLE "institutions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "license_number" character varying NOT NULL, "status" "public"."institutions_status_enum" NOT NULL DEFAULT 'ACTIVE', "contact_details" json, CONSTRAINT "UQ_6d914281c403f50f4bc490c0caa" UNIQUE ("license_number"), CONSTRAINT "PK_0be7539dcdba335470dc05e9690" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "event_type" character varying NOT NULL, "actor_did" character varying NOT NULL, "target_resource" character varying, "ip_address" character varying, "timestamp" TIMESTAMP NOT NULL, "additional_data" json, CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notification_queue_type_enum" AS ENUM('PUSH', 'EMAIL', 'SMS')`);
        await queryRunner.query(`CREATE TABLE "notification_queue" ("id" BIGSERIAL NOT NULL, "target_did" character varying NOT NULL, "message" character varying NOT NULL, "type" "public"."notification_queue_type_enum" NOT NULL, "is_sent" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "sent_at" TIMESTAMP, CONSTRAINT "PK_60a6aa02d8322bf9912101f47d3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."guardian_links_relationship_enum" AS ENUM('FATHER', 'MOTHER', 'GUARDIAN')`);
        await queryRunner.query(`CREATE TABLE "guardian_links" ("id" BIGSERIAL NOT NULL, "minor_did" character varying NOT NULL, "guardian_did" character varying NOT NULL, "relationship" "public"."guardian_links_relationship_enum" NOT NULL, "doc_reference" character varying, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a5ef0b9de24a0d6e502b752df40" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "record_registry" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "patient_did" character varying NOT NULL, "institution_id" uuid, "record_hash" character varying NOT NULL, "vault_id" character varying, "metadata" json, "is_revoked" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_aafcef6fd251a4657e53480f905" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."access_requests_status_enum" AS ENUM('PENDING', 'GRANTED', 'REJECTED', 'EXPIRED')`);
        await queryRunner.query(`CREATE TABLE "access_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "requester_inst_id" uuid NOT NULL, "requester_staff_id" character varying, "patient_did" character varying NOT NULL, "record_registry_id" uuid, "status" "public"."access_requests_status_enum" NOT NULL DEFAULT 'PENDING', "rejection_reason" text, "requested_at" TIMESTAMP NOT NULL, "granted_at" TIMESTAMP, "expiry_at" TIMESTAMP, CONSTRAINT "PK_f89e51c15e3dbea13aa248fe128" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "global_patients" ADD CONSTRAINT "FK_f1588ada264c6b95949ea8b0318" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification_queue" ADD CONSTRAINT "FK_880948d3ddc430e2295a16af4f4" FOREIGN KEY ("target_did") REFERENCES "global_patients"("did") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "guardian_links" ADD CONSTRAINT "FK_1d509f01dc81b05afe415ff7ccd" FOREIGN KEY ("minor_did") REFERENCES "global_patients"("did") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "guardian_links" ADD CONSTRAINT "FK_cc05f5ee485e0bfdeb54ad68551" FOREIGN KEY ("guardian_did") REFERENCES "global_patients"("did") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "record_registry" ADD CONSTRAINT "FK_668239e465f8641ef471809ada7" FOREIGN KEY ("patient_did") REFERENCES "global_patients"("did") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "record_registry" ADD CONSTRAINT "FK_ae405fcd34eb0638e71a457d69d" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "access_requests" ADD CONSTRAINT "FK_9d26ef2430f42a938e98e67a7ed" FOREIGN KEY ("requester_inst_id") REFERENCES "institutions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "access_requests" ADD CONSTRAINT "FK_d1d629eeb65582f358626ef4966" FOREIGN KEY ("patient_did") REFERENCES "global_patients"("did") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "access_requests" ADD CONSTRAINT "FK_7a458cefaaa9060d4ba4e2c2825" FOREIGN KEY ("record_registry_id") REFERENCES "record_registry"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "access_requests" DROP CONSTRAINT "FK_7a458cefaaa9060d4ba4e2c2825"`);
        await queryRunner.query(`ALTER TABLE "access_requests" DROP CONSTRAINT "FK_d1d629eeb65582f358626ef4966"`);
        await queryRunner.query(`ALTER TABLE "access_requests" DROP CONSTRAINT "FK_9d26ef2430f42a938e98e67a7ed"`);
        await queryRunner.query(`ALTER TABLE "record_registry" DROP CONSTRAINT "FK_ae405fcd34eb0638e71a457d69d"`);
        await queryRunner.query(`ALTER TABLE "record_registry" DROP CONSTRAINT "FK_668239e465f8641ef471809ada7"`);
        await queryRunner.query(`ALTER TABLE "guardian_links" DROP CONSTRAINT "FK_cc05f5ee485e0bfdeb54ad68551"`);
        await queryRunner.query(`ALTER TABLE "guardian_links" DROP CONSTRAINT "FK_1d509f01dc81b05afe415ff7ccd"`);
        await queryRunner.query(`ALTER TABLE "notification_queue" DROP CONSTRAINT "FK_880948d3ddc430e2295a16af4f4"`);
        await queryRunner.query(`ALTER TABLE "global_patients" DROP CONSTRAINT "FK_f1588ada264c6b95949ea8b0318"`);
        await queryRunner.query(`DROP TABLE "access_requests"`);
        await queryRunner.query(`DROP TYPE "public"."access_requests_status_enum"`);
        await queryRunner.query(`DROP TABLE "record_registry"`);
        await queryRunner.query(`DROP TABLE "guardian_links"`);
        await queryRunner.query(`DROP TYPE "public"."guardian_links_relationship_enum"`);
        await queryRunner.query(`DROP TABLE "notification_queue"`);
        await queryRunner.query(`DROP TYPE "public"."notification_queue_type_enum"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TABLE "institutions"`);
        await queryRunner.query(`DROP TYPE "public"."institutions_status_enum"`);
        await queryRunner.query(`DROP TABLE "global_patients"`);
        await queryRunner.query(`DROP TABLE "persons"`);
    }

}
