import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixMedicalRecordPersonForeignKey1773800000000 implements MigrationInterface {
  name = 'FixMedicalRecordPersonForeignKey1773800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // The medical_records table currently has a foreign key pointing to persons_bck.
    // This migration updates it to point to the live persons table.
    await queryRunner.query(
      `ALTER TABLE "medical_records" DROP CONSTRAINT "FK_d1792275ff345f83dd3760becdb"`,
    );

    await queryRunner.query(
      `ALTER TABLE "medical_records" ADD CONSTRAINT "FK_d1792275ff345f83dd3760becdb" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "medical_records" DROP CONSTRAINT "FK_d1792275ff345f83dd3760becdb"`,
    );

    await queryRunner.query(
      `ALTER TABLE "medical_records" ADD CONSTRAINT "FK_d1792275ff345f83dd3760becdb" FOREIGN KEY ("person_id") REFERENCES "persons_bck"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
