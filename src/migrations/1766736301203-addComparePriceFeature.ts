import {MigrationInterface, QueryRunner} from "typeorm";

export class addComparePriceFeature1766736301203 implements MigrationInterface {
    name = 'addComparePriceFeature1766736301203'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `quotation_item_product` (`id` varchar(36) NOT NULL, `quotationItemId` varchar(255) NULL, `productId` varchar(255) NULL, `workSheetImages` text NULL, `note` varchar(255) NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `modifiedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `sale_user` (`id` varchar(36) NOT NULL, `venderId` varchar(255) NULL, `name` varchar(255) NULL, `tel` varchar(255) NULL, `email` varchar(255) NULL, `lineId` varchar(255) NULL, `note` varchar(255) NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `modifiedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `compare_price` (`id` varchar(36) NOT NULL, `quotationItemProductId` varchar(255) NULL, `productId` varchar(255) NULL, `venderId` varchar(255) NULL, `saleUserId` varchar(255) NULL, `buyName` varchar(255) NULL, `financialCondition` varchar(255) NULL, `leadTime` varchar(255) NULL, `images` text NULL, `quantity` int NULL, `unit` varchar(255) NULL, `unitPrice` decimal(10,2) NULL, `discount` varchar(255) NULL, `totalPriceNoVat` decimal(10,2) NULL, `vatType` varchar(255) NULL, `vat` decimal(10,2) NULL, `totalPrice` decimal(10,2) NULL, `deliveryType` enum ('DELIVERY', 'PICKUP') NOT NULL DEFAULT 'DELIVERY', `deliveryPrice` decimal(10,2) NULL DEFAULT '0.00', `note` varchar(255) NULL, `sourceType` enum ('NEW', 'LEGACY') NOT NULL DEFAULT 'NEW', `OldRr` varchar(255) NULL, `createBy` varchar(255) NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `modifiedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `quotation_item` ADD `oldQuantity` int NULL");
        await queryRunner.query("ALTER TABLE `quotation_item` ADD `oldUnit` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `quotation_item` ADD `oldUnitPrice` decimal(10,2) NULL");
        await queryRunner.query("ALTER TABLE `quotation_item` ADD `oldDiscount` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `quotation_item` ADD `oldTotalPriceNoVat` decimal(10,2) NULL");
        await queryRunner.query("ALTER TABLE `quotation_item` ADD `oldVatType` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `quotation_item` ADD `oldVat` decimal(10,2) NULL");
        await queryRunner.query("ALTER TABLE `quotation_item` ADD `oldTotalPrice` decimal(10,2) NULL");
        await queryRunner.query("ALTER TABLE `quotation_item` ADD `oldCustomerId` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `quotation_item` ADD `oldName` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `quotation_item` ADD `oldIv` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `quotation_item` ADD `oldNote` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `quotation_item` ADD CONSTRAINT `FK_93a35439ced02458d26c9f09829` FOREIGN KEY (`oldCustomerId`) REFERENCES `customer`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `quotation_item_product` ADD CONSTRAINT `FK_baf5f011c03d1fcc2ef6cb00765` FOREIGN KEY (`quotationItemId`) REFERENCES `quotation_item`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `quotation_item_product` ADD CONSTRAINT `FK_fe1838d948c1cf565055179faae` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `sale_user` ADD CONSTRAINT `FK_5ddfbe9e6caa35aaee23a613a9d` FOREIGN KEY (`venderId`) REFERENCES `vender`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `compare_price` ADD CONSTRAINT `FK_2b746e34bef0ef4d53491a0676d` FOREIGN KEY (`quotationItemProductId`) REFERENCES `quotation_item_product`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `compare_price` ADD CONSTRAINT `FK_e791978149b7197f47c0acb394e` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `compare_price` ADD CONSTRAINT `FK_caa8464663bbef7f70927ad264d` FOREIGN KEY (`venderId`) REFERENCES `vender`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `compare_price` ADD CONSTRAINT `FK_ddf58d10c96577b162446b915f4` FOREIGN KEY (`saleUserId`) REFERENCES `sale_user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `compare_price` DROP FOREIGN KEY `FK_ddf58d10c96577b162446b915f4`");
        await queryRunner.query("ALTER TABLE `compare_price` DROP FOREIGN KEY `FK_caa8464663bbef7f70927ad264d`");
        await queryRunner.query("ALTER TABLE `compare_price` DROP FOREIGN KEY `FK_e791978149b7197f47c0acb394e`");
        await queryRunner.query("ALTER TABLE `compare_price` DROP FOREIGN KEY `FK_2b746e34bef0ef4d53491a0676d`");
        await queryRunner.query("ALTER TABLE `sale_user` DROP FOREIGN KEY `FK_5ddfbe9e6caa35aaee23a613a9d`");
        await queryRunner.query("ALTER TABLE `quotation_item_product` DROP FOREIGN KEY `FK_fe1838d948c1cf565055179faae`");
        await queryRunner.query("ALTER TABLE `quotation_item_product` DROP FOREIGN KEY `FK_baf5f011c03d1fcc2ef6cb00765`");
        await queryRunner.query("ALTER TABLE `quotation_item` DROP FOREIGN KEY `FK_93a35439ced02458d26c9f09829`");
        await queryRunner.query("ALTER TABLE `quotation_item` DROP COLUMN `oldNote`");
        await queryRunner.query("ALTER TABLE `quotation_item` DROP COLUMN `oldIv`");
        await queryRunner.query("ALTER TABLE `quotation_item` DROP COLUMN `oldName`");
        await queryRunner.query("ALTER TABLE `quotation_item` DROP COLUMN `oldCustomerId`");
        await queryRunner.query("ALTER TABLE `quotation_item` DROP COLUMN `oldTotalPrice`");
        await queryRunner.query("ALTER TABLE `quotation_item` DROP COLUMN `oldVat`");
        await queryRunner.query("ALTER TABLE `quotation_item` DROP COLUMN `oldVatType`");
        await queryRunner.query("ALTER TABLE `quotation_item` DROP COLUMN `oldTotalPriceNoVat`");
        await queryRunner.query("ALTER TABLE `quotation_item` DROP COLUMN `oldDiscount`");
        await queryRunner.query("ALTER TABLE `quotation_item` DROP COLUMN `oldUnitPrice`");
        await queryRunner.query("ALTER TABLE `quotation_item` DROP COLUMN `oldUnit`");
        await queryRunner.query("ALTER TABLE `quotation_item` DROP COLUMN `oldQuantity`");
        await queryRunner.query("DROP TABLE `compare_price`");
        await queryRunner.query("DROP TABLE `sale_user`");
        await queryRunner.query("DROP TABLE `quotation_item_product`");
    }

}
