import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import _, { toNumber } from 'lodash';
import { EMPTY } from 'rxjs';
import { EntityManager, In, Repository } from 'typeorm';
import { AuthUser } from '../auth/auth.dto';
import { OrderDto } from '../order/dto/order.dto';
import { Order } from '../order/models/order.entity';
import { OrderService } from '../order/order.service';
import { QuotationLog } from './models/quotation-log.entity';
import { QuotationLogDto } from './dto/quotation-log.dto';

@Injectable()
export class QuotationLogService {
  constructor(
    @InjectRepository(QuotationLog)
    private quotationLogRepository: Repository<QuotationLog>,
    private entityManager: EntityManager,
  ) {}

  // async createLog(quotationId: string, subject: string, detail: string, note?: string) {
  //   const log = this.quotationLogRepository.create({
  //     quotation: { id: quotationId } as any,
  //     subject,
  //     detail,
  //     timeStamp: new Date(),
  //     note,
  //   });
  //   return await this.quotationLogRepository.save(log);
  // }

  async findByQuotationIds(quotationIds: readonly string[]): Promise<QuotationLogDto[][]> {
    const logs = await this.quotationLogRepository.find({
      where: { quotation: { id: In([...quotationIds]) } },
      order: { timeStamp: 'DESC' },
    });
    return quotationIds.map((id) => logs.filter((log) => log.affectedId === id).map(l => this.mapEntityToDto(l)));
  }


  private mapEntityToDto(quotationLog: QuotationLog): QuotationLogDto {
    return plainToClass(QuotationLogDto, quotationLog);
  }

}
