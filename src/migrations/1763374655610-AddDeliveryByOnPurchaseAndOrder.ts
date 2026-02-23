import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDeliveryByOnPurchaseAndOrder1763374655610 implements MigrationInterface {
    name = 'AddDeliveryByOnPurchaseAndOrder1763374655610'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `order` ADD `deliveryBy` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `purchase` ADD `deliveryBy` varchar(255) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `purchase` DROP COLUMN `deliveryBy`");
        await queryRunner.query("ALTER TABLE `order` DROP COLUMN `deliveryBy`");
    }

}
