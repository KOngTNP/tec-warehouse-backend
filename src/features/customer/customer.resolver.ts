import {
  Args,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';

import { CustomerService } from './customer.service';
import { CustomerDto, PaginatedCustomer } from './dto/customer.dto';
import { createPaginatedResponse } from 'src/shared/pagination/pagination.utils';
import { PaginationArgs } from 'src/shared/pagination/pagination.args';
import { CreateCustomerInput } from './dto/customer.input';
@Resolver(() => CustomerDto)
export class CustomerResolver {
  constructor(
    private customerService: CustomerService,
  ) {}
  @Query(() => PaginatedCustomer, { description: 'Retrieve all customers' })
  async getAllCustomers(
    @Args() args: PaginationArgs,
    @Args('query', { type: () => String, nullable: true }) query?: string,
    @Args('customerId', { type: () => [String], nullable: true }) customerId?: string[],
    @Args('companyId', {type: () => String, nullable:true}) companyId?:string,
  ): Promise<PaginatedCustomer> {
    const [result, count] = await this.customerService.findAll(
      {
        limit: args.limit,
        offset: args.offset,
        query: query,
        customerId: customerId,
        companyId,
      },
    );
    // console.log('result', createPaginatedResponse<CustomerDto>(
    //   result,
    //   count,
    //   args.limit,
    //   args.offset,
    // ));
    return createPaginatedResponse<CustomerDto>(
      result,
      count,
      args.limit,
      args.offset,
    );
  }

  @Mutation(() => CustomerDto, { description: 'สร้าง Customer ใหม่ชั่วคราวจากหน้าจัดซื้อ' })
  async createTempCustomer(
    @Args('customerInput') customerInput: CreateCustomerInput,
  ): Promise<CustomerDto> {
    return this.customerService.createTempCustomer(customerInput);
  }

    @Query(() => CustomerDto)
    async getCustomerById(
      @Args('customerId', { type: () => String, nullable:true }) customerId: string,
    ): Promise<CustomerDto> {
      return this.customerService.findById(customerId);
    }

    @Query(() => [CustomerDto])
    async getCustomersByIds(
      @Args('customerIds', { type: () => [String], nullable:true }) customerIds: string[],
    ): Promise<CustomerDto[]> {
      return this.customerService.findByIds(customerIds);
    }

    @Mutation(() => Boolean, { nullable: true })
    async createCustomerSearchFile(
       @Args('companyId', {type: () => String, nullable:true}) companyId?:string,
    ) {
      // console.log('in customer')
      return this.customerService.createCustomerSearchFile(companyId);
    }

  

}
