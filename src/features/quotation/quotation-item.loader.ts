import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import _ from 'lodash';

import { QuotationItemDto } from './dto/quotation-item.dto';
import { QuotationItemService } from './quotation-item.service';




@Injectable({ scope: Scope.TRANSIENT })
export class QuotationItemByQuotationIdLoader {
  constructor(private readonly quotationItemService: QuotationItemService) {}

  generateDataLoader(): any {
    return new DataLoader<string, QuotationItemDto[]>(
      async (keys) => {
        // ดึงรายการสินค้าทั้งหมด (Flat List)
        const allItems = await this.quotationItemService.findByQuotationIds(keys);

        // จัดกลุ่มด้วยคีย์ 'quotationId'
        // ตรวจสอบว่าใน QuotationItemDto มี property ชื่อ quotationId ตรงกันเป๊ะ
        const group = _.groupBy(allItems, 'quotationId'); 
        
        // คืนค่ากลับไปตามลำดับ keys ที่ส่งมา (ถ้าไม่มีให้คืนอาเรย์ว่าง [])
        return keys.map((id) => group[id] || []); 
      },
      { cache: false },
    );
  }
}

@Injectable({ scope: Scope.TRANSIENT })
export class QuotationItemLoader {
  constructor(private readonly quotationItemService: QuotationItemService) {}

  generateDataLoader(): any {
    return new DataLoader<string, QuotationItemDto>(
      async (keys) => {
        const quotationItems = await this.quotationItemService.findByIds(keys);
        const group = _.keyBy(quotationItems, 'id');

        return keys.map((id) => group[id] ?? null);
      },
      { cache: false },
    );
  }
}
