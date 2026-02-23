import {MigrationInterface, QueryRunner} from "typeorm";

export class debug51768822806834 implements MigrationInterface {
    name = 'debug51768822806834'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE INDEX `IDX_vender_excode_companyid` ON `vender` (`ExCode`, `companyId`)");
        await queryRunner.query("CREATE INDEX `IDX_vender_companyId` ON `vender` (`companyId`)");
        await queryRunner.query("CREATE INDEX `IDX_purchase_venderId` ON `purchase` (`venderId`)");
        await queryRunner.query("CREATE INDEX `IDX_purchase_documentNumber_companyid` ON `purchase` (`documentNumber`, `companyId`)");
        await queryRunner.query("CREATE INDEX `IDX_purchase_companyId` ON `purchase` (`companyId`)");
        await queryRunner.query("CREATE INDEX `IDX_order_customerId` ON `order` (`customerId`)");
        await queryRunner.query("CREATE INDEX `IDX_order_documentNumber_companyid` ON `order` (`documentNumber`, `companyId`)");
        await queryRunner.query("CREATE INDEX `IDX_order_companyId` ON `order` (`companyId`)");
        await queryRunner.query("CREATE INDEX `IDX_customer_excode_companyid` ON `customer` (`ExCode`, `companyId`)");
        await queryRunner.query("CREATE INDEX `IDX_customer_companyId` ON `customer` (`companyId`)");
        await queryRunner.query("CREATE INDEX `IDX_category_excode_companyid` ON `category` (`ExCode`, `companyId`)");
        await queryRunner.query("CREATE INDEX `IDX_category_companyId` ON `category` (`companyId`)");
        await queryRunner.query("CREATE INDEX `IDX_product_categoryId` ON `product` (`categoryId`)");
        await queryRunner.query("CREATE INDEX `IDX_product_excode_companyid` ON `product` (`ExCode`, `companyId`)");
        await queryRunner.query("CREATE INDEX `IDX_product_companyId` ON `product` (`companyId`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_product_companyId` ON `product`");
        await queryRunner.query("DROP INDEX `IDX_product_excode_companyid` ON `product`");
        await queryRunner.query("DROP INDEX `IDX_product_categoryId` ON `product`");
        await queryRunner.query("DROP INDEX `IDX_category_companyId` ON `category`");
        await queryRunner.query("DROP INDEX `IDX_category_excode_companyid` ON `category`");
        await queryRunner.query("DROP INDEX `IDX_customer_companyId` ON `customer`");
        await queryRunner.query("DROP INDEX `IDX_customer_excode_companyid` ON `customer`");
        await queryRunner.query("DROP INDEX `IDX_order_companyId` ON `order`");
        await queryRunner.query("DROP INDEX `IDX_order_documentNumber_companyid` ON `order`");
        await queryRunner.query("DROP INDEX `IDX_order_customerId` ON `order`");
        await queryRunner.query("DROP INDEX `IDX_purchase_companyId` ON `purchase`");
        await queryRunner.query("DROP INDEX `IDX_purchase_documentNumber_companyid` ON `purchase`");
        await queryRunner.query("DROP INDEX `IDX_purchase_venderId` ON `purchase`");
        await queryRunner.query("DROP INDEX `IDX_vender_companyId` ON `vender`");
        await queryRunner.query("DROP INDEX `IDX_vender_excode_companyid` ON `vender`");
    }

}
