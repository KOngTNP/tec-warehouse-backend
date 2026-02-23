import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import _ from 'lodash';

import {
  PurchaseDto,
} from './dto/purchase.dto';
import { PurchaseService } from './purchase.service';
import { PurchaseItemService } from './purchase-item.service';
import { PurchaseItemDto } from './dto/purchase-item.dto';


@Injectable({ scope: Scope.TRANSIENT })
export class PurchaseItemByPurchaseLoader
{
  constructor(private readonly purchaseItemService: PurchaseItemService) {}

  generateDataLoader(): any {
    return new DataLoader<string, PurchaseDto[]>(
      async (keys) => {
        const purchases = await this.purchaseItemService.findByPurchaseIds(keys);
        const group = _.groupBy(purchases, 'purchaseId');
        return keys.map((id) => group[id as string] ?? null);
      },
      { cache: false },
    );
  }
}


@Injectable({ scope: Scope.TRANSIENT })
export class PurchaseItemByProductLoader
{
  constructor(private readonly purchaseItemService: PurchaseItemService) {}

  generateDataLoader(): any {
    return new DataLoader<string, PurchaseItemDto[]>(
      async (keys) => {
        const purchases = await this.purchaseItemService.findByProductIds(keys);
        const group = _.groupBy(purchases, 'productId');
        return keys.map((id) => group[id as string] ?? null);
      },
      { cache: false },
    );
  }
}


@Injectable({ scope: Scope.TRANSIENT })
export class PurchaseItemByIdLoader {
  constructor(private readonly purchaseItemService: PurchaseItemService) {}

  generateDataLoader(): any {
    return new DataLoader<string, PurchaseItemDto>(
      async (keys) => {
        const purchases = await this.purchaseItemService.findByIds(keys);
        const group = _.keyBy(purchases, 'id');

        return keys.map((id) => group[id] ?? null);
      },
      { cache: false },
    );
  }
}
