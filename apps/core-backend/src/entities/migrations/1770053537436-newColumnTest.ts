import { MigrationInterface, QueryRunner } from "typeorm";

export class NewColumnTest1770053537436 implements MigrationInterface {
    name = 'NewColumnTest1770053537436'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`patients\` ADD \`test\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`patients\` CHANGE \`createdBy\` \`createdBy\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`patients\` CHANGE \`updatedBy\` \`updatedBy\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`patients\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`patients\` CHANGE \`deletedAt\` \`deletedAt\` timestamp(6) NULL DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE \`patients\` CHANGE \`updatedBy\` \`updatedBy\` varchar(255) NULL DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE \`patients\` CHANGE \`createdBy\` \`createdBy\` varchar(255) NULL DEFAULT NULL`);
        await queryRunner.query(`ALTER TABLE \`patients\` DROP COLUMN \`test\``);
    }

}
