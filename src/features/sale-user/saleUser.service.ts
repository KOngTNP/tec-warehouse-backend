import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { SaleUserDto } from './dto/saleUser.dto';
import { SaleUser } from './models/saleUser.entity';
import { plainToClass } from 'class-transformer';
import * as path from 'path';
import { DBFFile } from 'dbffile';
import * as fs from 'fs';
import { CreateSaleUserInput } from './dto/create-end-user.input';
import { UpdateSaleUserInput } from './dto/update-sale-user.input';


@Injectable()
export class SaleUserService {
  constructor(
    @InjectRepository(SaleUser)
    private saleUserRepository: Repository<SaleUser>,
  ) {}


  async findByIds(ids: readonly string[]): Promise<SaleUserDto[]> {
    return this.saleUserRepository
      .findByIds([...ids])
      .then((arr) => arr.map((o) => this.mapEntityToDto(o)));
  }
  async create(input: CreateSaleUserInput): Promise<SaleUserDto> {
    const newUser = this.saleUserRepository.create(input);
    const saved = await this.saleUserRepository.save(newUser);
    return this.mapEntityToDto(saved);
  }

  async findAllByVenderId(venderId: string): Promise<SaleUserDto[]> {
    const users = await this.saleUserRepository.find({
      where: { venderId },
      order: { createdAt: 'DESC' }
    });
    return users.map(u => this.mapEntityToDto(u));
  }
  
  async findAll(args?: {
    limit?: number;
    offset?: number;
    query?: string;
  }): Promise<[SaleUserDto[], number]> {
    const where: any = {};
    if (args?.query != null) where.name = Like(`%${args.query}%`);
    // sensible defaults: undefined means no limit
    const skip = args?.offset ?? 0;
    const take = args?.limit && args.limit > 0 ? args.limit : undefined;

    const [arr, count] = await this.saleUserRepository.findAndCount({
      where: Object.keys(where).length ? where : undefined,
      skip,
      take,
    });

    const result: [SaleUserDto[], number] = [
      arr.map((o) => this.mapEntityToDto(o)),
      count,
    ];
    return result;
  }
  
  async findByVenderId(venderId: string): Promise<SaleUserDto | null> {
    const saleUser = await this.saleUserRepository.findOne({
      where: { venderId: venderId },
    });

    return saleUser ? this.mapEntityToDto(saleUser) : null;
  }

async update(id: string, input: UpdateSaleUserInput): Promise<SaleUserDto> {
  // 1. ตรวจสอบว่ามี User นี้อยู่จริงไหม
  const saleUser = await this.saleUserRepository.findOne({ where: { id } });
  if (!saleUser) {
    throw new Error('ไม่พบข้อมูลผู้ติดต่อที่ต้องการแก้ไข');
  }

  // 2. รวมข้อมูลใหม่เข้าไป (Merge)
  const updated = this.saleUserRepository.merge(saleUser, input);
  
  // 3. บันทึก
  const saved = await this.saleUserRepository.save(updated);
  
  return this.mapEntityToDto(saved);
}

    async findByVenderIds(venderIds: string[]): Promise<SaleUserDto[]> {
    if (!venderIds || venderIds.length === 0) return [];
    const saleUser = await this.saleUserRepository.find({
      where: { venderIds: In(venderIds) },
    });
    return saleUser.map((o) => this.mapEntityToDto(o));
  }

  private mapEntityToDto(saleUser: SaleUser): SaleUserDto {
    return plainToClass(SaleUserDto, saleUser);
  }

  private cleanText(value: any): string {
    if (!value) return '';
    // แปลงเป็น string แล้ว trim และลดช่องว่างซ้ำให้เหลือ 1 ช่อง
    return String(value)
      .trim()
      .replace(/\s+/g, ' ');
  }



}
