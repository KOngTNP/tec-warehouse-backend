import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { EndUserDto } from './dto/endUser.dto';
import { EndUser } from './models/endUser.entity';
import { plainToClass } from 'class-transformer';
import * as path from 'path';
import { DBFFile } from 'dbffile';
import * as fs from 'fs';
import { CreateEndUserInput } from './dto/create-end-user.input';


@Injectable()
export class EndUserService {
  constructor(
    @InjectRepository(EndUser)
    private endUserRepository: Repository<EndUser>,
  ) {}


  async findByIds(ids: readonly string[]): Promise<EndUserDto[]> {
    return this.endUserRepository
      .findByIds([...ids])
      .then((arr) => arr.map((o) => this.mapEntityToDto(o)));
  }
  async create(input: CreateEndUserInput): Promise<EndUserDto> {
    const newUser = this.endUserRepository.create(input);
    const saved = await this.endUserRepository.save(newUser);
    return this.mapEntityToDto(saved);
  }

  async findAllByCustomerId(customerId: string): Promise<EndUserDto[]> {
    const users = await this.endUserRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' }
    });
    return users.map(u => this.mapEntityToDto(u));
  }
  
  async findAll(args?: {
    limit?: number;
    offset?: number;
    query?: string;
  }): Promise<[EndUserDto[], number]> {
    const where: any = {};
    if (args?.query != null) where.name = Like(`%${args.query}%`);
    // sensible defaults: undefined means no limit
    const skip = args?.offset ?? 0;
    const take = args?.limit && args.limit > 0 ? args.limit : undefined;

    const [arr, count] = await this.endUserRepository.findAndCount({
      where: Object.keys(where).length ? where : undefined,
      skip,
      take,
    });

    const result: [EndUserDto[], number] = [
      arr.map((o) => this.mapEntityToDto(o)),
      count,
    ];
    return result;
  }
  
  async findByCustomerId(customerId: string): Promise<EndUserDto | null> {
    const endUser = await this.endUserRepository.findOne({
      where: { customerId: customerId },
    });

    return endUser ? this.mapEntityToDto(endUser) : null;
  }


    async findByCustomerIds(customerIds: string[]): Promise<EndUserDto[]> {
    if (!customerIds || customerIds.length === 0) return [];
    const endUser = await this.endUserRepository.find({
      where: { customerIds: In(customerIds) },
    });
    return endUser.map((o) => this.mapEntityToDto(o));
  }

  private mapEntityToDto(endUser: EndUser): EndUserDto {
    return plainToClass(EndUserDto, endUser);
  }

  private cleanText(value: any): string {
    if (!value) return '';
    // แปลงเป็น string แล้ว trim และลดช่องว่างซ้ำให้เหลือ 1 ช่อง
    return String(value)
      .trim()
      .replace(/\s+/g, ' ');
  }



}
