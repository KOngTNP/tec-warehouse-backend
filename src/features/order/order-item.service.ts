import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { LastOrderItemDetail, OrderItemDto, OrderItemSummaryDto } from './dto/order-item.dto';
import { OrderItem } from './models/order-item.entity';
import { plainToClass } from 'class-transformer';
import { info } from 'console';
import * as path from 'path';
import { DBFFile } from 'dbffile';
import * as fs from 'fs';
import { OrderService } from './order.service';
import { ProductService } from '../product/product.service';
import { Product } from '../product/models/product.entity';
import { OrderDto } from './dto/order.dto';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,

    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,

  ) {}
private readonly DEFAULT_COMPANY_ID = 'a618ee20-7099-4fb0-9793-c9efcdf1807e';
unitMap(rawUnit: string): string {
  const unitMapData: Record<string, string> = {
    'กล': 'กล.',
    'คง': 'เครื่อง',
    'ชด': 'ชุด',
    'ชน': 'ชิ้น',
    'ตว': 'ตัว',
    'หบ': 'หีบ',
    'หล': 'โหล',
    'หอ': 'ห่อ',
    'อน': 'อัน',
    'ผง': 'แผง',
    'ทอ': 'ท่อน',
    'กก': 'กก.',
    'ผน': 'แผ่น',
    'PC': 'PCS',
    'ลง': 'ลัง',
    'กน': 'ก้อน',
    'ลก': 'ลูก',
    'กง': 'กล่อง',
    'กป': 'กป',
    'ปน': 'ปิ้บ',
    'ใบ': 'ใบ',
    'ดว': 'ดวง',
    'หด': 'หลอด',
    'สน': 'เส้น',
    'ม.': 'เมตร',
    'รน': 'เรือน',
    'ถง': 'ถัง',
    'มว': 'ม้วน',
    'PK': 'PACK',
    'SE': 'SET',
    'ขว': 'ขวด',
    'ลต': 'ลิตร',
    'พค': 'แพ็ค',
    'ลอ': 'ล้อ',
    'คู': 'คู่',
    'ถุ': 'ถุง',
    'LO': 'LOT',
    'คส': 'คุรุส',
    'กส': 'กระสอบ',
    'ผ': 'ผืน',
    'YD': 'หลา',
    'M.': 'M.',
    'CA': 'CAN',
    'ขด': 'ขีด',
    'GA': 'GAL',
    'RL': 'ROLL',
    'BX': 'BOX',
    'ทง': 'แท่ง',
    'KG': 'KG',
    'คน': 'คัน',
    'DZ': 'DZ',
    'ตล': 'ตลับ',
    'มด': 'เม็ด',
    'ฟต': 'ฟุต',
    'SH': 'SHEET',
    'ดม': 'ด้าม',
    'วง': 'วง',
    'EA': 'EA',
    'ตน': 'ต้น',
    'ดก': 'ดก',
    'ห': 'หลา',
    'กร': 'กุรุด',
    'PA': 'คู่',
    'คร': 'คร',
    'ตม': 'ตรม.',
    'NO': 'NO',
    'PI': 'PIECES',
  };

  return unitMapData[rawUnit] || rawUnit;
}
  private pad2(num: string | number): string {
    return num.toString().padStart(2, '0');
  }
