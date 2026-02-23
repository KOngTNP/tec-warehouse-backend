import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { PurchasingUserDto } from './dto/purchasingUser.dto';
import { PurchasingUser } from './models/purchasingUser.entity';
import { plainToClass } from 'class-transformer';
import { CreatePurchasingUserInput } from './dto/create-purchasing-user.input';


@Injectable()
export class PurchasingUserService {
  constructor(
    @InjectRepository(PurchasingUser)
    private purchasingUserRepository: Repository<PurchasingUser>,
  ) {}


  async findByIds(ids: readonly string[]): Promise<PurchasingUserDto[]> {
    return this.purchasingUserRepository
      .findByIds([...ids])
      .then((arr) => arr.map((o) => this.mapEntityToDto(o)));
  }
  // บันทึกจัดซื้อคนใหม่
  async create(input: CreatePurchasingUserInput): Promise<PurchasingUserDto> {
    const newUser = this.purchasingUserRepository.create(input);
    const saved = await this.purchasingUserRepository.save(newUser);
    return this.mapEntityToDto(saved);
  }

  // ดึงจัดซื้อทั้งหมดของบริษัทนี้ (คืนเป็น Array)
  async findAllByCustomerId(customerId: string): Promise<PurchasingUserDto[]> {
    const users = await this.purchasingUserRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' }
    });
    return users.map(u => this.mapEntityToDto(u));
  }
  
  async findAll(args?: {
    limit?: number;
    offset?: number;
    query?: string;
  }): Promise<[PurchasingUserDto[], number]> {
    const where: any = {};
    if (args?.query != null) where.name = Like(`%${args.query}%`);
    // sensible defaults: undefined means no limit
    const skip = args?.offset ?? 0;
    const take = args?.limit && args.limit > 0 ? args.limit : undefined;

    const [arr, count] = await this.purchasingUserRepository.findAndCount({
      where: Object.keys(where).length ? where : undefined,
      skip,
      take,
    });

    const result: [PurchasingUserDto[], number] = [
      arr.map((o) => this.mapEntityToDto(o)),
      count,
    ];
    return result;
  }
  
  async findByCustomerId(customerId: string): Promise<PurchasingUserDto | null> {
    const purchasingUser = await this.purchasingUserRepository.findOne({
      where: { customerId: customerId },
    });

    return purchasingUser ? this.mapEntityToDto(purchasingUser) : null;
  }


    async findByCustomerIds(customerIds: string[]): Promise<PurchasingUserDto[]> {
    if (!customerIds || customerIds.length === 0) return [];
    const purchasingUser = await this.purchasingUserRepository.find({
      where: { customerIds: In(customerIds) },
    });
    return purchasingUser.map((o) => this.mapEntityToDto(o));
  }

  private mapEntityToDto(purchasingUser: PurchasingUser): PurchasingUserDto {
    return plainToClass(PurchasingUserDto, purchasingUser);
  }

  private cleanText(value: any): string {
    if (!value) return '';
    // แปลงเป็น string แล้ว trim และลดช่องว่างซ้ำให้เหลือ 1 ช่อง
    return String(value)
      .trim()
      .replace(/\s+/g, ' ');
  }



}
