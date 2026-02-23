import {
  Args,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { OrderIvService } from './order-iv.service';
import { OrderIvDto } from './dto/order-iv.dto';
import { ProductDto } from '../product/dto/product.dto';
import DataLoader from 'dataloader';
import { createPaginatedResponse } from 'src/shared/pagination/pagination.utils';
import { PaginationArgs } from 'src/shared/pagination/pagination.args';
import { Loader } from 'nestjs-dataloader';
import { ProductLoader } from '../product/product.loader';
import { OrderItemDto } from './dto/order-item.dto';
@Resolver(() => OrderIvDto)
export class OrderIvResolver {
  constructor(
    private orderIvService: OrderIvService,
  ) {}
  @Query(() => [OrderIvDto])
  async getOrderIvsByOrderIdAndProductId(
    @Args('orderId') orderId: string,
    @Args('productId') productId: string,
  ): Promise<OrderIvDto[]> {
    const items = await this.orderIvService.findByOrderIdAndProductId(
      orderId,
      productId,
    );
    return items;
  }



  @Query(() => [OrderIvDto])
  async getOrderIvsByOrderId(
    @Args('orderId') orderId: string,
    
  ): Promise<OrderIvDto[]> {
    const items = await this.orderIvService.findByOrderId(
      orderId,
    );
    return items;
  } 


  @Query(() => [OrderIvDto])
  async getOrderIvsByDocumentNumber(
    @Args('documentNumber') documentNumber: string,
    @Args('companyId', {type: () => String, nullable:true}) companyId?:string,
  ): Promise<OrderIvDto[]> {
    const items = await this.orderIvService.findByDocumentNumber(
      documentNumber,
      companyId,
    );
    return items;
  }

}
