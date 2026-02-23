import {MigrationInterface, QueryRunner} from "typeorm";

export class addinSiderNote1767883137067 implements MigrationInterface {
    name = 'addinSiderNote1767883137067'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation_item` ADD `inSiderNote` varchar(255) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation_item` DROP COLUMN `inSiderNote`");
    }

}
