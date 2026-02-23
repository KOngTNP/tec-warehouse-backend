import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import _ from 'lodash';

import {
  OrderDto,
} from './dto/order.dto';
import { OrderService } from './order.service';


@Injectable({ scope: Scope.TRANSIENT })
export class OrderByCustomerLoader
{
  constructor(private readonly orderService: OrderService) {}

  generateDataLoader(): any {
    return new DataLoader<string, OrderDto[]>(
      async (keys) => {
        const orders = await this.orderService.findByCustomerIds(keys);
        const group = _.groupBy(orders, 'customerId');
        return keys.map((id) => group[id as string] ?? null);
      },
      { cache: false },
    );
  }
}

@Injectable({ scope: Scope.TRANSIENT })
export class OrderByIdLoader {
  constructor(private readonly orderService: OrderService) {}

  generateDataLoader(): any {
    return new DataLoader<string, OrderDto>(
      async (keys) => {
        const orders = await this.orderService.findByIds(keys);
        const group = _.keyBy(orders, 'id');

        return keys.map((id) => group[id] ?? null);
      },
      { cache: false },
    );
  }
}
