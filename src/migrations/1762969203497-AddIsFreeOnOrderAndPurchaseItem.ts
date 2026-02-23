import {MigrationInterface, QueryRunner} from "typeorm";

export class AddIsFreeOnOrderAndPurchaseItem1762969203497 implements MigrationInterface {
    name = 'AddIsFreeOnOrderAndPurchaseItem1762969203497'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `order_item` ADD `isFree` tinyint NOT NULL DEFAULT 0");
        await queryRunner.query("ALTER TABLE `purchase_item` ADD `isFree` tinyint NOT NULL DEFAULT 0");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `purchase_item` DROP COLUMN `isFree`");
        await queryRunner.query("ALTER TABLE `order_item` DROP COLUMN `isFree`");
    }

}
