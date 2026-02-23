import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import _ from 'lodash';
import { QuotationItemProductDto } from './dto/quotation-item-product.dto';
import { QuotationItemProductService } from './quotation-item-product.service';


// quotation-item-product.loader.ts
@Injectable({ scope: Scope.TRANSIENT })
export class QuotationItemProductByQuotationItemIdLoader {
  constructor(private readonly quotationItemProductService: QuotationItemProductService) {}

  generateDataLoader(): any {
    return new DataLoader<string, QuotationItemProductDto[]>(
      async (keys) => {
        // 1. Service คืนค่าเป็น QuotationItemProductDto[][] ที่เรียงตามลำดับ keys มาให้แล้ว
        const results = await this.quotationItemProductService.findByQuotationItemIds(keys);
        
        // 2. คืนค่ากลับไปตรงๆ ได้เลย เพราะ Service แมพ keys.map(...) มาให้แล้ว
        // ห้าม groupBy ซ้ำ เพราะ results เป็น Array ของ Array
        return results; 
      },
      { cache: false },
    );
  }
}

@Injectable({ scope: Scope.TRANSIENT })
export class QuotationItemProductLoader {
  constructor(private readonly quotationItemProductService: QuotationItemProductService) {}

  generateDataLoader(): any {
    return new DataLoader<string, QuotationItemProductDto>(
      async (keys) => {
        const quotationItemProducts = await this.quotationItemProductService.findByIds(keys);
        const group = _.keyBy(quotationItemProducts, 'id');

        return keys.map((id) => group[id] ?? null);
      },
      { cache: false },
    );
  }
}
