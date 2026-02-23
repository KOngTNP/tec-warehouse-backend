import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateOrderAndOrderItem1760589226502 implements MigrationInterface {
    name = 'CreateOrderAndOrderItem1760589226502'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `order_item` (`id` varchar(36) NOT NULL, `documentNumber` varchar(255) NOT NULL, `sellName` varchar(255) NOT NULL, `quantity` int NOT NULL, `unit` varchar(255) NOT NULL, `unitPrice` decimal(10,2) NOT NULL, `discount` varchar(255) NULL, `totalPrice` decimal(10,2) NOT NULL, `reference` varchar(255) NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `modifiedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, `orderId` varchar(36) NULL, `productId` varchar(36) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `order` (`id` varchar(36) NOT NULL, `documentNumber` varchar(255) NOT NULL, `date` datetime NOT NULL, `deliveryDate` datetime NOT NULL, `creditTerm` int NULL, `vatType` varchar(255) NULL, `discount` varchar(255) NULL, `totalPriceNoVat` decimal(10,2) NOT NULL, `vat` decimal(10,2) NOT NULL, `totalPrice` decimal(10,2) NOT NULL, `reference` varchar(255) NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `modifiedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, `customerId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `order_item` ADD CONSTRAINT `FK_646bf9ece6f45dbe41c203e06e0` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `order_item` ADD CONSTRAINT `FK_904370c093ceea4369659a3c810` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `order` ADD CONSTRAINT `FK_124456e637cca7a415897dce659` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `order` DROP FOREIGN KEY `FK_124456e637cca7a415897dce659`");
        await queryRunner.query("ALTER TABLE `order_item` DROP FOREIGN KEY `FK_904370c093ceea4369659a3c810`");
        await queryRunner.query("ALTER TABLE `order_item` DROP FOREIGN KEY `FK_646bf9ece6f45dbe41c203e06e0`");
        await queryRunner.query("DROP TABLE `order`");
        await queryRunner.query("DROP TABLE `order_item`");
    }

}
