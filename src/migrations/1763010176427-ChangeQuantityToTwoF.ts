import {MigrationInterface, QueryRunner} from "typeorm";

export class ChangeQuantityToTwoF1763010176427 implements MigrationInterface {
    name = 'ChangeQuantityToTwoF1763010176427'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `order_item` DROP COLUMN `quantity`");
        await queryRunner.query("ALTER TABLE `order_item` ADD `quantity` decimal(10,2) NOT NULL");
        await queryRunner.query("ALTER TABLE `purchase_item` DROP COLUMN `quantity`");
        await queryRunner.query("ALTER TABLE `purchase_item` ADD `quantity` decimal(10,2) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `purchase_item` DROP COLUMN `quantity`");
        await queryRunner.query("ALTER TABLE `purchase_item` ADD `quantity` int NOT NULL");
        await queryRunner.query("ALTER TABLE `order_item` DROP COLUMN `quantity`");
        await queryRunner.query("ALTER TABLE `order_item` ADD `quantity` int NOT NULL");
    }

}
