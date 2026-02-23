import {MigrationInterface, QueryRunner} from "typeorm";

export class addDetailOnProduct1766749366519 implements MigrationInterface {
    name = 'addDetailOnProduct1766749366519'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `product` ADD `detail` varchar(255) NULL");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_13fef6b47ad0ae48baf8e2fcbd` ON `product` (`detail`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_13fef6b47ad0ae48baf8e2fcbd` ON `product`");
        await queryRunner.query("ALTER TABLE `product` DROP COLUMN `detail`");
    }

}
