import {MigrationInterface, QueryRunner} from "typeorm";

export class addCurrencyOnComparePrice1766747215576 implements MigrationInterface {
    name = 'addCurrencyOnComparePrice1766747215576'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `compare_price` ADD `currency` varchar(255) NOT NULL DEFAULT 'THB'");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `compare_price` DROP COLUMN `currency`");
    }

}
