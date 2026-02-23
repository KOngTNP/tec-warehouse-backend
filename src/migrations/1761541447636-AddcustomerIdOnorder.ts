import {MigrationInterface, QueryRunner} from "typeorm";

export class AddcustomerIdOnorder1761541447636 implements MigrationInterface {
    name = 'AddcustomerIdOnorder1761541447636'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `order` DROP FOREIGN KEY `FK_124456e637cca7a415897dce659`");
        await queryRunner.query("ALTER TABLE `order` DROP COLUMN `customerId`");
        await queryRunner.query("ALTER TABLE `order` ADD `customerId` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `order` ADD CONSTRAINT `FK_124456e637cca7a415897dce659` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `order` DROP FOREIGN KEY `FK_124456e637cca7a415897dce659`");
        await queryRunner.query("ALTER TABLE `order` DROP COLUMN `customerId`");
        await queryRunner.query("ALTER TABLE `order` ADD `customerId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `order` ADD CONSTRAINT `FK_124456e637cca7a415897dce659` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

}
