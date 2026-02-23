import {MigrationInterface, QueryRunner} from "typeorm";

export class AddPurchaseNumberOnPurchase1762833877542 implements MigrationInterface {
    name = 'AddPurchaseNumberOnPurchase1762833877542'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `purchase` ADD `purchaseNumber` varchar(255) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `purchase` DROP COLUMN `purchaseNumber`");
    }

}
