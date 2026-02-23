import {MigrationInterface, QueryRunner} from "typeorm";

export class addImageOnQuotationItemAndQuotationIdOnLog1766482874603 implements MigrationInterface {
    name = 'addImageOnQuotationItemAndQuotationIdOnLog1766482874603'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation_item` ADD `images` text NULL");
        await queryRunner.query("ALTER TABLE `quotation_log` DROP FOREIGN KEY `FK_8ae7866614a4033bbf3199d25d2`");
        await queryRunner.query("ALTER TABLE `quotation_log` DROP COLUMN `quotationId`");
        await queryRunner.query("ALTER TABLE `quotation_log` ADD `quotationId` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `quotation_log` ADD CONSTRAINT `FK_8ae7866614a4033bbf3199d25d2` FOREIGN KEY (`quotationId`) REFERENCES `quotation`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation_log` DROP FOREIGN KEY `FK_8ae7866614a4033bbf3199d25d2`");
        await queryRunner.query("ALTER TABLE `quotation_log` DROP COLUMN `quotationId`");
        await queryRunner.query("ALTER TABLE `quotation_log` ADD `quotationId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `quotation_log` ADD CONSTRAINT `FK_8ae7866614a4033bbf3199d25d2` FOREIGN KEY (`quotationId`) REFERENCES `quotation`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `quotation_item` DROP COLUMN `images`");
    }

}
