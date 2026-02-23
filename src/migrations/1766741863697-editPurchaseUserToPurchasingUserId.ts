import {MigrationInterface, QueryRunner} from "typeorm";

export class editPurchaseUserToPurchasingUserId1766741863697 implements MigrationInterface {
    name = 'editPurchaseUserToPurchasingUserId1766741863697'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation` CHANGE `purchaseUserId` `purchaseingUserId` varchar(255) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation` CHANGE `purchaseingUserId` `purchaseUserId` varchar(255) NULL");
    }

}
