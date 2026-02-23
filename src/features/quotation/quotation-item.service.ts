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
import { QuotationItem } from './models/quotation-item.entity';
import { QuotationItemDto } from './dto/quotation-item.dto';
import { QuotationLog } from './models/quotation-log.entity';

@Injectable()
export class QuotationItemService {
  constructor(
    @InjectRepository(QuotationItem)
    private quotationItemRepository: Repository<QuotationItem>,
        @InjectRepository(QuotationLog)
    private quotationLogRepository: Repository<QuotationLog>,
  ) {}

async findByQuotationId(quotationId: string): Promise<QuotationItemDto[]> {
  const items = await this.quotationItemRepository
    .createQueryBuilder('item')
    .where('item.quotationId = :quotationId', { quotationId })
    // 1. ตรวจสอบ NULL ก่อน: ถ้า sequence เป็น NULL จะได้ค่า 1, ถ้าไม่เป็น NULL จะได้ค่า 0
    // วิธีนี้จะทำให้คนที่มีตัวเลข (0) ขึ้นมาก่อนคนที่เป็น NULL (1)
    .orderBy('ISNULL(item.sequence)', 'ASC') 
    // 2. เรียงตามตัวเลข sequence จากน้อยไปมาก
    .addOrderBy('item.sequence', 'ASC')
    // 3. ถ้า sequence ว่างเหมือนกัน ให้เรียงตามเวลาที่สร้าง
    .addOrderBy('item.createdAt', 'ASC')
    .getMany();

  return items.map((item) => this.mapEntityToDto(item));
}


async updateUnitPrice(id: string, unitPrice: number, user:AuthUser): Promise<QuotationItemDto> {
  const item = await this.quotationItemRepository.findOne({ where: { id } });
  if (!item) throw new Error('ไม่พบรายการที่ต้องการแก้ไข');

  // อัปเดตข้อมูล
  await this.quotationItemRepository.update(id, { unitPrice });

  // ดึงข้อมูลใหม่มาคืนค่า
  const updatedItem = await this.quotationItemRepository.findOne({ where: { id } });
  const log = this.quotationLogRepository.create({
    affectedId: id,
    subject: 'UPDATE_QUOTATION-ITEM-UNIT-PRICE', // เปลี่ยนชื่อให้ตรงกับเหตุการณ์
    detail: `จาก "${item.unitPrice}" เป็น "${unitPrice}"`, 
    note: `Update By "${user.firstName} ${user.lastName}"`,
    timeStamp: new Date(),
  });
  await this.quotationLogRepository.save(log);
  return this.mapEntityToDto(updatedItem);
}

async updateInsiderNote(id: string, inSiderNote: string, user:AuthUser): Promise<QuotationItemDto> {
  const item = await this.quotationItemRepository.findOne({ where: { id } });
  if (!item) throw new Error('ไม่พบรายการที่ต้องการแก้ไข');

  // อัปเดตข้อมูล
  await this.quotationItemRepository.update(id, { inSiderNote });

  // ดึงข้อมูลใหม่มาคืนค่า
  const updatedItem = await this.quotationItemRepository.findOne({ where: { id } });
    const log = this.quotationLogRepository.create({
    affectedId: id,
    subject: 'UPDATE_QUOTATION-ITEM-INSIDER-NOTE', // เปลี่ยนชื่อให้ตรงกับเหตุการณ์
    detail: `จาก "${item.inSiderNote || ''}" เป็น "${inSiderNote}"`, 
    note: `Update By "${user.firstName} ${user.lastName}"`,
    timeStamp: new Date(),
  });
  await this.quotationLogRepository.save(log);
  return this.mapEntityToDto(updatedItem);
}
  // DataLoader: ดึงรายการสินค้าทีละหลายๆ QuotationID (ประสิทธิภาพสูง)
async findByQuotationIds(quotationIds: readonly string[]): Promise<QuotationItemDto[]> {
  const items = await this.quotationItemRepository.find({
    // บังคับให้โหลด quotationId มาด้วยเพื่อให้ DataLoader ใช้ Group ได้
    where: { quotationId: In([...quotationIds]) },
    order: { sequence: 'ASC' },
  });

  // คืนค่าเป็นอาเรย์ชั้นเดียว (Flat Array)
  return items.map((item) => this.mapEntityToDto(item));
}
  async findByIds(ids: readonly string[]): Promise<QuotationItemDto[][]> {
    const items = await this.quotationItemRepository.find({
      where: { id: In([...ids]) },
      order: { sequence: 'ASC' },
    });

    // กลุ่มรายการสินค้าตาม QuotationId
    return ids.map((id) => items.filter((item) => item.id === id).map(i => this.mapEntityToDto(i)));
  }

  private mapEntityToDto(quotationItem: QuotationItem): QuotationItemDto {
    return plainToClass(QuotationItemDto, quotationItem);
  }

}
