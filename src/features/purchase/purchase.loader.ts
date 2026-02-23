import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import _ from 'lodash';

import {
  PurchaseDto,
} from './dto/purchase.dto';
import { PurchaseService } from './purchase.service';


@Injectable({ scope: Scope.TRANSIENT })
export class PurchaseByVenderLoader
{
  constructor(private readonly purchaseService: PurchaseService) {}

  generateDataLoader(): any {
    return new DataLoader<string, PurchaseDto[]>(
      async (keys) => {
        const purchases = await this.purchaseService.findByVenderIds(keys);
        const group = _.groupBy(purchases, 'venderId');
        return keys.map((id) => group[id as string] ?? null);
      },
      { cache: false },
    );
  }
}

@Injectable({ scope: Scope.TRANSIENT })
export class PurchaseByIdLoader {
  constructor(private readonly purchaseService: PurchaseService) {}

  generateDataLoader(): any {
    return new DataLoader<string, PurchaseDto>(
      async (keys) => {
        const purchases = await this.purchaseService.findByIds(keys);
        const group = _.keyBy(purchases, 'id');

        return keys.map((id) => group[id] ?? null);
      },
      { cache: false },
    );
  }
}
