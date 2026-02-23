import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateProductGroup1762483666949 implements MigrationInterface {
    name = 'CreateProductGroup1762483666949'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `product_group` (`id` varchar(36) NOT NULL, `parentProductId` varchar(255) NULL, `childProductId` varchar(255) NULL, `seqNumber` int NULL, `quantity` decimal(10,2) NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `modifiedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `product` ADD `isGroup` tinyint NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `product_group` ADD CONSTRAINT `FK_b294611693182ff9aa1d22affd2` FOREIGN KEY (`parentProductId`) REFERENCES `product`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `product_group` ADD CONSTRAINT `FK_bfd5b04a1be8d0739a8fe957eac` FOREIGN KEY (`childProductId`) REFERENCES `product`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product_group` DROP FOREIGN KEY `FK_bfd5b04a1be8d0739a8fe957eac`");
        await queryRunner.query("ALTER TABLE `product_group` DROP FOREIGN KEY `FK_b294611693182ff9aa1d22affd2`");
        await queryRunner.query("ALTER TABLE `product` DROP COLUMN `isGroup`");
        await queryRunner.query("DROP TABLE `product_group`");
    }

}
