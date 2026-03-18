import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthUserTableCreate1773499292249 implements MigrationInterface {
  name = 'AuthUserTableCreate1773499292249';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "auth_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "clerkUserId" character varying NOT NULL, "email" character varying NOT NULL, "firstName" character varying, "lastName" character varying, "active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_f8f14e7f7e8c4c7c8c7c7c7c7c7" UNIQUE ("clerkUserId"), CONSTRAINT "UQ_812e9e72e7e8c4c7c8c7c7c7c7c" UNIQUE ("email"), CONSTRAINT "PK_7e7e7c7c8c8c7c7c7c7c7c7c7c7" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "auth_users"`);
  }
}
