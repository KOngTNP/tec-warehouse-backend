import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDeletaAtOnProductGroup1763008028535 implements MigrationInterface {
    name = 'AddDeletaAtOnProductGroup1763008028535'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product_group` ADD `deletedAt` datetime(6) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product_group` DROP COLUMN `deletedAt`");
    }

}