async importOrderItemFromDbf(companyId: string, pathDBF: string, pathDBFREMARK: string): Promise<string> {
    const filePath = path.resolve(
        pathDBF
    );
    const filePathREMARK = path.resolve(
        pathDBFREMARK
    );

    if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
    if (!fs.existsSync(filePathREMARK)) throw new Error(`File not found: ${filePathREMARK}`);

    const dbf = await DBFFile.open(filePath, { encoding: 'cp874' });
    const records = await dbf.readRecords();
    const dbfREMARK = await DBFFile.open(filePathREMARK, { encoding: 'cp874' });
    const recordsREMARK = await dbfREMARK.readRecords();

    console.log(`📄 Read ${records.length} rows from ${path.basename(filePath)}`);
    console.log(`📄 Read ${recordsREMARK.length} rows from ${path.basename(filePathREMARK)}`);

    const result = { inserted: 0, updated: 0, skipped: 0, deleted: 0 };
    const existing: OrderItem[] = await this.orderItemRepository.find({
      where: { companyId }
    });
    const existingMap = new Map(existing.map((r) => [r.documentNumber, r]));

    const allOrderCodes = [...new Set(records.map((r) => this.cleanText(r.SONUM)))];
    const allProductCodes = [...new Set(records.map((r) => this.cleanText(r.STKCOD)))];

    const [orders, products] = await Promise.all([
      this.orderService.findByExCodes(allOrderCodes, companyId),
      this.productService.findByExCodes(allProductCodes, companyId),
    ]);

    const orderMap = new Map<string, OrderDto>(orders.map((o) => [o.documentNumber, o]));
    const productMap = new Map<string, Product>(
      products.map((p): [string, Product] => [p.ExCode, p])
    );

    const newItems: OrderItem[] = [];
    const updatedItems: Partial<OrderItem & { id: string }>[] = [];
    const exCodesFromFile: string[] = [];

    // 🔎 สร้าง remark map
    const remarkMap = new Map<string, string[]>();
    for (const r of recordsREMARK) {
      const key = `${this.cleanText(r.DOCNUM)}-${this.cleanText(r.SEQNUM)}`;
      const txt = this.cleanText(r.REMARK);
      if (!txt) continue;
      if (!remarkMap.has(key)) remarkMap.set(key, []);
      remarkMap.get(key)!.push(txt);
    }

    for (const record of records) {
      const seqNumber = this.pad2(this.cleanText(record.SEQNUM));
      const documentNumber = `${this.cleanText(record.SONUM)}-${seqNumber}`;
      exCodesFromFile.push(documentNumber);

      const remarkKey = `${this.cleanText(record.SONUM)}-${this.cleanText(record.SEQNUM)}`;
      const remarkText = (remarkMap.get(remarkKey) || []).join(' ');

      const sellName = `${this.cleanText(record.STKDES)} ${remarkText}`.trim().slice(0, 255);
      const actualQuantity = Number(this.cleanText(record.ORDQTY)) * Number(this.cleanText(record.TFACTOR));
      const quantity = Number(this.cleanText(record.ORDQTY));
      const unit = this.unitMap(this.cleanText(record.TQUCOD));
      const unitPrice = Number(this.cleanText(record.UNITPR));
      const discount = this.cleanText(record.DISC);
      const totalPrice = Number(this.cleanText(record.TRNVAL));
      const isFree = this.cleanText(record.FREE) == 'Y' || this.cleanText(record.FREE).length > 0 ? true :false;
      const order = orderMap.get(this.cleanText(record.SONUM));
      const product = productMap.get(this.cleanText(record.STKCOD));
      if (!documentNumber || !order?.id) {
        result.skipped++;
        continue;
      }

      const found = existingMap.get(documentNumber);
      // console.log('const found = existingMap.get(documentNumber);: ',existingMap.get(documentNumber))
      if (
        found &&
        found.sellName === sellName &&
        found.quantity.toFixed(2) === quantity.toFixed(2) &&
        found.actualQuantity.toFixed(2) === actualQuantity.toFixed(2) &&
        found.unit === unit &&
        found.unitPrice.toFixed(2) === unitPrice.toFixed(2) &&
        found.discount === discount &&
        found.totalPrice.toFixed(2) === totalPrice.toFixed(2) &&
        found.orderId === order.id &&
        found.productId === product?.id &&
        found.isFree === isFree &&
        found.companyId === companyId
      ) {
        result.skipped++;
        continue;
      }

      if (found) {
  const changes = [];

  if (found.sellName !== sellName) {
    changes.push(`sellName: "${found.sellName}" → "${sellName}"`);
  }
  if (found.quantity !== quantity) {
    changes.push(`quantity: ${found.quantity} → ${quantity}`);
  }
  if (found.unit !== unit) {
    changes.push(`unit: "${found.unit}" → "${unit}"`);
  }
  if (found.unitPrice.toFixed(2) !== unitPrice.toFixed(2)) {
    changes.push(`unitPrice: ${found.unitPrice.toFixed(2)} → ${unitPrice.toFixed(2)}`);
  }
  if (found.discount !== discount) {
    changes.push(`discount: ${found.discount} → ${discount}`);
  }
  if (found.totalPrice !== totalPrice) {
    changes.push(`totalPrice: ${found.totalPrice} → ${totalPrice}`);
  }
  if (found.isFree !== isFree) {
    changes.push(`isFree: ${found.isFree} → ${isFree}`);
  }
  if (found.productId !== (product?.id || null)) {
    changes.push(`productId: ${found.productId} → ${product?.id || null}`);
  }

  if (changes.length > 0) {
    console.log(`📝 Item id=${found.id} updated:`, changes.join(', '));
    result.updated++;
  }

  updatedItems.push({
    id: found.id,
    sellName,
    quantity,
    actualQuantity,
    unit,
    unitPrice,
    discount,
    totalPrice,
    orderId: order.id,
    reference: order.reference,
    isFree,
    productId: product?.id || null,
    companyId,
  });
}
 else {
        newItems.push(
          this.orderItemRepository.create({
            documentNumber,
            sellName,
            quantity,
            actualQuantity,
            unit,
            unitPrice,
            discount,
            totalPrice,
            orderId: order.id,
            reference: order.reference,
            isFree,
            productId: product?.id || null,
            companyId,
          }),
        );
        result.inserted++;
      }
    }
    // ✅ บันทึกข้อมูลในครั้งเดียว (batch ขนาด 100)
    const BATCH_SIZE = 100;
    if (newItems.length > 0) {
      for (let i = 0; i < newItems.length; i += BATCH_SIZE) {
        const batch = newItems.slice(i, i + BATCH_SIZE);
        await this.orderItemRepository.save(batch);
      }
    }
    if (updatedItems.length > 0) {
      for (let i = 0; i < updatedItems.length; i += BATCH_SIZE) {
        const batch = updatedItems.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map((u) => this.orderItemRepository.update(u.id, u)));
      }
    }

    // 🗑️ soft delete
    const orderItemsToDelete = existing.filter(
      (r) => !exCodesFromFile.includes(r.documentNumber),
    );
    if (orderItemsToDelete.length > 0) {
      const idsToDelete = orderItemsToDelete.map((r) => r.id);
      await this.orderItemRepository.softDelete({ id: In(idsToDelete), companyId });
      result.deleted = idsToDelete.length;
    }

    const finalCount = await this.orderItemRepository.count();
    console.log(`✅ ORDER ITEM Import Complete
    📦 จากไฟล์: ${records.length}
    📂 ใน DB (หลังอัปเดต): ${finalCount}
    ➕ เพิ่มใหม่: ${result.inserted}
    🔁 อัปเดต: ${result.updated}
    ⏭️ ข้าม: ${result.skipped}
    🗑️ ลบออก: ${result.deleted}`);

    return 'DONE';
  }


  async findAll(
      args?: {
        limit?: number;
        offset?: number;
        query?: string;
        companyId?: string;
      },
    ): Promise<[OrderItemDto[], number]> {
          const {
    limit,
    offset = 0,
    query,
    companyId = this.DEFAULT_COMPANY_ID,
  } = args ?? {};
      const where: any = {companyId};
      if (query != null) where.name = Like(`%${query}%`);
      // sensible defaults: undefined means no limit
      const skip = offset ?? 0;
      const take = limit && limit > 0 ? limit : undefined;
  
      const [arr, count] = await this.orderItemRepository.findAndCount({
        where: Object.keys(where).length ? where : undefined,
        skip,
        take,
      });
  
      const result: [OrderItemDto[], number] = [arr.map((o) => this.mapEntityToDto(o)), count];
      return result;
    }
  
    async findByIds(ids: readonly string[]): Promise<OrderItemDto[]> {
      const orderItems = await this.orderItemRepository.find({
        where: { id: In([...ids]) },
      });
      return orderItems.map((o) => this.mapEntityToDto(o));
    }

    async sumOverallByProductId(productId: string): Promise<OrderItemSummaryDto> {
      const totalQuantity = await this
        .orderItemRepository
        .createQueryBuilder('order_item')
        .select('SUM(order_item.actualQuantity)', 'sum')
        .where('order_item.productId = :productId', { productId })
        .getRawOne();
              
      const totalRevenue = await this
        .orderItemRepository
        .createQueryBuilder('order_item')
        .select('SUM(order_item.totalPrice)', 'sum')
        .where('order_item.productId = :productId', { productId })
        .getRawOne();
      
      const totalOrder = await this
        .orderItemRepository
        .createQueryBuilder('order_item')
        .select('COUNT(order_item.id)', 'sum')
        .where('order_item.productId = :productId', { productId })
        .getRawOne();
      const summaryDto = new OrderItemSummaryDto();
      summaryDto.totalQuantity = totalQuantity.sum;
      summaryDto.totalRevenue = totalRevenue.sum;
      summaryDto.totalOrder = totalOrder.sum;

 
      return summaryDto;

    }

    async getLastSellDetail(productId: string): Promise<LastOrderItemDetail | null> {
  const lastOrderItem = await this.orderItemRepository
   .createQueryBuilder('orderItem')
      .leftJoinAndSelect('orderItem.order', 'order')
      .leftJoinAndSelect('order.customer', 'customer')
      .where('orderItem.productId = :productId', { productId })
      .orderBy('order.date', 'DESC') // ✅ sort ตาม date ของ relation
      .getOne();
  return this.mapLastOrderItemDetailEntityToDto(lastOrderItem) ?? null;
}

