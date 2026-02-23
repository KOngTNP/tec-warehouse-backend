import {MigrationInterface, QueryRunner} from "typeorm";

export class AddOrderIdAndProductIdOnItem1761541510140 implements MigrationInterface {
    name = 'AddOrderIdAndProductIdOnItem1761541510140'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `order_item` DROP FOREIGN KEY `FK_646bf9ece6f45dbe41c203e06e0`");
        await queryRunner.query("ALTER TABLE `order_item` DROP FOREIGN KEY `FK_904370c093ceea4369659a3c810`");
        await queryRunner.query("ALTER TABLE `order_item` DROP COLUMN `orderId`");
        await queryRunner.query("ALTER TABLE `order_item` ADD `orderId` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `order_item` DROP COLUMN `productId`");
        await queryRunner.query("ALTER TABLE `order_item` ADD `productId` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `order_item` ADD CONSTRAINT `FK_646bf9ece6f45dbe41c203e06e0` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `order_item` ADD CONSTRAINT `FK_904370c093ceea4369659a3c810` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `order_item` DROP FOREIGN KEY `FK_904370c093ceea4369659a3c810`");
        await queryRunner.query("ALTER TABLE `order_item` DROP FOREIGN KEY `FK_646bf9ece6f45dbe41c203e06e0`");
        await queryRunner.query("ALTER TABLE `order_item` DROP COLUMN `productId`");
        await queryRunner.query("ALTER TABLE `order_item` ADD `productId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `order_item` DROP COLUMN `orderId`");
        await queryRunner.query("ALTER TABLE `order_item` ADD `orderId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `order_item` ADD CONSTRAINT `FK_904370c093ceea4369659a3c810` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `order_item` ADD CONSTRAINT `FK_646bf9ece6f45dbe41c203e06e0` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

}
