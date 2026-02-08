import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewTables1770233111661 implements MigrationInterface {
    name = 'AddNewTables1770233111661'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`global_patients\` (\`id\` varchar(36) NOT NULL, \`createdBy\` varchar(255) NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedBy\` varchar(255) NULL, \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp(6) NULL, \`name\` varchar(100) NOT NULL, \`email\` varchar(255) NOT NULL, \`phone\` varchar(100) NOT NULL, \`addressLine1\` varchar(100) NOT NULL, \`addressLine2\` varchar(100) NOT NULL, \`city\` varchar(100) NOT NULL, \`zipCode\` varchar(100) NOT NULL, \`gender\` varchar(100) NOT NULL, \`dob\` varchar(100) NOT NULL, \`lastLogin\` timestamp NOT NULL, \`did\` varchar(255) NOT NULL, \`primary_doc_type\` varchar(255) NULL, \`doc_identifier_hash\` varchar(255) NULL, \`public_key\` text NULL, \`enc_profile_blob\` text NULL, \`is_verified\` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX \`IDX_3a56453272911a9fac357cc8de\` (\`email\`), PRIMARY KEY (\`id\`, \`did\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`institutions\` (\`id\` varchar(36) NOT NULL, \`createdBy\` varchar(255) NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedBy\` varchar(255) NULL, \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp(6) NULL, \`name\` varchar(255) NOT NULL, \`license_number\` varchar(255) NOT NULL, \`status\` enum ('ACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE', \`contact_details\` json NULL, UNIQUE INDEX \`IDX_6d914281c403f50f4bc490c0ca\` (\`license_number\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`audit_logs\` (\`id\` varchar(36) NOT NULL, \`createdBy\` varchar(255) NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedBy\` varchar(255) NULL, \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp(6) NULL, \`event_type\` varchar(255) NOT NULL, \`actor_did\` varchar(255) NOT NULL, \`target_resource\` varchar(255) NULL, \`ip_address\` varchar(255) NULL, \`timestamp\` timestamp NOT NULL, \`additional_data\` json NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`notification_queue\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`target_did\` varchar(255) NOT NULL, \`message\` varchar(255) NOT NULL, \`type\` enum ('PUSH', 'EMAIL', 'SMS') NOT NULL, \`is_sent\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`sent_at\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`guardian_links\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`minor_did\` varchar(255) NOT NULL, \`guardian_did\` varchar(255) NOT NULL, \`relationship\` enum ('FATHER', 'MOTHER', 'GUARDIAN') NOT NULL, \`doc_reference\` varchar(255) NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`record_registry\` (\`id\` varchar(36) NOT NULL, \`createdBy\` varchar(255) NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedBy\` varchar(255) NULL, \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp(6) NULL, \`patient_did\` varchar(255) NOT NULL, \`institution_id\` varchar(255) NULL, \`record_hash\` varchar(255) NOT NULL, \`vault_id\` varchar(255) NULL, \`metadata\` json NULL, \`is_revoked\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`access_requests\` (\`id\` varchar(36) NOT NULL, \`createdBy\` varchar(255) NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedBy\` varchar(255) NULL, \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp(6) NULL, \`requester_inst_id\` varchar(255) NOT NULL, \`requester_staff_id\` varchar(255) NULL, \`patient_did\` varchar(255) NOT NULL, \`record_registry_id\` varchar(255) NULL, \`status\` enum ('PENDING', 'GRANTED', 'REJECTED', 'EXPIRED') NOT NULL DEFAULT 'PENDING', \`rejection_reason\` text NULL, \`requested_at\` timestamp NOT NULL, \`granted_at\` timestamp NULL, \`expiry_at\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`notification_queue\` ADD CONSTRAINT \`FK_f3d4ed1f1b1344f41ac23ed638f\` FOREIGN KEY (\`target_did\`, \`target_did\`) REFERENCES \`global_patients\`(\`id\`,\`did\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`guardian_links\` ADD CONSTRAINT \`FK_d42306ec558e625051f3244e77a\` FOREIGN KEY (\`minor_did\`, \`minor_did\`) REFERENCES \`global_patients\`(\`id\`,\`did\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`guardian_links\` ADD CONSTRAINT \`FK_baf0f75ca6824edafacc0899ce7\` FOREIGN KEY (\`guardian_did\`, \`guardian_did\`) REFERENCES \`global_patients\`(\`id\`,\`did\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`record_registry\` ADD CONSTRAINT \`FK_d6ed22eab6cdffd98e1f9e2d40d\` FOREIGN KEY (\`patient_did\`, \`patient_did\`) REFERENCES \`global_patients\`(\`id\`,\`did\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`record_registry\` ADD CONSTRAINT \`FK_ae405fcd34eb0638e71a457d69d\` FOREIGN KEY (\`institution_id\`) REFERENCES \`institutions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`access_requests\` ADD CONSTRAINT \`FK_9d26ef2430f42a938e98e67a7ed\` FOREIGN KEY (\`requester_inst_id\`) REFERENCES \`institutions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`access_requests\` ADD CONSTRAINT \`FK_2c0221eb9de9a6017b6996a0f50\` FOREIGN KEY (\`patient_did\`, \`patient_did\`) REFERENCES \`global_patients\`(\`id\`,\`did\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`access_requests\` ADD CONSTRAINT \`FK_7a458cefaaa9060d4ba4e2c2825\` FOREIGN KEY (\`record_registry_id\`) REFERENCES \`record_registry\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`access_requests\` DROP FOREIGN KEY \`FK_7a458cefaaa9060d4ba4e2c2825\``);
        await queryRunner.query(`ALTER TABLE \`access_requests\` DROP FOREIGN KEY \`FK_2c0221eb9de9a6017b6996a0f50\``);
        await queryRunner.query(`ALTER TABLE \`access_requests\` DROP FOREIGN KEY \`FK_9d26ef2430f42a938e98e67a7ed\``);
        await queryRunner.query(`ALTER TABLE \`record_registry\` DROP FOREIGN KEY \`FK_ae405fcd34eb0638e71a457d69d\``);
        await queryRunner.query(`ALTER TABLE \`record_registry\` DROP FOREIGN KEY \`FK_d6ed22eab6cdffd98e1f9e2d40d\``);
        await queryRunner.query(`ALTER TABLE \`guardian_links\` DROP FOREIGN KEY \`FK_baf0f75ca6824edafacc0899ce7\``);
        await queryRunner.query(`ALTER TABLE \`guardian_links\` DROP FOREIGN KEY \`FK_d42306ec558e625051f3244e77a\``);
        await queryRunner.query(`ALTER TABLE \`notification_queue\` DROP FOREIGN KEY \`FK_f3d4ed1f1b1344f41ac23ed638f\``);
        await queryRunner.query(`DROP TABLE \`access_requests\``);
        await queryRunner.query(`DROP TABLE \`record_registry\``);
        await queryRunner.query(`DROP TABLE \`guardian_links\``);
        await queryRunner.query(`DROP TABLE \`notification_queue\``);
        await queryRunner.query(`DROP TABLE \`audit_logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_6d914281c403f50f4bc490c0ca\` ON \`institutions\``);
        await queryRunner.query(`DROP TABLE \`institutions\``);
        await queryRunner.query(`DROP INDEX \`IDX_3a56453272911a9fac357cc8de\` ON \`global_patients\``);
        await queryRunner.query(`DROP TABLE \`global_patients\``);
    }

}
