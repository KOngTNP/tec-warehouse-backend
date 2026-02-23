import {
  Args,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { OrderService } from './order.service';
import { OrderDto, PaginatedOrder } from './dto/order.dto';
import { PaginationArgs } from 'src/shared/pagination/pagination.args';
import { createPaginatedResponse } from 'src/shared/pagination/pagination.utils';
import { CustomerDto } from '../customer/dto/customer.dto';
import { Loader } from 'nestjs-dataloader';
import DataLoader from 'dataloader';
import { CustomerLoader } from '../customer/customer.loader';
import { OrderItemDto } from './dto/order-item.dto';
import { OrderItemByOrderLoader } from './order-item.loader';
@Resolver(() => OrderDto)
export class OrderResolver {
  constructor(
    private orderService: OrderService,
  ) {}
  @Query(() => PaginatedOrder, { description: 'Retrieve all orders' })
  async getAllOrders(
    @Args() args: PaginationArgs,
    @Args('companyId', {type: () => String, nullable:true}) companyId?:string,
  ): Promise<PaginatedOrder> {
    const [result, count] = await this.orderService.findAll(
      {
        limit: args.limit,
        offset: args.offset,
        companyId: companyId
      },
    );
    // console.log('result', createPaginatedResponse<OrderDto>(
    //   result,
    //   count,
    //   args.limit,
    //   args.offset,
    // ));
    return createPaginatedResponse<OrderDto>(
      result,
      count,
      args.limit,
      args.offset,
    );
  }

  @Query(() => OrderDto)
  async getOrderById(
    @Args('id') id: string,
  ): Promise<OrderDto> {
    return await this.orderService.findById(id)
  }

    @Query(() => OrderDto)
  async getOrderByDocumentNumber(
    @Args('documentNumber') documentNumber: string,
    @Args('companyId', {type: () => String, nullable:true}) companyId?:string,
  ): Promise<OrderDto> {
    return await this.orderService.findByDocumentNumber(documentNumber, companyId)
  }


    @ResolveField(() => [OrderItemDto], { nullable: true })
    async orderItem(
      @Parent() order: OrderDto,
      @Loader(OrderItemByOrderLoader)
      loader: DataLoader<OrderDto['id'], OrderItemDto[]>,
    ) {
      return loader.load(order.id).then((o) => o || []);
    }

  @ResolveField(() => CustomerDto, { nullable: true })
  async customer(
    @Parent() order: OrderDto,
    @Loader(CustomerLoader) loader: DataLoader<CustomerDto['id'], CustomerDto>,
  ): Promise<CustomerDto> {
    return order.customerId != null ? loader.load(order.customerId) : null;
  }

}
