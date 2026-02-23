import {MigrationInterface, QueryRunner} from "typeorm";

export class AddProductImages1765003863841 implements MigrationInterface {
    name = 'AddProductImages1765003863841'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product` ADD `images` text NULL");
        await queryRunner.query("ALTER TABLE `product` ADD `videos` text NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product` DROP COLUMN `videos`");
        await queryRunner.query("ALTER TABLE `product` DROP COLUMN `images`");
    }

}
