import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import _ from 'lodash';

import {
  OrderDto,
} from './dto/order.dto';
import { OrderService } from './order.service';
import { OrderItemService } from './order-item.service';
import { OrderItemDto } from './dto/order-item.dto';


@Injectable({ scope: Scope.TRANSIENT })
export class OrderItemByOrderLoader
{
  constructor(private readonly orderItemService: OrderItemService) {}

  generateDataLoader(): any {
    return new DataLoader<string, OrderDto[]>(
      async (keys) => {
        const orders = await this.orderItemService.findByOrderIds(keys);
        const group = _.groupBy(orders, 'orderId');
        return keys.map((id) => group[id as string] ?? null);
      },
      { cache: false },
    );
  }
}


@Injectable({ scope: Scope.TRANSIENT })
export class OrderItemByProductLoader
{
  constructor(private readonly orderItemService: OrderItemService) {}

  generateDataLoader(): any {
    return new DataLoader<string, OrderItemDto[]>(
      async (keys) => {
        const orders = await this.orderItemService.findByProductIds(keys);
        const group = _.groupBy(orders, 'productId');
        return keys.map((id) => group[id as string] ?? null);
      },
      { cache: false },
    );
  }
}


@Injectable({ scope: Scope.TRANSIENT })
export class OrderItemByIdLoader {
  constructor(private readonly orderItemService: OrderItemService) {}

  generateDataLoader(): any {
    return new DataLoader<string, OrderItemDto>(
      async (keys) => {
        const orders = await this.orderItemService.findByIds(keys);
        const group = _.keyBy(orders, 'id');

        return keys.map((id) => group[id] ?? null);
      },
      { cache: false },
    );
  }
}
