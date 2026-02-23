import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { CompanyDto } from './dto/company.dto';
import { Company } from './models/company.entity';
import { plainToClass } from 'class-transformer';
import * as path from 'path';
import { DBFFile } from 'dbffile';
import * as fs from 'fs';


@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}


  async findByIds(ids: readonly string[]): Promise<CompanyDto[]> {
    return this.companyRepository
      .findByIds([...ids])
      .then((arr) => arr.map((o) => this.mapEntityToDto(o)));
  }

    async findById(id: string): Promise<CompanyDto> {
    const product = await this.companyRepository.findOne({
        where: { id },
    });

    return this.mapEntityToDto(product);
    }

  async findAll(args?: {
    limit?: number;
    offset?: number;
    query?: string;
  }): Promise<[CompanyDto[], number]> {
    const where: any = {};
    if (args?.query != null) where.name = Like(`%${args.query}%`);
    // sensible defaults: undefined means no limit
    const skip = args?.offset ?? 0;
    const take = args?.limit && args.limit > 0 ? args.limit : undefined;

    const [arr, count] = await this.companyRepository.findAndCount({
      where: Object.keys(where).length ? where : undefined,
      skip,
      take,
    });

    const result: [CompanyDto[], number] = [
      arr.map((o) => this.mapEntityToDto(o)),
      count,
    ];
    return result;
  }
  

  private mapEntityToDto(company: Company): CompanyDto {
    return plainToClass(CompanyDto, company);
  }

  private cleanText(value: any): string {
    if (!value) return '';
    // แปลงเป็น string แล้ว trim และลดช่องว่างซ้ำให้เหลือ 1 ช่อง
    return String(value)
      .trim()
      .replace(/\s+/g, ' ');
  }



}
