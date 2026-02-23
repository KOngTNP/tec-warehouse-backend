import {MigrationInterface, QueryRunner} from "typeorm";

export class addPoNumber1767957111218 implements MigrationInterface {
    name = 'addPoNumber1767957111218'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `compare_price` ADD `poNumber` varchar(255) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `compare_price` DROP COLUMN `poNumber`");
    }

}
