import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { PurchasingUserService } from './purchasingUser.service';
import { PurchasingUserDto, PaginatedPurchasingUser } from './dto/purchasingUser.dto';
import { ProductDto } from '../product/dto/product.dto';
import DataLoader from 'dataloader';
import { Loader } from 'nestjs-dataloader';
import { PaginationArgs } from 'src/shared/pagination/pagination.args';
import { createPaginatedResponse } from 'src/shared/pagination/pagination.utils';
import { CreatePurchasingUserInput } from './dto/create-purchasing-user.input';
@Resolver(() => PurchasingUserDto)
export class PurchasingUserResolver {
  constructor(
    private purchasingUserService: PurchasingUserService,
  ) {}

    @Query(() => PaginatedPurchasingUser, { description: 'Retrieve all purchasingUsers' })
    async getAllPurchasingUsers(
      @Args() args: PaginationArgs,
    ): Promise<PaginatedPurchasingUser> {
      const [result, count] = await this.purchasingUserService.findAll(
        {
          limit: args.limit,
          offset: args.offset,
        },
      );
      // console.log('result', createPaginatedResponse<PurchasingUserDto>(
      //   result,
      //   count,
      //   args.limit,
      //   args.offset,
      // ));
      return createPaginatedResponse<PurchasingUserDto>(
        result,
        count,
        args.limit,
        args.offset,
      );
    }
    @Query(() => [PurchasingUserDto])
async getAllPurchasingByCustomerId(@Args('customerId') customerId: string) {
  return this.purchasingUserService.findAllByCustomerId(customerId);
}


        @Mutation(() => PurchasingUserDto)
async createPurchasingUser(@Args('input') input: CreatePurchasingUserInput) {
  return this.purchasingUserService.create(input); // อย่าลืมเขียนเมธอด create ใน service
}

}
