import {MigrationInterface, QueryRunner} from "typeorm";

export class AddvenderIdOnPurchase1761541225377 implements MigrationInterface {
    name = 'AddvenderIdOnPurchase1761541225377'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `purchase` DROP FOREIGN KEY `FK_1c85c6bbd2ae2cf1bfebc5f7260`");
        await queryRunner.query("ALTER TABLE `purchase` DROP COLUMN `venderId`");
        await queryRunner.query("ALTER TABLE `purchase` ADD `venderId` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `purchase` ADD CONSTRAINT `FK_1c85c6bbd2ae2cf1bfebc5f7260` FOREIGN KEY (`venderId`) REFERENCES `vender`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `purchase` DROP FOREIGN KEY `FK_1c85c6bbd2ae2cf1bfebc5f7260`");
        await queryRunner.query("ALTER TABLE `purchase` DROP COLUMN `venderId`");
        await queryRunner.query("ALTER TABLE `purchase` ADD `venderId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `purchase` ADD CONSTRAINT `FK_1c85c6bbd2ae2cf1bfebc5f7260` FOREIGN KEY (`venderId`) REFERENCES `vender`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

}
