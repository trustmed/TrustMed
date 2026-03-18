import { MigrationInterface, QueryRunner } from 'typeorm';

export class LinkAuthUserToPerson1773600000002 implements MigrationInterface {
  name = 'LinkAuthUserToPerson1773600000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add authUserId column to persons table
    await queryRunner.query(
      `ALTER TABLE "persons" ADD COLUMN "authUserId" uuid UNIQUE`,
    );
    // Add foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "persons" ADD CONSTRAINT "FK_authUserId" FOREIGN KEY ("authUserId") REFERENCES "auth_users"("id") ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key
    await queryRunner.query(
      `ALTER TABLE "persons" DROP CONSTRAINT "FK_authUserId"`,
    );
    // Remove column
    await queryRunner.query(`ALTER TABLE "persons" DROP COLUMN "authUserId"`);
  }
}
