import {MigrationInterface, QueryRunner} from "typeorm";

export class CreatePurchaseAndPurchaseItem1760590924448 implements MigrationInterface {
    name = 'CreatePurchaseAndPurchaseItem1760590924448'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `purchase` (`id` varchar(36) NOT NULL, `documentNumber` varchar(255) NOT NULL, `date` datetime NOT NULL, `receiptDate` datetime NOT NULL, `creditTerm` int NULL, `vatType` varchar(255) NULL, `discount` varchar(255) NULL, `totalPriceNoVat` decimal(10,2) NOT NULL, `vat` decimal(10,2) NOT NULL, `totalPrice` decimal(10,2) NOT NULL, `reference` varchar(255) NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `modifiedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, `venderId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `purchase_item` (`id` varchar(36) NOT NULL, `documentNumber` varchar(255) NOT NULL, `quantity` int NOT NULL, `unit` varchar(255) NOT NULL, `unitPrice` decimal(10,2) NOT NULL, `discount` varchar(255) NULL, `totalPrice` decimal(10,2) NOT NULL, `reference` varchar(255) NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `modifiedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, `purchaseId` varchar(36) NULL, `productId` varchar(36) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `purchase` ADD CONSTRAINT `FK_1c85c6bbd2ae2cf1bfebc5f7260` FOREIGN KEY (`venderId`) REFERENCES `vender`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `purchase_item` ADD CONSTRAINT `FK_29ba18d69c81231e8ffabe478b4` FOREIGN KEY (`purchaseId`) REFERENCES `purchase`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `purchase_item` ADD CONSTRAINT `FK_0a3dd60e7f0694bbbc6bc301abb` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `purchase_item` DROP FOREIGN KEY `FK_0a3dd60e7f0694bbbc6bc301abb`");
        await queryRunner.query("ALTER TABLE `purchase_item` DROP FOREIGN KEY `FK_29ba18d69c81231e8ffabe478b4`");
        await queryRunner.query("ALTER TABLE `purchase` DROP FOREIGN KEY `FK_1c85c6bbd2ae2cf1bfebc5f7260`");
        await queryRunner.query("DROP TABLE `purchase_item`");
        await queryRunner.query("DROP TABLE `purchase`");
    }

}
