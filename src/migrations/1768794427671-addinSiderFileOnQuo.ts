import {MigrationInterface, QueryRunner} from "typeorm";

export class addinSiderFileOnQuo1768794427671 implements MigrationInterface {
    name = 'addinSiderFileOnQuo1768794427671'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation` ADD `inSiderFile` text NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation` DROP COLUMN `inSiderFile`");
    }

}
