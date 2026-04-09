import { MigrationInterface, QueryRunner } from "typeorm";

export class ResolveConsentIdIssue1775758008335 implements MigrationInterface {
    name = 'ResolveConsentIdIssue1775758008335'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "consent_requests" DROP CONSTRAINT "FK_d67c5e43670ff460aa6cafc4ed5"`);
        await queryRunner.query(`ALTER TABLE "consent_requests" ADD CONSTRAINT "FK_d67c5e43670ff460aa6cafc4ed5" FOREIGN KEY ("patient_id") REFERENCES "persons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "consent_requests" DROP CONSTRAINT "FK_d67c5e43670ff460aa6cafc4ed5"`);
        await queryRunner.query(`ALTER TABLE "consent_requests" ADD CONSTRAINT "FK_d67c5e43670ff460aa6cafc4ed5" FOREIGN KEY ("patient_id") REFERENCES "auth_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
