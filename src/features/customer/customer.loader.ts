import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';

import { CustomerDto } from './dto/customer.dto';
import { CustomerService } from './customer.service';
import _ from 'lodash';

@Injectable({ scope: Scope.TRANSIENT })
export class CustomerLoader  {
  constructor(private readonly customerService: CustomerService) {}

  generateDataLoader(): any {
    return new DataLoader<string, CustomerDto>(async (keys) => {
      const customers = await this.customerService.findByIds([...keys]);
      const group = _.keyBy(customers, 'id');
      return keys.map((id) => group[id] ?? null);
    });
  }
}
