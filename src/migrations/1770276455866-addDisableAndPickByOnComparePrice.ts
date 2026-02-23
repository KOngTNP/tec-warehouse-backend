import {MigrationInterface, QueryRunner} from "typeorm";

export class addDisableAndPickByOnComparePrice1770276455866 implements MigrationInterface {
    name = 'addDisableAndPickByOnComparePrice1770276455866'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `compare_price` ADD `isDisable` tinyint NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `compare_price` ADD `disableNote` text NULL");
        await queryRunner.query("ALTER TABLE `compare_price` ADD `pickBy` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `compare_price` ADD `disableBy` varchar(255) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `compare_price` DROP COLUMN `disableBy`");
        await queryRunner.query("ALTER TABLE `compare_price` DROP COLUMN `pickBy`");
        await queryRunner.query("ALTER TABLE `compare_price` DROP COLUMN `disableNote`");
        await queryRunner.query("ALTER TABLE `compare_price` DROP COLUMN `isDisable`");
    }

}
