import {MigrationInterface, QueryRunner} from "typeorm";

export class editPuchasingUserAndEndUserCustomerId1766474323632 implements MigrationInterface {
    name = 'editPuchasingUserAndEndUserCustomerId1766474323632'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `purchasing_user` DROP COLUMN `companyId`");
        await queryRunner.query("ALTER TABLE `end_user` DROP COLUMN `companyId`");
        await queryRunner.query("ALTER TABLE `purchasing_user` DROP FOREIGN KEY `FK_87538edf5aa2a1ae14477fd91f1`");
        await queryRunner.query("ALTER TABLE `purchasing_user` DROP COLUMN `customerId`");
        await queryRunner.query("ALTER TABLE `purchasing_user` ADD `customerId` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `end_user` DROP FOREIGN KEY `FK_7bc4e34bb48cfbdde8664700b1f`");
        await queryRunner.query("ALTER TABLE `end_user` DROP COLUMN `customerId`");
        await queryRunner.query("ALTER TABLE `end_user` ADD `customerId` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `purchasing_user` ADD CONSTRAINT `FK_87538edf5aa2a1ae14477fd91f1` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `end_user` ADD CONSTRAINT `FK_7bc4e34bb48cfbdde8664700b1f` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `end_user` DROP FOREIGN KEY `FK_7bc4e34bb48cfbdde8664700b1f`");
        await queryRunner.query("ALTER TABLE `purchasing_user` DROP FOREIGN KEY `FK_87538edf5aa2a1ae14477fd91f1`");
        await queryRunner.query("ALTER TABLE `end_user` DROP COLUMN `customerId`");
        await queryRunner.query("ALTER TABLE `end_user` ADD `customerId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `end_user` ADD CONSTRAINT `FK_7bc4e34bb48cfbdde8664700b1f` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `purchasing_user` DROP COLUMN `customerId`");
        await queryRunner.query("ALTER TABLE `purchasing_user` ADD `customerId` varchar(36) NULL");
        await queryRunner.query("ALTER TABLE `purchasing_user` ADD CONSTRAINT `FK_87538edf5aa2a1ae14477fd91f1` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `end_user` ADD `companyId` varchar(255) NULL");
        await queryRunner.query("ALTER TABLE `purchasing_user` ADD `companyId` varchar(255) NULL");
    }

}
