import {MigrationInterface, QueryRunner} from "typeorm";

export class Addfulltext21761892964913 implements MigrationInterface {
    name = 'Addfulltext21761892964913'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE FULLTEXT INDEX `IDX_1d5068d74bdb0a9d2d1d0c2942` ON `product` (`ExCode`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_1d5068d74bdb0a9d2d1d0c2942` ON `product`");
    }

}
