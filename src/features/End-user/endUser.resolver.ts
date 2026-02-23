import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { EndUserService } from './endUser.service';
import { EndUserDto, PaginatedEndUser } from './dto/endUser.dto';
import { ProductDto } from '../product/dto/product.dto';
import DataLoader from 'dataloader';
import { Loader } from 'nestjs-dataloader';
import { PaginationArgs } from 'src/shared/pagination/pagination.args';
import { createPaginatedResponse } from 'src/shared/pagination/pagination.utils';
import { CreateEndUserInput } from './dto/create-end-user.input';
@Resolver(() => EndUserDto)
export class EndUserResolver {
  constructor(
    private endUserService: EndUserService,
  ) {}

    @Query(() => PaginatedEndUser, { description: 'Retrieve all endUsers' })
    async getAllEndUsers(
      @Args() args: PaginationArgs,
    ): Promise<PaginatedEndUser> {
      const [result, count] = await this.endUserService.findAll(
        {
          limit: args.limit,
          offset: args.offset,
        },
      );
      // console.log('result', createPaginatedResponse<EndUserDto>(
      //   result,
      //   count,
      //   args.limit,
      //   args.offset,
      // ));
      return createPaginatedResponse<EndUserDto>(
        result,
        count,
        args.limit,
        args.offset,
      );
    }

    @Mutation(() => EndUserDto)
async createEndUser(@Args('input') input: CreateEndUserInput) {
  return this.endUserService.create(input); // อย่าลืมเขียนเมธอด create ใน service
}
@Query(() => [EndUserDto])
async getAllEndUserByCustomerId(@Args('customerId') customerId: string) {
  return this.endUserService.findAllByCustomerId(customerId);
}

}
