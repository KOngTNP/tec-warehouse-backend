import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';

import _ from 'lodash';
import { ComparePriceDto } from './dto/compare-price.dto';
import { ComparePriceService } from './compare-price.service';
// compare-price.loader.ts
@Injectable({ scope: Scope.TRANSIENT })
export class ComparePriceLoader {
  constructor(private readonly comparePriceService: ComparePriceService) {}

  generateDataLoader(): DataLoader<string, ComparePriceDto[]> {
    return new DataLoader<string, ComparePriceDto[]>(async (qipIds) => {
      // ✅ 1. ตรวจสอบว่า findByQuotationItemProductIds คืนค่ามาจริงไหม
      const comparePrices = await this.comparePriceService.findByQuotationItemProductIds([...qipIds]);
      
      // ✅ 2. Group ด้วย quotationItemProductId
      const group = _.groupBy(comparePrices, 'quotationItemProductId');
      
      // ✅ 3. Map กลับตามลำดับ keys
      return qipIds.map((id) => group[id] ?? []);
    });
  }
}