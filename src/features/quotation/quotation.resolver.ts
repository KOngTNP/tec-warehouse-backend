import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { QuotationService } from './quotation.service';
import { QuotationDto, PaginatedQuotation, QuotationStatusSummary } from './dto/quotation.dto';
import { ProductDto } from '../product/dto/product.dto';
import DataLoader from 'dataloader';
import { Loader } from 'nestjs-dataloader';
import { PaginationArgs } from 'src/shared/pagination/pagination.args';
import { createPaginatedResponse } from 'src/shared/pagination/pagination.utils';
import { CreateQuotationInput } from './dto/create-quotation.args';
import { PurchasingUserDto } from '../purchasing-user/dto/purchasingUser.dto';
import { CustomerDto } from '../customer/dto/customer.dto';
import { EndUserDto } from '../End-user/dto/endUser.dto';
import { CustomerLoader } from '../customer/customer.loader';
import { EndUserLoader } from '../End-user/endUser.loader';
import { PurchasingUserLoader } from '../purchasing-user/purchasingUser.loader';
import { QuotationItemDto } from './dto/quotation-item.dto';
import { QuotationItemByQuotationIdLoader, QuotationItemLoader } from './quotation-item.loader';
import { UpdateQuotationInput } from './dto/update-quotation-input';
import { UserDto } from '../user/dto/user.dto';
import { UserLoader, UserLoaderByQuotationIdLoader } from '../user/user.loader';
import { Quotation, QuotationStatus } from './models/quotation.entity';
import { CurrentUser } from 'src/shared/decorators/decorators';
import { AuthUser } from '../auth/auth.dto';
import { GqlAuthGuard } from '../auth/guards/graphql-auth.guard';
import { UseGuards } from '@nestjs/common';




@Resolver(() => QuotationDto)
export class QuotationResolver {
  constructor(
    private readonly quotationService: QuotationService,
  ) {}

  @Mutation(() => QuotationDto)
  @UseGuards(GqlAuthGuard)
async createQuotation(
  @CurrentUser() user: AuthUser,
@Args('input') input: CreateQuotationInput,
): Promise<QuotationDto> {
  return this.quotationService.create(input, user);
}

@Mutation(() => QuotationDto)
@UseGuards(GqlAuthGuard)
async updateQuotation(
  @CurrentUser() user: AuthUser,
  @Args('input') input: UpdateQuotationInput,
): Promise<QuotationDto> {
  return this.quotationService.update(input, user);
}

@Mutation(() => QuotationDto)
  @UseGuards(GqlAuthGuard)
async updateQuotationStatus(
@CurrentUser() user: AuthUser,
@Args('id') id: string, // ✅ เพิ่ม ID ของใบเสนอราคา
@Args('status') status: string,
@Args('username') username: string,
): Promise<QuotationDto> {
  return this.quotationService.updateStatus(id,status,username, user);
}

@Mutation(() => QuotationDto)
  @UseGuards(GqlAuthGuard)
async updateQuotationDate(
  @CurrentUser() user: AuthUser,
  @Args('id') id: string,
  @Args('date') date: Date,
): Promise<QuotationDto> {
  return this.quotationService.updateQuotationDate(id, date);
}

@Query(() => QuotationStatusSummary, { description: 'Get summary counts by status' })
  async getQuotationStatusSummary(
    @Args('companyId') companyId: string,
    @Args('userId', { nullable: true }) userId: string,
    @Args('viewMode', { nullable: true }) viewMode: string,
  ): Promise<QuotationStatusSummary> {
    return this.quotationService.getStatusSummary(companyId, userId, viewMode);
  }

@Query(() => PaginatedQuotation, { description: 'Retrieve all quotations' })
  async getAllQuotations(
    @Args() args: PaginationArgs,
    @Args('query', { type: () => String, nullable: true }) query?: string,
    @Args('status', { type: () => String, nullable: true }) status?: string,
    @Args('companyId', { nullable: true }) companyId?: string,
    @Args('viewMode', { nullable: true }) viewMode?: string,
    @Args('userId', { nullable: true }) userId?: string,
    @Args('year', { nullable: true }) year?: string, // 👈 เพิ่มใหม่
    @Args('month', { nullable: true }) month?: string, // 👈 เพิ่มใหม่
    @Args('type', { nullable: true }) type?: string, // 👈 เพิ่มใหม่
  ): Promise<PaginatedQuotation> {
    const [result, count] = await this.quotationService.findAll({
      limit: args.limit,
      offset: args.offset,
      query,
      status,
      viewMode,
      userId,
      companyId,
      year, // 👈 ส่งต่อ
      month,
      type, // 👈 ส่งต่อ
    });

    return createPaginatedResponse<QuotationDto>(result, count, args.limit, args.offset);
  }

@Query(() => [QuotationDto], { nullable: true })
async getExpireInTwoDayQuotations(
  @Args('companyId', { nullable: true })  companyId: string,
  @Args('userId', { nullable: true }) userId: string,
  @Args('isShowAll', { nullable: true }) isShowAll: boolean,
): Promise<QuotationDto[]> {
  // เรียก Service ฟังก์ชันใหม่
  const result = await this.quotationService.findExpireInTwoDay({
    companyId,
    userId,
    isShowAll
  });

  return result;
}

