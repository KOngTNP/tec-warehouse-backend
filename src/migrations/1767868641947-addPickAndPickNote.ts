import {MigrationInterface, QueryRunner} from "typeorm";

export class addPickAndPickNote1767868641947 implements MigrationInterface {
    name = 'addPickAndPickNote1767868641947'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `compare_price` ADD `isPick` tinyint NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `compare_price` ADD `pickNote` varchar(255) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `compare_price` DROP COLUMN `pickNote`");
        await queryRunner.query("ALTER TABLE `compare_price` DROP COLUMN `isPick`");
    }

}
