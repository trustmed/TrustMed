import { MigrationInterface, QueryRunner } from "typeorm";

export class AuthUserFix1774109871229 implements MigrationInterface {
    name = 'AuthUserFix1774109871229'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auth_users" ADD "isDemoDisabled" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "auth_users" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "auth_users" ADD "firstName" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "auth_users" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "auth_users" ADD "lastName" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "persons" ALTER COLUMN "email" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "persons" ALTER COLUMN "email" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "auth_users" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "auth_users" ADD "lastName" character varying`);
        await queryRunner.query(`ALTER TABLE "auth_users" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "auth_users" ADD "firstName" character varying`);
        await queryRunner.query(`ALTER TABLE "auth_users" DROP COLUMN "isDemoDisabled"`);
    }

}
