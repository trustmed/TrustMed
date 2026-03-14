import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthUserTableCreate1773499292249 implements MigrationInterface {
  name = 'AuthUserTableCreate1773499292249';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "auth_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedBy" character varying, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "clerkUserId" character varying NOT NULL, "email" character varying NOT NULL, "firstName" character varying(100) NOT NULL, "lastName" character varying(100), "isDemoDisabled" boolean NOT NULL DEFAULT false, "active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_935cd86a07c11d84ef1c8bee8f1" UNIQUE ("clerkUserId"), CONSTRAINT "UQ_13d8b49e55a8b06bee6bbc828fb" UNIQUE ("email"), CONSTRAINT "PK_c88cc8077366b470dafc2917366" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "auth_users"`);
  }
}