async getLastSellDetailMap(productIds: string[]): Promise<Map<string, LastOrderItemDetail>> {
  if (!productIds.length) return new Map();

  const items = await this.orderItemRepository
    .createQueryBuilder('orderItem')
    .leftJoinAndSelect('orderItem.order', 'order')
    .leftJoinAndSelect('order.customer', 'customer')
    .where('orderItem.productId IN (:...productIds)', { productIds })
    .orderBy('order.date', 'DESC')
    .getMany();

  // ✅ ใช้ Map เก็บ “record ล่าสุด” ต่อ productId
  const map = new Map<string, LastOrderItemDetail>();
  for (const item of items) {
    if (!map.has(item.productId)) {
      const dto = plainToClass(LastOrderItemDetail, item);
      dto.date = item.order?.date ?? null;
      dto.customerName = item.order?.customer?.name ?? null;
      dto.customerContact = item.order?.customer?.contact ?? null;
      dto.orderReference = item.order?.reference ?? null;
      dto.vatType = item.order?.vatType ?? null;
      map.set(item.productId, dto);
    }
  }
  return map;
}


async findByProductId(
  productId: string,
  sortField: string = 'order.date',
  sortOrder: 'ASC' | 'DESC' = 'DESC',
): Promise<OrderItemDto[]> {
  const qb = this.orderItemRepository
    .createQueryBuilder('orderItem')
    .leftJoinAndSelect('orderItem.order', 'order')
    .leftJoinAndSelect('order.customer', 'customer')
    .where('orderItem.productId = :productId', { productId });

  // whitelist ป้องกัน SQL injection
  const allowedFields = [
    'order.date',
    'order.documentNumber',
    'order.sellName',
    'customer.name',
    'orderItem.unitPrice',
    'orderItem.quantity',
    'orderItem.discount',
    'orderItem.totalPrice',
    'unitPriceAfterDiscount', // เราจะใช้ alias สำหรับคำนวณ
  ];

  // ถ้าต้องการ sort แบบคำนวณราคาต่อหน่วย
  if (sortField === 'unitPriceAfterDiscount') {
    qb.addSelect('orderItem.totalPrice / orderItem.quantity', 'unitPriceAfterDiscount')
      .orderBy('unitPriceAfterDiscount', sortOrder);
  } else if (allowedFields.includes(sortField)) {
    qb.orderBy(sortField, sortOrder);
  } else {
    qb.orderBy('order.date', 'DESC');
  }

  const orders = await qb.getMany();
  return orders.map((o) => this.mapEntityToDto(o));
}


