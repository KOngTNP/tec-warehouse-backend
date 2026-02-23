import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CategoryService } from './features/category/category.service';
import { ProductService } from './features/product/product.service';
import { ProductGroupService } from './features/product/product-group.service';
import { CustomerService } from './features/customer/customer.service';
import { VenderService } from './features/vender/vender.service';
import { OrderService } from './features/order/order.service';
import { OrderItemService } from './features/order/order-item.service';
import { PurchaseItemService } from './features/purchase/purchase-item.service';
import { RemarkService } from './features/remark/remark.service';
import { PurchaseService } from './features/purchase/purchase.service';
import * as fs from 'fs';
import * as path from 'path';
import { OrderIvService } from './features/order/order-iv.service';
import { PurchaseRrService } from './features/purchase/purchase-rr.service';

@Injectable()
export class ImportScheduler {
  private readonly logger = new Logger(ImportScheduler.name);

    private readonly DBF_SOURCE = "/app"; 
    private readonly DBF_BACKUP = "/app/dbf_backup";     // ที่จะก็อปไปเก็บ

  constructor(
    private readonly categoryService: CategoryService,
    private readonly productService: ProductService,
    private readonly productGroupService: ProductGroupService,
    private readonly customerService: CustomerService,
    private readonly venderService: VenderService,
    private readonly orderService: OrderService,
    private readonly orderItemService: OrderItemService,
    private readonly purchaseService: PurchaseService,
    private readonly purchaseItemService: PurchaseItemService,
    private readonly remarkService: RemarkService,
    private readonly orderIvService: OrderIvService,
    private readonly purchaseRrService: PurchaseRrService,
  ) {}

