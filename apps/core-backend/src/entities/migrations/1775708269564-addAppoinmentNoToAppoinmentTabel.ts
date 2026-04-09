import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAppoinmentNoToAppoinmentTabel1775708269564 implements MigrationInterface {
    name = 'AddAppoinmentNoToAppoinmentTabel1775708269564'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" ADD "appointmentNo" character varying(32)`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "UQ_c4c05338ba237bef58129d4c0a7" UNIQUE ("appointmentNo")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "UQ_c4c05338ba237bef58129d4c0a7"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "appointmentNo"`);
    }

}
