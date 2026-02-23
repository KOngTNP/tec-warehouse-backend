import {MigrationInterface, QueryRunner} from "typeorm";

export class editQuantityOnQuotationItem1766486748859 implements MigrationInterface {
    name = 'editQuantityOnQuotationItem1766486748859'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation_item` DROP COLUMN `quantity`");
        await queryRunner.query("ALTER TABLE `quotation_item` ADD `quantity` int NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation_item` DROP COLUMN `quantity`");
        await queryRunner.query("ALTER TABLE `quotation_item` ADD `quantity` varchar(255) NULL");
    }

}
