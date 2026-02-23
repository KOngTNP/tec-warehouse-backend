import {MigrationInterface, QueryRunner} from "typeorm";

export class CreatePurchaseRrAndOrderIv1763605617809 implements MigrationInterface {
    name = 'CreatePurchaseRrAndOrderIv1763605617809'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `order_iv` (`id` varchar(36) NOT NULL, `documentNumber` varchar(255) NOT NULL, `date` datetime NOT NULL, `orderId` varchar(255) NULL, `productId` varchar(255) NULL, `seqNumber` int NULL, `quantity` decimal(10,2) NOT NULL, `unit` varchar(255) NOT NULL, `isFree` tinyint NOT NULL DEFAULT 0, `unitPrice` decimal(10,2) NOT NULL, `discount` varchar(255) NULL, `totalPrice` decimal(10,2) NOT NULL, `reference` varchar(255) NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `modifiedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `purchase_rr` (`id` varchar(36) NOT NULL, `documentNumber` varchar(255) NOT NULL, `date` datetime NOT NULL, `purchaseId` varchar(255) NULL, `productId` varchar(255) NULL, `seqNumber` int NULL, `quantity` decimal(10,2) NOT NULL, `unit` varchar(255) NOT NULL, `isFree` tinyint NOT NULL DEFAULT 0, `unitPrice` decimal(10,2) NOT NULL, `discount` varchar(255) NULL, `totalPrice` decimal(10,2) NOT NULL, `reference` varchar(255) NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `modifiedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `order_iv` ADD CONSTRAINT `FK_713dbedbc2e3390c32f95d8d638` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `order_iv` ADD CONSTRAINT `FK_75b2d36cba23a21f9aacb89958d` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `purchase_rr` ADD CONSTRAINT `FK_b836314b3edf4b588a03c351b3c` FOREIGN KEY (`purchaseId`) REFERENCES `purchase`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `purchase_rr` ADD CONSTRAINT `FK_209a5838cddefb5f3132bbe1d2d` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `purchase_rr` DROP FOREIGN KEY `FK_209a5838cddefb5f3132bbe1d2d`");
        await queryRunner.query("ALTER TABLE `purchase_rr` DROP FOREIGN KEY `FK_b836314b3edf4b588a03c351b3c`");
        await queryRunner.query("ALTER TABLE `order_iv` DROP FOREIGN KEY `FK_75b2d36cba23a21f9aacb89958d`");
        await queryRunner.query("ALTER TABLE `order_iv` DROP FOREIGN KEY `FK_713dbedbc2e3390c32f95d8d638`");
        await queryRunner.query("DROP TABLE `purchase_rr`");
        await queryRunner.query("DROP TABLE `order_iv`");
    }

}
