import {MigrationInterface, QueryRunner} from "typeorm";

export class addLinkOnComparePrice1767782161686 implements MigrationInterface {
    name = 'addLinkOnComparePrice1767782161686'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `compare_price` ADD `link` text NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `compare_price` DROP COLUMN `link`");
    }

}
