import {MigrationInterface, QueryRunner} from "typeorm";

export class ChangePurchaseItemProductNull1760951932144 implements MigrationInterface {
    name = 'ChangePurchaseItemProductNull1760951932144'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `purchase_item` DROP FOREIGN KEY `FK_0a3dd60e7f0694bbbc6bc301abb`");
        await queryRunner.query("ALTER TABLE `purchase_item` CHANGE `productId` `productId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `purchase_item` ADD CONSTRAINT `FK_0a3dd60e7f0694bbbc6bc301abb` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `purchase_item` DROP FOREIGN KEY `FK_0a3dd60e7f0694bbbc6bc301abb`");
        await queryRunner.query("ALTER TABLE `purchase_item` CHANGE `productId` `productId` varchar(36) NOT NULL");
        await queryRunner.query("ALTER TABLE `purchase_item` ADD CONSTRAINT `FK_0a3dd60e7f0694bbbc6bc301abb` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

}
