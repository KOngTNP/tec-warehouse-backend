import {MigrationInterface, QueryRunner} from "typeorm";

export class addQuotationDoc1767602472782 implements MigrationInterface {
    name = 'addQuotationDoc1767602472782'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `compare_price` ADD `quotations` text NULL");
        await queryRunner.query("ALTER TABLE `quotation` ADD `quotationDocuments` text NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation` DROP COLUMN `quotationDocuments`");
        await queryRunner.query("ALTER TABLE `compare_price` DROP COLUMN `quotations`");
    }

}
