import {MigrationInterface, QueryRunner} from "typeorm";

export class addMoreUserType1767797729457 implements MigrationInterface {
    name = 'addMoreUserType1767797729457'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `userType` `userType` enum ('purchase', 'sales', 'admin') NOT NULL DEFAULT 'purchase'");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `userType` `userType` enum ('personal', 'admin') NOT NULL DEFAULT 'personal'");
    }

}
