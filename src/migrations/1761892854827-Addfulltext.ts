import {MigrationInterface, QueryRunner} from "typeorm";

export class Addfulltext1761892854827 implements MigrationInterface {
    name = 'Addfulltext1761892854827'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_22cc43e9a74d7498546e9a63e7` ON `product` (`name`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_29a733971f71626611bb3808eb` ON `product` (`description`)");
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_354107bf9d8c5b8d21ebdbd446` ON `order_item` (`sellName`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_354107bf9d8c5b8d21ebdbd446` ON `order_item`");
        await queryRunner.query("DROP INDEX `IDX_29a733971f71626611bb3808eb` ON `product`");
        await queryRunner.query("DROP INDEX `IDX_22cc43e9a74d7498546e9a63e7` ON `product`");
    }

}
