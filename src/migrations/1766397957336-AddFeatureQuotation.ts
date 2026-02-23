import {MigrationInterface, QueryRunner} from "typeorm";

export class AddFeatureQuotation1766397957336 implements MigrationInterface {
    name = 'AddFeatureQuotation1766397957336'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `purchasing_user` (`id` varchar(36) NOT NULL, `companyId` varchar(255) NULL, `name` varchar(255) NULL, `tel` varchar(255) NULL, `email` varchar(255) NULL, `lineId` varchar(255) NULL, `note` varchar(255) NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `modifiedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, `customerId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `quotation_log` (`id` varchar(36) NOT NULL, `subject` varchar(255) NULL, `detail` varchar(255) NULL, `timeStamp` datetime NOT NULL, `note` varchar(255) NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `modifiedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, `quotationId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `quotation_item` (`id` varchar(36) NOT NULL, `sequence` int NULL, `sellName` varchar(255) NULL, `name` varchar(255) NULL, `description` varchar(255) NULL, `quantity` varchar(255) NULL, `unit` varchar(255) NULL, `unitPrice` decimal(10,2) NULL, `discount` varchar(255) NULL, `totalPriceNoVat` decimal(10,2) NULL, `vat` decimal(10,2) NULL, `totalPrice` decimal(10,2) NULL, `status` enum ('OPEN', 'IN_PROGRESS', 'WATTING_PRICE_CONFIRMED', 'DONE', 'DISCONTINUE', 'CANCELLED') NOT NULL DEFAULT 'OPEN', `note` varchar(255) NULL, `quotationId` varchar(255) NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `modifiedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `quotation` (`id` varchar(36) NOT NULL, `quotationNumber` varchar(255) NOT NULL, `companyId` varchar(255) NULL, `customerId` varchar(255) NULL, `purchaseUserId` varchar(255) NULL, `contact` varchar(255) NULL, `endUserId` varchar(255) NULL, `documentNumber` varchar(255) NULL, `email` varchar(255) NULL, `deliveryDueDate` varchar(255) NULL, `priceValidUntil` varchar(255) NULL, `paymentTerm` varchar(255) NULL, `quotedBy` varchar(255) NULL, `quotedDate` datetime NULL, `priceApprovedBy` varchar(255) NULL, `leadChannel` varchar(255) NULL, `leadReceivedDate` datetime NULL, `images` text NULL, `referenceLink` varchar(255) NULL, `reference` varchar(255) NULL, `salesUser` varchar(255) NULL, `status` enum ('OPEN', 'IN_PROGRESS', 'PRICE_CONFIRMED', 'WAITING_FOR_QUOTATION_SEND', 'QUOTATION_SENT', 'OP_OPENED', 'CANCELLED') NOT NULL DEFAULT 'OPEN', `expirationDate` datetime NULL, `note` varchar(255) NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `modifiedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, `purchasingUserId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `end_user` (`id` varchar(36) NOT NULL, `companyId` varchar(255) NULL, `name` varchar(255) NULL, `tel` varchar(255) NULL, `email` varchar(255) NULL, `lineId` varchar(255) NULL, `note` varchar(255) NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `modifiedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, `customerId` varchar(36) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `product_quotation_items` (`productId` varchar(36) NOT NULL, `quotationItemId` varchar(36) NOT NULL, INDEX `IDX_371d69394e22a2a01d439db877` (`productId`), INDEX `IDX_5a72647ba2cecd295b0a10cbcb` (`quotationItemId`), PRIMARY KEY (`productId`, `quotationItemId`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `product` CHANGE `ExCode` `ExCode` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `purchasing_user` ADD CONSTRAINT `FK_87538edf5aa2a1ae14477fd91f1` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `quotation_log` ADD CONSTRAINT `FK_8ae7866614a4033bbf3199d25d2` FOREIGN KEY (`quotationId`) REFERENCES `quotation`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `quotation_item` ADD CONSTRAINT `FK_2084b12d43eff2c8bbeb621fabd` FOREIGN KEY (`quotationId`) REFERENCES `quotation`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `quotation` ADD CONSTRAINT `FK_bca05fc310b2d2145822623c0ec` FOREIGN KEY (`companyId`) REFERENCES `company`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `quotation` ADD CONSTRAINT `FK_51bc6958b152b2a737636d43771` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `quotation` ADD CONSTRAINT `FK_3394d3c273a5376b7f5ec176fbe` FOREIGN KEY (`purchasingUserId`) REFERENCES `purchasing_user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `quotation` ADD CONSTRAINT `FK_77a950f577b954486b0a6d66e26` FOREIGN KEY (`endUserId`) REFERENCES `end_user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `end_user` ADD CONSTRAINT `FK_7bc4e34bb48cfbdde8664700b1f` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `product_quotation_items` ADD CONSTRAINT `FK_371d69394e22a2a01d439db8771` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `product_quotation_items` ADD CONSTRAINT `FK_5a72647ba2cecd295b0a10cbcb0` FOREIGN KEY (`quotationItemId`) REFERENCES `quotation_item`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product_quotation_items` DROP FOREIGN KEY `FK_5a72647ba2cecd295b0a10cbcb0`");
        await queryRunner.query("ALTER TABLE `product_quotation_items` DROP FOREIGN KEY `FK_371d69394e22a2a01d439db8771`");
        await queryRunner.query("ALTER TABLE `end_user` DROP FOREIGN KEY `FK_7bc4e34bb48cfbdde8664700b1f`");
        await queryRunner.query("ALTER TABLE `quotation` DROP FOREIGN KEY `FK_77a950f577b954486b0a6d66e26`");
        await queryRunner.query("ALTER TABLE `quotation` DROP FOREIGN KEY `FK_3394d3c273a5376b7f5ec176fbe`");
        await queryRunner.query("ALTER TABLE `quotation` DROP FOREIGN KEY `FK_51bc6958b152b2a737636d43771`");
        await queryRunner.query("ALTER TABLE `quotation` DROP FOREIGN KEY `FK_bca05fc310b2d2145822623c0ec`");
        await queryRunner.query("ALTER TABLE `quotation_item` DROP FOREIGN KEY `FK_2084b12d43eff2c8bbeb621fabd`");
        await queryRunner.query("ALTER TABLE `quotation_log` DROP FOREIGN KEY `FK_8ae7866614a4033bbf3199d25d2`");
        await queryRunner.query("ALTER TABLE `purchasing_user` DROP FOREIGN KEY `FK_87538edf5aa2a1ae14477fd91f1`");
        await queryRunner.query("ALTER TABLE `product` CHANGE `ExCode` `ExCode` varchar(255) NOT NULL");
        await queryRunner.query("DROP INDEX `IDX_5a72647ba2cecd295b0a10cbcb` ON `product_quotation_items`");
        await queryRunner.query("DROP INDEX `IDX_371d69394e22a2a01d439db877` ON `product_quotation_items`");
        await queryRunner.query("DROP TABLE `product_quotation_items`");
        await queryRunner.query("DROP TABLE `end_user`");
        await queryRunner.query("DROP TABLE `quotation`");
        await queryRunner.query("DROP TABLE `quotation_item`");
        await queryRunner.query("DROP TABLE `quotation_log`");
        await queryRunner.query("DROP TABLE `purchasing_user`");
    }

}
