import {MigrationInterface, QueryRunner} from "typeorm";

export class removeQuoLogFKAndId1768822921820 implements MigrationInterface {
    name = 'removeQuoLogFKAndId1768822921820'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation_log` DROP FOREIGN KEY `FK_8ae7866614a4033bbf3199d25d2`");
        await queryRunner.query("ALTER TABLE `quotation_log` CHANGE `quotationId` `effectedId` varchar(255) NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation_log` CHANGE `effectedId` `quotationId` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `quotation_log` ADD CONSTRAINT `FK_8ae7866614a4033bbf3199d25d2` FOREIGN KEY (`quotationId`) REFERENCES `quotation`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

}
