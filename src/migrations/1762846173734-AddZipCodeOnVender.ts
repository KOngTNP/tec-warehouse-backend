import {MigrationInterface, QueryRunner} from "typeorm";

export class AddZipCodeOnVender1762846173734 implements MigrationInterface {
    name = 'AddZipCodeOnVender1762846173734'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `vender` ADD `zipCode` varchar(255) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `vender` DROP COLUMN `zipCode`");
    }

}
