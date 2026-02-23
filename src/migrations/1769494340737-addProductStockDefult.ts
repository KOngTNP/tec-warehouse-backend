import {MigrationInterface, QueryRunner} from "typeorm";

export class addProductStockDefult1769494340737 implements MigrationInterface {
    name = 'addProductStockDefult1769494340737'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product` CHANGE `stock` `stock` decimal(10,2) NOT NULL DEFAULT '0.00'");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product` CHANGE `stock` `stock` decimal(10,2) NOT NULL");
    }

}
