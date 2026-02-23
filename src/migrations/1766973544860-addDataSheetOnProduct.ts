import {MigrationInterface, QueryRunner} from "typeorm";

export class addDataSheetOnProduct1766973544860 implements MigrationInterface {
    name = 'addDataSheetOnProduct1766973544860'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product` ADD `dataSheets` text NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product` DROP COLUMN `dataSheets`");
    }

}
