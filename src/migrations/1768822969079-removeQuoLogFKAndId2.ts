import {MigrationInterface, QueryRunner} from "typeorm";

export class removeQuoLogFKAndId21768822969079 implements MigrationInterface {
    name = 'removeQuoLogFKAndId21768822969079'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `FK_8ae7866614a4033bbf3199d25d2` ON `quotation_log`");
        await queryRunner.query("ALTER TABLE `quotation_log` CHANGE `effectedId` `affectedId` varchar(255) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation_log` CHANGE `affectedId` `effectedId` varchar(255) NULL");
        await queryRunner.query("CREATE INDEX `FK_8ae7866614a4033bbf3199d25d2` ON `quotation_log` (`effectedId`)");
    }

}
