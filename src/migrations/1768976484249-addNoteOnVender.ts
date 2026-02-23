import {MigrationInterface, QueryRunner} from "typeorm";

export class addNoteOnVender1768976484249 implements MigrationInterface {
    name = 'addNoteOnVender1768976484249'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `vender` ADD `note` text NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `vender` DROP COLUMN `note`");
    }

}