    @Query(() => [QuotationDto], { description: 'Retrieve quotations created today' })
    async getQuotationsCreatedToday(): Promise<QuotationDto[]> {
      return this.quotationService.findCreateToDay();
    }

    @Query(() => QuotationDto, { description: 'Retrieve quotations created today' })
    async getQuotationsById(
         @Args('quotationId') quotationId: string,
    ): Promise<QuotationDto> {
      // console.log('quotationId: ', await this.quotationService.findById(quotationId))
      return await this.quotationService.findById(quotationId);
    }


      @ResolveField(() => CustomerDto, { nullable: true })
      async customer(
        @Parent() quotation: QuotationDto,
        @Loader(CustomerLoader) loader: DataLoader<CustomerDto['id'], CustomerDto>,
      ): Promise<CustomerDto> {
        return quotation.customerId != null ? loader.load(quotation.customerId) : null;
      }


        @ResolveField(() => PurchasingUserDto, { nullable: true })
        async purchasingUser(
        @Parent() quotation: QuotationDto,
          @Loader(PurchasingUserLoader) loader: DataLoader<PurchasingUserDto['id'], PurchasingUserDto>,
        ): Promise<PurchasingUserDto> {
          return quotation.purchasingUserId != null ? loader.load(quotation.purchasingUserId) : null;
        }


          @ResolveField(() => EndUserDto, { nullable: true })
          async endUser(
        @Parent() quotation: QuotationDto,
            @Loader(EndUserLoader) loader: DataLoader<EndUserDto['id'], EndUserDto>,
          ): Promise<EndUserDto> {
            return quotation.endUserId != null ? loader.load(quotation.endUserId) : null;
          }
@ResolveField(() => [QuotationItemDto], { nullable: true })
async items(
  @Parent() quotation: QuotationDto,
  // ✅ เปลี่ยนจาก QuotationItemLoader เป็น QuotationItemByQuotationIdLoader
  @Loader(QuotationItemByQuotationIdLoader) 
  loader: DataLoader<QuotationItemDto['id'], QuotationItemDto[]>,
): Promise<QuotationItemDto[]> {
return loader.load(quotation.id).then((o) => o || []);
}

@Mutation(() => QuotationDto, { description: 'แก้ไขหมายเหตุภายใน (Insider Note)' })
  @UseGuards(GqlAuthGuard)
async updateQuotationInsiderNote(
  @CurrentUser() user: AuthUser,
  @Args('id') id: string,
  @Args('inSiderNote') inSiderNote: string,
): Promise<QuotationDto> {
  return this.quotationService.updateInsiderNote(id, inSiderNote, user);
}
@Query(() => QuotationDto, { description: 'ค้นหาใบเสนอราคาจากหมายเลขใบเสนอราคา' })
async getQuotationsByQuotationNumber(
  @Args('quotationNumber') quotationNumber: string,
): Promise<QuotationDto> {
  return this.quotationService.findByQuotationNumber(quotationNumber);
}

@ResolveField(() => UserDto, { nullable: true })
async user( 
  @Parent() quotation: Quotation,
  // ✅ ใช้ UserLoader มาตรฐาน (หาด้วย User ID)
  @Loader(UserLoader) 
  loader: DataLoader<string, UserDto>,
): Promise<UserDto | null> {
  // ✅ ส่ง userId ของ quotation ไปหา user
  if (!quotation.userId) return null;
  return loader.load(quotation.userId);
}
}
