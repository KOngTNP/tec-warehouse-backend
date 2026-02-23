import {MigrationInterface, QueryRunner} from "typeorm";

export class AddActualQuantity21764315144053 implements MigrationInterface {
    name = 'AddActualQuantity21764315144053'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `order_iv` ADD `actualQuantity` decimal(10,2) NOT NULL");
        await queryRunner.query("ALTER TABLE `purchase_rr` ADD `actualQuantity` decimal(10,2) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `purchase_rr` DROP COLUMN `actualQuantity`");
        await queryRunner.query("ALTER TABLE `order_iv` DROP COLUMN `actualQuantity`");
    }

}
