import {MigrationInterface, QueryRunner} from "typeorm";

export class addOutOfStock1767872387659 implements MigrationInterface {
    name = 'addOutOfStock1767872387659'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `compare_price` ADD `isOutOfStock` tinyint NOT NULL DEFAULT 0");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `compare_price` DROP COLUMN `isOutOfStock`");
    }

}
