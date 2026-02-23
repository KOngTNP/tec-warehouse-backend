import {MigrationInterface, QueryRunner} from "typeorm";

export class AddSellNameAndBuyName1763607112666 implements MigrationInterface {
    name = 'AddSellNameAndBuyName1763607112666'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `order_iv` ADD `sellName` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `purchase_rr` ADD `buyName` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `purchase_item` ADD `buyName` varchar(255) NOT NULL");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_82abc8f5af9852d7cc317e61f2` ON `order_iv` (`sellName`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_40d3caff98cffbe4652816807c` ON `purchase_rr` (`buyName`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_556e24546ce959df1cffd0deed` ON `purchase_item` (`buyName`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_556e24546ce959df1cffd0deed` ON `purchase_item`");
        await queryRunner.query("DROP INDEX `IDX_40d3caff98cffbe4652816807c` ON `purchase_rr`");
        await queryRunner.query("DROP INDEX `IDX_82abc8f5af9852d7cc317e61f2` ON `order_iv`");
        await queryRunner.query("ALTER TABLE `purchase_item` DROP COLUMN `buyName`");
        await queryRunner.query("ALTER TABLE `purchase_rr` DROP COLUMN `buyName`");
        await queryRunner.query("ALTER TABLE `order_iv` DROP COLUMN `sellName`");
    }

}
