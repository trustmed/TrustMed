import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingPersonColumns1773778275906 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing columns to persons table
    await queryRunner.query(
      `ALTER TABLE "persons" ADD COLUMN "name" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "persons" ADD COLUMN "password_hash" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "persons" ADD COLUMN "lastLogin" TIMESTAMP`,
    );

    // Remove unused authUserId column
    await queryRunner.query(`ALTER TABLE "persons" DROP COLUMN "authUserId"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse the changes
    await queryRunner.query(
      `ALTER TABLE "persons" ADD COLUMN "authUserId" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "persons" DROP COLUMN "lastLogin"`);
    await queryRunner.query(
      `ALTER TABLE "persons" DROP COLUMN "password_hash"`,
    );
    await queryRunner.query(`ALTER TABLE "persons" DROP COLUMN "name"`);
  }
}
