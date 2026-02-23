import {
  Args,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { OrderItemService } from './order-item.service';
import { OrderItemDto, OrderItemSummaryDto, PaginatedOrderItem } from './dto/order-item.dto';
import { ProductDto } from '../product/dto/product.dto';
import DataLoader from 'dataloader';
import { createPaginatedResponse } from 'src/shared/pagination/pagination.utils';
import { PaginationArgs } from 'src/shared/pagination/pagination.args';
import { Loader } from 'nestjs-dataloader';
import { ProductLoader } from '../product/product.loader';
@Resolver(() => OrderItemDto)
export class OrderItemResolver {
  constructor(
    private orderItemService: OrderItemService,
  ) {}

  @Query(() => PaginatedOrderItem, { description: 'Retrieve all orderItems' })
  async getAllOrderItems(
    @Args() args: PaginationArgs,
    @Args('companyId', {type: () => String, nullable:true}) companyId?:string,
  ): Promise<PaginatedOrderItem> {
    const [result, count] = await this.orderItemService.findAll(
      {
        limit: args.limit,
        offset: args.offset,
        companyId: companyId
      },
    );
    // console.log('result', createPaginatedResponse<OrderItemDto>(
    //   result,
    //   count,
    //   args.limit,
    //   args.offset,
    // ));
    return createPaginatedResponse<OrderItemDto>(
      result,
      count,
      args.limit,
      args.offset,
    );
  }

    @Query(() => [OrderItemDto])
    async getOrderItemsByProductId(
      @Args('productId') productId: string,
      @Args('sortField', { type: () => String, nullable: true }) sortField?: string,
      @Args('sortOrder', { type: () => String, nullable: true }) sortOrder?: 'ASC' | 'DESC',
    ): Promise<OrderItemDto[]> {
      const items = await this.orderItemService.findByProductId(
        productId,
        sortField,
        sortOrder,
      );
      return items;
    }

    @Query(() => [OrderItemDto])
    async getOrderItemsByCustomerId(
      @Args('customerId') customerId: string,
      @Args('sortField', { type: () => String, nullable: true }) sortField?: string,
      @Args('sortOrder', { type: () => String, nullable: true }) sortOrder?: 'ASC' | 'DESC',
      // @Args('limit', { type: () => Int, nullable: true }) limit?: number,
      // @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    ): Promise<OrderItemDto[]> {
      const result = await this.orderItemService.findByCustomerId(
        customerId,
        sortField,
        sortOrder,
        // limit,
        // offset,
      );
      // console.log('result', result);
      return result
    }

  

  @Query(() => OrderItemSummaryDto, { description: 'Get order item summary by product ID' })
  async getOrderItemSummaryByProductId(
    @Args('productId') productId: string,
  ): Promise<OrderItemSummaryDto> {
    // console.log('Fetching order item summary for productId:', productId);
    // console.log('OrderItemService instance:', await this.orderItemService.sumOverallByProductId(productId));
    return await this.orderItemService.sumOverallByProductId(productId);
  }

  @Query(() => [OrderItemDto])
  async getOrderItemsByOrderId(
    @Args('orderId') orderId: string,  
  ): Promise<OrderItemDto[]> {
    return await this.orderItemService.findAllByOrderId(orderId)
  }

  @ResolveField(() => ProductDto, { nullable: true })
  async product(
    @Parent() orderItem: OrderItemDto,
    @Loader(ProductLoader) loader: DataLoader<ProductDto['id'], ProductDto>,
  ): Promise<ProductDto> {
    return orderItem.productId != null ? loader.load(orderItem.productId) : null;
  }

}
