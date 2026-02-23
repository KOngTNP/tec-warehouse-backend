import {MigrationInterface, QueryRunner} from "typeorm";

export class AddActualQuantity1764302383992 implements MigrationInterface {
    name = 'AddActualQuantity1764302383992'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `order_item` ADD `actualQuantity` decimal(10,2) NOT NULL");
        await queryRunner.query("ALTER TABLE `purchase_item` ADD `actualQuantity` decimal(10,2) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `purchase_item` DROP COLUMN `actualQuantity`");
        await queryRunner.query("ALTER TABLE `order_item` DROP COLUMN `actualQuantity`");
    }

}
