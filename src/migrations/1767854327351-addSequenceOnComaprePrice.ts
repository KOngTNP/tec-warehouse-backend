import {MigrationInterface, QueryRunner} from "typeorm";

export class addSequenceOnComaprePrice1767854327351 implements MigrationInterface {
    name = 'addSequenceOnComaprePrice1767854327351'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `compare_price` ADD `sequence` int NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `compare_price` DROP COLUMN `sequence`");
    }

}
