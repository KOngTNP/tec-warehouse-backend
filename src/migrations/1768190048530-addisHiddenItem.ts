import {MigrationInterface, QueryRunner} from "typeorm";

export class addisHiddenItem1768190048530 implements MigrationInterface {
    name = 'addisHiddenItem1768190048530'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation_item` ADD `isHidden` tinyint NOT NULL DEFAULT 0");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation_item` DROP COLUMN `isHidden`");
    }

}
