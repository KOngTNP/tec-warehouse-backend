import {MigrationInterface, QueryRunner} from "typeorm";

export class AddproductIdAndpurchaseIdOnItem1761541376118 implements MigrationInterface {
    name = 'AddproductIdAndpurchaseIdOnItem1761541376118'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `purchase_item` DROP FOREIGN KEY `FK_29ba18d69c81231e8ffabe478b4`");
        await queryRunner.query("ALTER TABLE `purchase_item` DROP FOREIGN KEY `FK_0a3dd60e7f0694bbbc6bc301abb`");
        await queryRunner.query("ALTER TABLE `purchase_item` DROP COLUMN `purchaseId`");
        await queryRunner.query("ALTER TABLE `purchase_item` ADD `purchaseId` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `purchase_item` DROP COLUMN `productId`");
        await queryRunner.query("ALTER TABLE `purchase_item` ADD `productId` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `purchase_item` ADD CONSTRAINT `FK_29ba18d69c81231e8ffabe478b4` FOREIGN KEY (`purchaseId`) REFERENCES `purchase`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `purchase_item` ADD CONSTRAINT `FK_0a3dd60e7f0694bbbc6bc301abb` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `purchase_item` DROP FOREIGN KEY `FK_0a3dd60e7f0694bbbc6bc301abb`");
        await queryRunner.query("ALTER TABLE `purchase_item` DROP FOREIGN KEY `FK_29ba18d69c81231e8ffabe478b4`");
        await queryRunner.query("ALTER TABLE `purchase_item` DROP COLUMN `productId`");
        await queryRunner.query("ALTER TABLE `purchase_item` ADD `productId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `purchase_item` DROP COLUMN `purchaseId`");
        await queryRunner.query("ALTER TABLE `purchase_item` ADD `purchaseId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `purchase_item` ADD CONSTRAINT `FK_0a3dd60e7f0694bbbc6bc301abb` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `purchase_item` ADD CONSTRAINT `FK_29ba18d69c81231e8ffabe478b4` FOREIGN KEY (`purchaseId`) REFERENCES `purchase`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

}
