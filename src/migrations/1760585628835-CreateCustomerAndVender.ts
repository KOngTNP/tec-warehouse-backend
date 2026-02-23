import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateCustomerAndVender1760585628835 implements MigrationInterface {
    name = 'CreateCustomerAndVender1760585628835'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product` CHANGE `productExId` `ExCode` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `category` CHANGE `categoryExId` `ExCode` varchar(255) NOT NULL");
        await queryRunner.query("CREATE TABLE `customer` (`id` varchar(36) NOT NULL, `type` varchar(255) NOT NULL, `ExCode` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `ExAcCode` varchar(255) NULL, `taxId` varchar(255) NULL, `branch` varchar(255) NULL, `address` varchar(255) NULL, `zipCode` varchar(255) NULL, `area` varchar(255) NULL, `contact` varchar(255) NULL, `telNumber` varchar(255) NULL, `creditTerm` int NULL, `financialAmount` int NULL, `deliveryBy` varchar(255) NULL, `condition` varchar(255) NULL, `remark` varchar(255) NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `modifiedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `vender` (`id` varchar(36) NOT NULL, `type` varchar(255) NOT NULL, `ExCode` varchar(255) NOT NULL, `ExAcCode` varchar(255) NULL, `name` varchar(255) NOT NULL, `taxId` varchar(255) NULL, `branch` varchar(255) NULL, `address` varchar(255) NULL, `creditTerm` int NULL, `financialCondition` varchar(255) NULL, `financialAmount` int NULL, `contact` varchar(255) NULL, `telNumber` varchar(255) NULL, `remark` varchar(255) NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `modifiedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `vender`");
        await queryRunner.query("DROP TABLE `customer`");
        await queryRunner.query("ALTER TABLE `category` CHANGE `ExCode` `categoryExId` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `product` CHANGE `ExCode` `productExId` varchar(255) NOT NULL");
    }

}
