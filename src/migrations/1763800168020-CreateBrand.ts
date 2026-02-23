import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateBrand1763800168020 implements MigrationInterface {
    name = 'CreateBrand1763800168020'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `brand` (`id` varchar(36) NOT NULL, `name` varchar(255) NOT NULL, `description` varchar(255) NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `modifiedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `deletedAt` datetime(6) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `product` ADD `brandId` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `product` ADD CONSTRAINT `FK_bb7d3d9dc1fae40293795ae39d6` FOREIGN KEY (`brandId`) REFERENCES `brand`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product` DROP FOREIGN KEY `FK_bb7d3d9dc1fae40293795ae39d6`");
        await queryRunner.query("ALTER TABLE `product` DROP COLUMN `brandId`");
        await queryRunner.query("DROP TABLE `brand`");
    }

}
