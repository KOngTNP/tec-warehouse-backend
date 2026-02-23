import {MigrationInterface, QueryRunner} from "typeorm";

export class addisObsoleteOnQuoItem1768361281619 implements MigrationInterface {
    name = 'addisObsoleteOnQuoItem1768361281619'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation_item` ADD `isObsolete` tinyint NOT NULL DEFAULT 0");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation_item` DROP COLUMN `isObsolete`");
    }

}
