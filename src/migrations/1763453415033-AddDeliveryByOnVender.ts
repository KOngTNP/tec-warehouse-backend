import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDeliveryByOnVender1763453415033 implements MigrationInterface {
    name = 'AddDeliveryByOnVender1763453415033'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `vender` ADD `deliveryBy` varchar(255) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `vender` DROP COLUMN `deliveryBy`");
    }

}
