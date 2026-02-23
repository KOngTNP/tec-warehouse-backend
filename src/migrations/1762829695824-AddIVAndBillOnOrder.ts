import {MigrationInterface, QueryRunner} from "typeorm";

export class AddIVAndBillOnOrder1762829695824 implements MigrationInterface {
    name = 'AddIVAndBillOnOrder1762829695824'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `order` ADD `invoiceNumber` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `order` ADD `billNumber` varchar(255) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `order` DROP COLUMN `billNumber`");
        await queryRunner.query("ALTER TABLE `order` DROP COLUMN `invoiceNumber`");
    }

}
