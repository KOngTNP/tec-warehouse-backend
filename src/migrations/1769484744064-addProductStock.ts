import {MigrationInterface, QueryRunner} from "typeorm";

export class addProductStock1769484744064 implements MigrationInterface {
    name = 'addProductStock1769484744064'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product` ADD `stock` decimal(10,2) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product` DROP COLUMN `stock`");
    }

}