async findByCustomerId(
  customerId: string,
  sortField: string = 'order.date',
  sortOrder: 'ASC' | 'DESC' = 'DESC',
): Promise<OrderItemDto[]> {
  const qb = this.orderItemRepository
    .createQueryBuilder('orderItem')
    .leftJoinAndSelect('orderItem.order', 'order')
    .leftJoinAndSelect('order.customer', 'customer')
    .where('order.customer.id = :customerId', { customerId });

  const allowedFields = [
    'order.date',
    'order.documentNumber',
    'orderItem.buyName',
    'customer.name',
    'orderItem.unitPrice',
    'orderItem.quantity',
    'orderItem.discount',
    'orderItem.totalPrice',
  ];

if (allowedFields.includes(sortField)) {
    qb.orderBy(sortField, sortOrder);
  } else {
    qb.orderBy('order.date', 'DESC');
  }
  // ============ Important: Get Raw + Entities ============
  // const { entities, raw } = await qb.getRawAndEntities();
  const orders = await qb.getMany();
  // console.log(orders)

  return await this.mapEntitiesToDtos(orders);
}




      async findByProductIds(
        productIds: readonly string[],
      ): Promise<OrderItemDto[]> {
        const orderItems = await this.orderItemRepository.find({
          where: {
            productId: In([...productIds]),
          },
          relations: ['product'],
        });
        return orderItems.map((o) => this.mapEntityToDto(o));
      }
      
      async findByOrderIds(
              orderIds: readonly string[],
            ): Promise<OrderItemDto[]> {
              const orders = await this.orderItemRepository.find({
                where: {
                  orderId: In([...orderIds]),
                },
                relations: ['order'],
              });
              return orders.map((o) => this.mapEntityToDto(o));
            }

  async findAllByOrderId(orderId: string): Promise<OrderItemDto[]> {
    const orders = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoinAndSelect('orderItem.order', 'order')
      .where('orderItem.orderId = :orderId', { orderId })
      .orderBy('orderItem.documentNumber', 'ASC') // หรือ DESC
      .getMany();

    return orders.map((o) => this.mapEntityToDto(o));
  }



    private mapLastOrderItemDetailEntityToDto(orderItem: OrderItem): LastOrderItemDetail {
      if (!orderItem) return null;
    const dto = plainToClass(LastOrderItemDetail, orderItem);
    dto.date = orderItem?.order?.date ?? null;
    dto.customerName = orderItem?.order?.customer?.name ?? null;
    dto.customerContact = orderItem?.order?.customer?.contact ?? null;
    dto.orderReference = orderItem?.order?.reference ?? null;
    dto.vatType = orderItem?.order?.vatType ?? null;

    return dto;
  }
    mapOrderItemEntityToDto(orderItem: OrderItem): OrderItemDto {
      return this.mapEntityToDto(orderItem);
    }
  
  
  
    private mapEntityToDto(orderItem: OrderItem): OrderItemDto {
      if (!orderItem) return null;
      const dto = plainToClass(OrderItemDto, orderItem);
      dto.order = orderItem.order
      return dto;
    }

    private mapEntitiesToDtos(orderItems: OrderItem[]): OrderItemDto[] {
      if (!orderItems?.length) return [];

      return orderItems.map((item) => {
        const dto = plainToClass(OrderItemDto, item);
        dto.order = item.order;
        return dto;
      });
    }

    private cleanText(value: any): string {
    if (!value) return '';
    // แปลงเป็น string แล้ว trim และลดช่องว่างซ้ำให้เหลือ 1 ช่อง
    return String(value).trim().replace(/\s+/g, ' ');
  }


}

