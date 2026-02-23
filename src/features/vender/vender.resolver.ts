import {
  Args,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';

import { VenderService } from './vender.service';
import { PaginatedVender, VenderDto } from './dto/vender.dto';
import { PaginationArgs } from 'src/shared/pagination/pagination.args';
import { createPaginatedResponse } from 'src/shared/pagination/pagination.utils';
import { CreateVenderInput } from './dto/create-vender.args';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/graphql-auth.guard';
import { CurrentUser } from 'src/shared/decorators/decorators';
import { AuthUser } from '../auth/auth.dto';
@Resolver(() => VenderDto)
export class VenderResolver {
  constructor(
    private venderService: VenderService,
  ) {}

    @Query(() => PaginatedVender, { description: 'Retrieve all venders' })
    async getAllVenders(
      @Args() args: PaginationArgs,
      @Args('query', { type: () => String, nullable: true }) query?: string,
      @Args('vendorId', { type: () => [String], nullable: true }) vendorId?: string[],
      @Args('companyId', {type: () => String, nullable:true}) companyId?:string,
    ): Promise<PaginatedVender> {
      const [result, count] = await this.venderService.findAll(
        {
          limit: args.limit,
          offset: args.offset,
          query: query,
          vendorId: vendorId,
          companyId,
        },
      );
      // console.log('result', createPaginatedResponse<VenderDto>(
      //   result,
      //   count,
      //   args.limit,
      //   args.offset,
      // ));
      return createPaginatedResponse<VenderDto>(
        result,
        count,
        args.limit,
        args.offset,
      );
    }
      @Mutation(() => Boolean, { nullable: true })
      async createVenderSearchFile(
        @Args('companyId', {type: () => String, nullable:true}) companyId?:string,
      ) {

        return this.venderService.createVendorSearchFile(companyId);
      }
    
    @Mutation(() => VenderDto, { description: 'สร้าง Vender ใหม่ชั่วคราวจากหน้าจัดซื้อ' })
    async createTempVender(
      @Args('input') input: CreateVenderInput,
    ): Promise<VenderDto> {
      return await this.venderService.create(input);
    }

    @Mutation(() => VenderDto)
    @UseGuards(GqlAuthGuard)
 
    async updateVenderNote(
      @CurrentUser() user: AuthUser,
      @Args('vendorId', { type: () => String, nullable:true }) vendorId: string,
      @Args('note', { type: () => String, nullable:true }) note: string,
    ): Promise<VenderDto> {
      return this.venderService.updateNote(vendorId, note,user);
    }

      @Query(() => VenderDto)
      async getVenderById(
        @Args('vendorId', { type: () => String, nullable:true }) vendorId: string,
      ): Promise<VenderDto> {
        return this.venderService.findById(vendorId);
      }

      @Query(() => [VenderDto])
      async getVendersByIds(
        @Args('vendorIds', { type: () => [String], nullable:true }) vendorIds: string[],
      ): Promise<VenderDto[]> {
        return this.venderService.findByIds(vendorIds);
      }
  
  }
  