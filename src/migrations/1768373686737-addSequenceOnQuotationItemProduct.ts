import {MigrationInterface, QueryRunner} from "typeorm";

export class addSequenceOnQuotationItemProduct1768373686737 implements MigrationInterface {
    name = 'addSequenceOnQuotationItemProduct1768373686737'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation_item_product` ADD `sequence` int NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation_item_product` DROP COLUMN `sequence`");
    }

}
