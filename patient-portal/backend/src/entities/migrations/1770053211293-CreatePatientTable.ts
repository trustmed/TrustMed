import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePatientTable1770053211293 implements MigrationInterface {
    name = 'CreatePatientTable1770053211293'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`patients\` (\`id\` varchar(36) NOT NULL, \`createdBy\` varchar(255) NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedBy\` varchar(255) NULL, \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp(6) NULL, \`name\` varchar(100) NOT NULL, \`email\` varchar(255) NOT NULL, \`phone\` varchar(100) NOT NULL, \`addressLine1\` varchar(100) NOT NULL, \`addressLine2\` varchar(100) NOT NULL, \`city\` varchar(100) NOT NULL, \`state\` varchar(100) NOT NULL, \`country\` varchar(100) NOT NULL, \`zipCode\` varchar(100) NOT NULL, \`gender\` varchar(100) NOT NULL, \`dob\` varchar(100) NOT NULL, \`bloodGroup\` varchar(100) NOT NULL, \`height\` varchar(100) NOT NULL, \`weight\` varchar(100) NOT NULL, UNIQUE INDEX \`IDX_64e2031265399f5690b0beba6a\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_64e2031265399f5690b0beba6a\` ON \`patients\``);
        await queryRunner.query(`DROP TABLE \`patients\``);
    }

}
