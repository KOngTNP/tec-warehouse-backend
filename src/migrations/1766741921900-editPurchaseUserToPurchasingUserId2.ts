import {MigrationInterface, QueryRunner} from "typeorm";

export class editPurchaseUserToPurchasingUserId21766741921900 implements MigrationInterface {
    name = 'editPurchaseUserToPurchasingUserId21766741921900'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation` DROP COLUMN `purchaseingUserId`");
        await queryRunner.query("ALTER TABLE `quotation` DROP FOREIGN KEY `FK_3394d3c273a5376b7f5ec176fbe`");
        await queryRunner.query("ALTER TABLE `quotation` DROP COLUMN `purchasingUserId`");
        await queryRunner.query("ALTER TABLE `quotation` ADD `purchasingUserId` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `quotation` ADD CONSTRAINT `FK_3394d3c273a5376b7f5ec176fbe` FOREIGN KEY (`purchasingUserId`) REFERENCES `purchasing_user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation` DROP FOREIGN KEY `FK_3394d3c273a5376b7f5ec176fbe`");
        await queryRunner.query("ALTER TABLE `quotation` DROP COLUMN `purchasingUserId`");
        await queryRunner.query("ALTER TABLE `quotation` ADD `purchasingUserId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `quotation` ADD CONSTRAINT `FK_3394d3c273a5376b7f5ec176fbe` FOREIGN KEY (`purchasingUserId`) REFERENCES `purchasing_user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `quotation` ADD `purchaseingUserId` varchar(255) NULL");
    }

}
