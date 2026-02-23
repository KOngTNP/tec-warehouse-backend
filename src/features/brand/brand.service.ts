import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { BrandDto } from './dto/brand.dto';
import { Brand } from './models/brand.entity';
import { plainToClass } from 'class-transformer';
import * as path from 'path';
import { DBFFile } from 'dbffile';
import * as fs from 'fs';
import { CreateBrandInput } from './dto/create-brand.input';


@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
  ) {}

async create(input: CreateBrandInput): Promise<Brand> {
    const newBrand = this.brandRepository.create(input);
    return await this.brandRepository.save(newBrand);
  }
  async findByIds(ids: readonly string[]): Promise<BrandDto[]> {
    return this.brandRepository
      .findByIds([...ids])
      .then((arr) => arr.map((o) => this.mapEntityToDto(o)));
  }
  async findAll(args?: {
    limit?: number;
    offset?: number;
    query?: string;
  }): Promise<[BrandDto[], number]> {
    const where: any = {};
    if (args?.query != null) where.name = Like(`%${args.query}%`);
    // sensible defaults: undefined means no limit
    const skip = args?.offset ?? 0;
    const take = args?.limit && args.limit > 0 ? args.limit : undefined;

    const [arr, count] = await this.brandRepository.findAndCount({
      where: Object.keys(where).length ? where : undefined,
      skip,
      take,
    });

    const result: [BrandDto[], number] = [
      arr.map((o) => this.mapEntityToDto(o)),
      count,
    ];
    return result;
  }
  
  async findByExCode(exCode: string): Promise<BrandDto | null> {
    const brand = await this.brandRepository.findOne({
      where: { ExCode: exCode },
    });

    return brand ? this.mapEntityToDto(brand) : null;
  }


    async findByExCodes(exCodes: string[]): Promise<BrandDto[]> {
    if (!exCodes || exCodes.length === 0) return [];
    const brand = await this.brandRepository.find({
      where: { ExCode: In(exCodes) },
    });
    return brand.map((o) => this.mapEntityToDto(o));
  }

  private mapEntityToDto(brand: Brand): BrandDto {
    return plainToClass(BrandDto, brand);
  }

  private cleanText(value: any): string {
    if (!value) return '';
    // แปลงเป็น string แล้ว trim และลดช่องว่างซ้ำให้เหลือ 1 ช่อง
    return String(value)
      .trim()
      .replace(/\s+/g, ' ');
  }



}