  // ⏰ รันทุกวันเวลา 02:30
  async handleImportAll() {
    const startTime = new Date();
    this.logger.log(`🚀 Starting DBF Import job at ${startTime.toLocaleString('th-TH')}`);
    this.copyDbfFiles();
    try {
      await this.categoryService.importCategoryFromDbf(
        'a618ee20-7099-4fb0-9793-c9efcdf1807e', // trerasit
        '/app/tec_dbf_files/istab.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tec_dbf_files/istab.DBF',
      );
    } catch (error) {
      this.logger.error('❌TEC - ERROR import Category From Dbf:', error);
    }
    try {
      await this.categoryService.importCategoryFromDbf(
         '887e6d2f-a266-4a0f-baf3-c6ece1f38210', // tanapol
        '/app/tm_dbf_files/istab.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tm_dbf_files/istab.DBF',
      );
    } catch (error) {
      this.logger.error('TM - ERROR import Category From Dbf:', error);
    }
// -------------------------------------------------------------------------
    try {
      await this.productService.importProductFromDbf(
        'a618ee20-7099-4fb0-9793-c9efcdf1807e', // trerasit
        '/app/tec_dbf_files/STMAS.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tec_dbf_files/STMAS.DBF',
      );
    } catch (error) {
      this.logger.error('❌ TEC - ERROR import Product From Dbf:', error);
    }
    try {
      await this.productService.importProductFromDbf(
        '887e6d2f-a266-4a0f-baf3-c6ece1f38210', // tanapol
        '/app/tm_dbf_files/STMAS.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tm_dbf_files/STMAS.DBF',
      );
    } catch (error) {
      this.logger.error('❌ TM - ERROR import Product From Dbf:', error);
    }
// -------------------------------------------------------------------------
    try {
      await this.productGroupService.importProductGroupFromDbf(
        'a618ee20-7099-4fb0-9793-c9efcdf1807e', // trerasit
        '/app/tec_dbf_files/STBOM.DBF',
       // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tec_dbf_files/STBOM.DBF',
      );
    } catch (error) {
      this.logger.error('❌TEC - ERROR import Product Group From Dbf:', error);
    }
    try {
      await this.productGroupService.importProductGroupFromDbf(
        '887e6d2f-a266-4a0f-baf3-c6ece1f38210', // tanapol
        '/app/tm_dbf_files/STBOM.DBF',
       // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tm_dbf_files/STBOM.DBF',
      );
    } catch (error) {
      this.logger.error('❌TM - ERROR import Product Group From Dbf:', error);
    }
// -------------------------------------------------------------------------
    try {
      await this.customerService.importCustomerFromDbf(
        'a618ee20-7099-4fb0-9793-c9efcdf1807e', // trerasit
        '/app/tec_dbf_files/ARMAS.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tec_dbf_files/ARMAS.DBF',
      );
    } catch (error) {
      this.logger.error('❌ TEC - ERROR import Customer From Dbf:', error);
    }
    try {
      await this.customerService.importCustomerFromDbf(
        '887e6d2f-a266-4a0f-baf3-c6ece1f38210', // tanapol
        '/app/tm_dbf_files/ARMAS.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tm_dbf_files/ARMAS.DBF',
      );
    } catch (error) {
      this.logger.error('❌ TM - ERROR import Customer From Dbf:', error);
    }
// -------------------------------------------------------------------------
    try {
      await this.venderService.importVenderFromDbf(
        'a618ee20-7099-4fb0-9793-c9efcdf1807e', // trerasit
        '/app/tec_dbf_files/apmas.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tec_dbf_files/apmas.DBF',
      );
    } catch (error) {
      this.logger.error('❌TEC - ERROR import Vender From Dbf:', error);
    }
    try {
      await this.venderService.importVenderFromDbf(
        '887e6d2f-a266-4a0f-baf3-c6ece1f38210', // tanapol
        '/app/tm_dbf_files/apmas.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tm_dbf_files/apmas.DBF',
      );
    } catch (error) {
      this.logger.error('TM - ERROR import Vender From Dbf:', error);
    }
// -------------------------------------------------------------------------
    try {
      await this.orderService.importOrderFromDbf(
        'a618ee20-7099-4fb0-9793-c9efcdf1807e', // trerasit
        '/app/tec_dbf_files/OESO.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tec_dbf_files/OESO.DBF',

        '/app/tec_dbf_files/ARTRN.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tec_dbf_files/ARTRN.DBF',
      );
    } catch (error) {
      this.logger.error('❌TEC - ERROR import Order From Dbf:', error);
    }
    try {
      await this.orderService.importOrderFromDbf(
        '887e6d2f-a266-4a0f-baf3-c6ece1f38210', // tanapol
        '/app/tm_dbf_files/OESO.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tm_dbf_files/OESO.DBF',

        '/app/tm_dbf_files/ARTRN.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tm_dbf_files/ARTRN.DBF',
      );
    } catch (error) {
      this.logger.error('TM - ERROR import Order From Dbf:', error);
    }
// -------------------------------------------------------------------------
    try {
      await this.orderItemService.importOrderItemFromDbf(
        'a618ee20-7099-4fb0-9793-c9efcdf1807e', // trerasit
        '/app/tec_dbf_files/OESOIT.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tec_dbf_files/OESOIT.DBF',

        '/app/tec_dbf_files/ARTRNRM.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tec_dbf_files/ARTRNRM.DBF',
      );
    } catch (error) {
      this.logger.error('❌TEC - ERROR import Order Item From Dbf:', error);
    }
    try {
      await this.orderItemService.importOrderItemFromDbf(
        '887e6d2f-a266-4a0f-baf3-c6ece1f38210', // tanapol
        '/app/tm_dbf_files/OESOIT.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tm_dbf_files/OESOIT.DBF',

        '/app/tm_dbf_files/ARTRNRM.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tm_dbf_files/ARTRNRM.DBF',
      );
    } catch (error) {
      this.logger.error('❌TM - ERROR import Order Item From Dbf:', error);
    }
// -------------------------------------------------------------------------
    try {
      await this.purchaseService.importPurchaseFromDbf(
        'a618ee20-7099-4fb0-9793-c9efcdf1807e', // trerasit
        '/app/tec_dbf_files/POPR.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tec_dbf_files/POPR.DBF',

        '/app/tec_dbf_files/APTRN.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tec_dbf_files/APTRN.DBF',
      );
    } catch (error) {
      this.logger.error('❌TEC - ERROR import Purchase From Dbf:', error);
    }
    try {
      await this.purchaseService.importPurchaseFromDbf(
        '887e6d2f-a266-4a0f-baf3-c6ece1f38210', // tanapol
        '/app/tm_dbf_files/POPR.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tm_dbf_files/POPR.DBF',

        '/app/tm_dbf_files/APTRN.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tm_dbf_files/APTRN.DBF',
      );
    } catch (error) {
      this.logger.error('TM - ERROR import Purchase From Dbf:', error);
    }
// -------------------------------------------------------------------------
    try {
      await this.purchaseItemService.importPurchaseItemFromDbf(
      'a618ee20-7099-4fb0-9793-c9efcdf1807e', // trerasit
      '/app/tec_dbf_files/POPRIT.DBF',
      // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tec_dbf_files/POPRIT.DBF',

      '/app/tec_dbf_files/ARTRNRM.DBF',
      // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tec_dbf_files/ARTRNRM.DBF',
      );
    } catch (error) {
      this.logger.error('❌TEC - ERROR import Purchase Item From Dbf:', error);
    }
    try {
      await this.purchaseItemService.importPurchaseItemFromDbf(
      '887e6d2f-a266-4a0f-baf3-c6ece1f38210', // tanapol
      '/app/tm_dbf_files/POPRIT.DBF',
      // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tm_dbf_files/POPRIT.DBF',

      '/app/tm_dbf_files/ARTRNRM.DBF',
      // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tm_dbf_files/ARTRNRM.DBF',
      );
    } catch (error) {
      this.logger.error('❌TM - ERROR import Purchase Item From Dbf:', error);
    }
// -------------------------------------------------------------------------
    try {
      await this.remarkService.importRemarkFromDbf(
        'a618ee20-7099-4fb0-9793-c9efcdf1807e', // trerasit
        '/app/tec_dbf_files/ARTRNRM.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tec_dbf_files/ARTRNRM.DBF',
      );
    } catch (error) {
      this.logger.error('❌TEC - ERROR import Remark From Dbf:', error);
    }
    try {
      await this.remarkService.importRemarkFromDbf(
         '887e6d2f-a266-4a0f-baf3-c6ece1f38210', // tanapol
        '/app/tm_dbf_files/ARTRNRM.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tm_dbf_files/ARTRNRM.DBF',
      );
    } catch (error) {
      this.logger.error('❌TM - ERROR import Remark From Dbf:', error);
    }
// -------------------------------------------------------------------------
    try {
      await this.orderIvService.importOrderIvFromDbf(
        'a618ee20-7099-4fb0-9793-c9efcdf1807e', // trerasit

        '/app/tec_dbf_files/STCRD.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tec_dbf_files/STCRD.DBF',
        '/app/tec_dbf_files/ARTRNRM.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tec_dbf_files/ARTRNRM.DBF',
      );
    } catch (error) {
      this.logger.error('❌TEC - ERROR Upload Order IV From Dbf:', error);
    }
    try {
      await this.orderIvService.importOrderIvFromDbf(
        '887e6d2f-a266-4a0f-baf3-c6ece1f38210', // tanapol

        '/app/tm_dbf_files/STCRD.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tm_dbf_files/STCRD.DBF',
        '/app/tm_dbf_files/ARTRNRM.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tm_dbf_files/ARTRNRM.DBF',
      );
    } catch (error) {
      this.logger.error('❌TM - ERROR Upload Order IV From Dbf:', error);
    }
// -------------------------------------------------------------------------
    try {
      await this.purchaseRrService.importPurchaseRrFromDbf(
        'a618ee20-7099-4fb0-9793-c9efcdf1807e', // trerasit
        '/app/tec_dbf_files/STCRD.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tec_dbf_files/STCRD.DBF',

        '/app/tec_dbf_files/ARTRNRM.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tec_dbf_files/ARTRNRM.DBF',
      );
    } catch (error) {
      this.logger.error('❌ ERROR Upload Purchase RR From Dbf:', error);
    }
    try {
      await this.purchaseRrService.importPurchaseRrFromDbf(
        '887e6d2f-a266-4a0f-baf3-c6ece1f38210', // tanapol
        '/app/tm_dbf_files/STCRD.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tm_dbf_files/STCRD.DBF',

        '/app/tm_dbf_files/ARTRNRM.DBF',
        // '/Users/kong-macbook/Documents/Work/TRERASIT/NEW-Project/warehouse/testdbf/tm_dbf_files/ARTRNRM.DBF',
      );
    } catch (error) {
      this.logger.error('❌ ERROR Upload Purchase RR From Dbf:', error);
    }
// -------------------------------------------------------------------------


    try {
      await this.productService.createProductSearchFile(
        'a618ee20-7099-4fb0-9793-c9efcdf1807e', // trerasit
      );
    } catch (error) {
      this.logger.error('❌ ERROR Upload Product search:', error);
    }

     try {
      await this.productService.createProductSearchFile(
        '887e6d2f-a266-4a0f-baf3-c6ece1f38210', // tanapol
      );
    } catch (error) {
      this.logger.error('❌ ERROR Upload Product search:', error);
    }

    const endTime = new Date();
    const durationMs = endTime.getTime() - startTime.getTime();

    // 🧮 แปลงเวลาเป็น ชั่วโมง นาที วินาที
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

    this.logger.log(`✅ All DBF imports completed successfully at ${endTime.toLocaleString('th-TH')}`);
    this.logger.log(`🕒 Total time used: ${hours} ชั่วโมง ${minutes} นาที ${seconds} วินาที`);
  }

private copyDbfFiles() {
  const sources = [
    { from: '/app/tec_dbf_files', to: '/app/dbf_backup/tec' },
    { from: '/app/tm_dbf_files', to: '/app/dbf_backup/tm' },
  ];

  for (const s of sources) {
    if (!fs.existsSync(s.from)) {
      this.logger.warn(`⚠️ Source not found: ${s.from}`);
      continue;
    }

    fs.mkdirSync(s.to, { recursive: true });
    fs.cpSync(s.from, s.to, { recursive: true, force: true });
  }

  this.logger.log('📦 Copied DBF folders successfully.');
}
}

