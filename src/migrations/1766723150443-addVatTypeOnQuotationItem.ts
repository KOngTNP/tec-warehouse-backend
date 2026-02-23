import {MigrationInterface, QueryRunner} from "typeorm";

export class addVatTypeOnQuotationItem1766723150443 implements MigrationInterface {
    name = 'addVatTypeOnQuotationItem1766723150443'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation_item` ADD `vatType` varchar(255) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation_item` DROP COLUMN `vatType`");
    }

}
