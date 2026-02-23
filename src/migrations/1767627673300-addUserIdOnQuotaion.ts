import {MigrationInterface, QueryRunner} from "typeorm";

export class addUserIdOnQuotaion1767627673300 implements MigrationInterface {
    name = 'addUserIdOnQuotaion1767627673300'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation` ADD `userId` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `quotation` ADD CONSTRAINT `FK_51b72884f40b6b63563b7a7efad` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `quotation` DROP FOREIGN KEY `FK_51b72884f40b6b63563b7a7efad`");
        await queryRunner.query("ALTER TABLE `quotation` DROP COLUMN `userId`");
    }

}
