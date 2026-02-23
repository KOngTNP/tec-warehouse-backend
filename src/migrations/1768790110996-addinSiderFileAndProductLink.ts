import {MigrationInterface, QueryRunner} from "typeorm";

export class addinSiderFileAndProductLink1768790110996 implements MigrationInterface {
    name = 'addinSiderFileAndProductLink1768790110996'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation_item` ADD `inSiderFile` text NULL");
        await queryRunner.query("ALTER TABLE `quotation_item` ADD `productLink` varchar(255) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation_item` DROP COLUMN `productLink`");
        await queryRunner.query("ALTER TABLE `quotation_item` DROP COLUMN `inSiderFile`");
    }

}
