import {MigrationInterface, QueryRunner} from "typeorm";

export class addinSiderNoteQuo1767890636186 implements MigrationInterface {
    name = 'addinSiderNoteQuo1767890636186'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation` ADD `inSiderNote` varchar(255) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation` DROP COLUMN `inSiderNote`");
    }

}
