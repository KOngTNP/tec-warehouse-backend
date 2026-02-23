import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateRemark1762316348388 implements MigrationInterface {
    name = 'CreateRemark1762316348388'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `remark` (`id` varchar(36) NOT NULL, `documentNumber` varchar(255) NOT NULL, `seqNumber` varchar(255) NOT NULL, `remark` varchar(255) NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `modifiedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, FULLTEXT INDEX `IDX_a40a11d266b25bc49f78dc23a1` (`remark`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_a40a11d266b25bc49f78dc23a1` ON `remark`");
        await queryRunner.query("DROP TABLE `remark`");
    }

}
