import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import _ from 'lodash';

import {
  QuotationDto,
} from './dto/quotation.dto';
import { QuotationService } from './quotation.service';


@Injectable({ scope: Scope.TRANSIENT })
export class QuotationByCustomerIdLoader
{
  constructor(private readonly quotationService: QuotationService) {}

  generateDataLoader(): any {
    return new DataLoader<string, QuotationDto[]>(
      async (keys) => {
        const quotations = await this.quotationService.findByCustomerIds(keys);
        const group = _.groupBy(quotations, 'customerId');
        return keys.map((id) => group[id as string] ?? null);
      },
      { cache: false },
    );
  }
}


@Injectable({ scope: Scope.TRANSIENT })
export class QuotationByPurchasingUserIdLoader
{
  constructor(private readonly quotationService: QuotationService) {}

  generateDataLoader(): any {
    return new DataLoader<string, QuotationDto[]>(
      async (keys) => {
        const quotations = await this.quotationService.findByPurchasingUserIds(keys);
        const group = _.groupBy(quotations, 'purchasingUserId');
        return keys.map((id) => group[id as string] ?? null);
      },
      { cache: false },
    );
  }
}

@Injectable({ scope: Scope.TRANSIENT })
export class QuotationByEndUserIdLoader
{
  constructor(private readonly quotationService: QuotationService) {}

  generateDataLoader(): any {
    return new DataLoader<string, QuotationDto[]>(
      async (keys) => {
        const quotations = await this.quotationService.findByEndUserIds(keys);
        const group = _.groupBy(quotations, 'endUserId');
        return keys.map((id) => group[id as string] ?? null);
      },
      { cache: false },
    );
  }
}

@Injectable({ scope: Scope.TRANSIENT })
export class QuotationLoader {
  constructor(private readonly quotationService: QuotationService) {}

  generateDataLoader(): any {
    return new DataLoader<string, QuotationDto>(
      async (keys) => {
        const quotations = await this.quotationService.findByIds(keys);
        const group = _.keyBy(quotations, 'id');

        return keys.map((id) => group[id] ?? null);
      },
      { cache: false },
    );
  }
}
