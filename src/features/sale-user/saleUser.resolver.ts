import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { SaleUserService } from './saleUser.service';
import { SaleUserDto, PaginatedSaleUser } from './dto/saleUser.dto';
import { ProductDto } from '../product/dto/product.dto';
import DataLoader from 'dataloader';
import { Loader } from 'nestjs-dataloader';
import { PaginationArgs } from 'src/shared/pagination/pagination.args';
import { createPaginatedResponse } from 'src/shared/pagination/pagination.utils';
import { CreateSaleUserInput } from './dto/create-end-user.input';
import { UpdateSaleUserInput } from './dto/update-sale-user.input';
@Resolver(() => SaleUserDto)
export class SaleUserResolver {
  constructor(
    private saleUserService: SaleUserService,
  ) {}

    @Query(() => PaginatedSaleUser, { description: 'Retrieve all saleUsers' })
    async getAllSaleUsers(
      @Args() args: PaginationArgs,
    ): Promise<PaginatedSaleUser> {
      const [result, count] = await this.saleUserService.findAll(
        {
          limit: args.limit,
          offset: args.offset,
        },
      );
      // console.log('result', createPaginatedResponse<SaleUserDto>(
      //   result,
      //   count,
      //   args.limit,
      //   args.offset,
      // ));
      return createPaginatedResponse<SaleUserDto>(
        result,
        count,
        args.limit,
        args.offset,
      );
    }

    @Mutation(() => SaleUserDto, { description: 'แก้ไขข้อมูลผู้ติดต่อ (SaleUser)' })
async updateSaleUser(@Args('input') input: UpdateSaleUserInput): Promise<SaleUserDto> {
  return this.saleUserService.update(input.id, input);
}

    @Mutation(() => SaleUserDto)
async createSaleUser(@Args('input') input: CreateSaleUserInput) {
  return this.saleUserService.create(input); // อย่าลืมเขียนเมธอด create ใน service
}
@Query(() => [SaleUserDto])
async getAllSaleUserByVenderId(@Args('venderId') venderId: string) {
  return this.saleUserService.findAllByVenderId(venderId);
}

}
