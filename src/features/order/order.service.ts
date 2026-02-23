import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { OrderDto } from './dto/order.dto';
import { Order } from './models/order.entity';
import { plainToClass } from 'class-transformer';
import * as path from 'path';
import { DBFFile } from 'dbffile';
import * as fs from 'fs';
import { CustomerService } from '../customer/customer.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @Inject(forwardRef(() => CustomerService))
    private readonly customerService: CustomerService,
  ) {}
private readonly DEFAULT_COMPANY_ID = 'a618ee20-7099-4fb0-9793-c9efcdf1807e';
  deliveryMap(rawDelivery: string): string {
  const deliveryMapData: Record<string, string> = {
  'CC': 'ลูกค้ารับเอง',
  'CB': 'รถบริษัท',
  'KK': 'ทางไปรษณีย์',
  'AA': 'ขนส่งเอกชน',
  'TS': 'ร้านค้าส่งให้',
  'TB': 'ไปรับเองที่ร้า',
  'PD': 'พระประแดง',
  'SS': 'สำนักงานใหญ่',
  'NK': 'หนองแค',
  'BP': 'บางปู',
  'RY': 'ระยอง',
  'SB': 'สิงห์บุรี',
  'PH': 'แพรกษา',
  'PP': 'พลาทรัพย์',
  'BB': 'บ้านบึง',
  'NN': 'นวนคร',
  'VM': 'วังม่วง',
  'SP': 'สมุทรปราการ',
  'AM': 'อมตะนคร',
  'LS': 'ลาซาน',
  'SR': 'สำโรง',
  'NE': 'หนองลี',
  'TF': 'ทางเครื่องบิน',
  'HT': 'หาดใหญ่',
  'RJ': 'โรจนะ',
  'NP': 'นพวงศ์',
  'BO': 'คลังบุคคโล',
  'TT': 'ไปรับ-ส่งให้',
  'TA': 'เก็บปลายทาง',
  '42': 'LMC2_SPARE PART',
  '41': 'LMC2_SPARE PART',
  '31': 'LMC2_MAIN GATE',
  '32': 'LMC2_MAIN GATE',
  '72': 'LMC_MAIN GATE',
  '73': 'LMC_MAIN GATE_B',
  '71': 'LMC_MAIN GATE',
  '11': 'LMA_MAIN GATE',
  '61': 'LMC_SPARE PART',
  '21': 'LMA_SPARE PART',
  '74': 'LMC_MAIN_MIX',
  '51': 'LMC2_RM-ZP2',
  '62': 'LMC_SPARE PARTS',
  };

  return deliveryMapData[rawDelivery] || rawDelivery;
}
async importOrderFromDbf(companyId: string, pathDBF: string, pathDBFIV: string): Promise<string> {
  const filePath = path.resolve(
    pathDBF,
  );
  const filePathIV = path.resolve(
    pathDBFIV,
  );

  if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
  if (!fs.existsSync(filePathIV)) throw new Error(`File not found: ${filePathIV}`);

  const [dbf, dbfIV] = await Promise.all([
    DBFFile.open(filePath, { encoding: 'cp874' }),
    DBFFile.open(filePathIV, { encoding: 'cp874' }),
  ]);

  const [records, recordsIV] = await Promise.all([dbf.readRecords(), dbfIV.readRecords()]);

  console.log(`📄 Read ${records.length} rows from ${path.basename(filePath)}`);
  console.log(`📄 Read IV ${recordsIV.length} rows from ${path.basename(filePathIV)}`);

  const result = { inserted: 0, updated: 0, skipped: 0, deleted: 0 };

  // โหลดข้อมูลจาก DB
  const existing = await this.orderRepository.find({
    where: { companyId }
  });
  const existingMap = new Map(existing.map((r) => [r.documentNumber, r]));

  // 🧠 รวม invoice records ตาม SONUM
  const recordIVMap = new Map<string, any[]>();
  for (const r of recordsIV) {
    const key = this.cleanText(r.SONUM);
    if (!recordIVMap.has(key)) recordIVMap.set(key, []);
    recordIVMap.get(key)!.push(r);
  }

  // เตรียม ExCode สำหรับ lookup ลูกค้า
  const allCustomerCodes = [...new Set(records.map((r) => this.cleanText(r.CUSCOD)))];
  const customers = await this.customerService.findByExCodes(allCustomerCodes, companyId);
  const customerMap = new Map(customers.map((c) => [c.ExCode, c]));

  const exCodesFromFile: string[] = [];
  const newOrders: Order[] = [];
  const updatedOrders: Partial<Order & { id: string }>[] = [];

  for (const record of records) {
    const documentNumber = this.cleanText(record.SONUM);
    const date = new Date(this.cleanText(record.SODAT));
    const deliveryDate = new Date(this.cleanText(record.DLVDAT));
    const creditTerm = Number(this.cleanText(record.PAYTRM));
    const vatType = this.cleanText(record.FLGVAT);
    const discount = this.cleanText(record.DISC);
    const totalPriceNoVat = Number(this.cleanText(record.TOTAL));
    const vat = Number(this.cleanText(record.VATAMT));
    const totalPrice = Number(this.cleanText(record.NETAMT));
    const reference = this.cleanText(record.YOUREF);
    const customer = customerMap.get(this.cleanText(record.CUSCOD));
    const customerId = customer?.id || null;
    const rawDelivery = this.cleanText(record.DLVBY);
    const deliveryBy = rawDelivery.length > 0 ? this.deliveryMap(rawDelivery) : null;


    // ✅ รวม invoice records ของ SONUM
    const recordIVList = recordIVMap.get(documentNumber) || [];

    // 🧩 รวม DOCNUM และ BILNUM + deduplicate
    const invoiceNumber = recordIVList.length
      ? [...new Set(recordIVList.map((r) => this.cleanText(r.DOCNUM)).filter(Boolean))].join(',')
      : null;

    const billNumber = recordIVList.length
      ? [...new Set(recordIVList.map((r) => this.cleanText(r.BILNUM)).filter(Boolean))].join(',')
      : null;

    if (!documentNumber || !customerId || documentNumber.length === 0 || customerId.length === 0) {
      result.skipped++;
      continue;
    }

    exCodesFromFile.push(documentNumber);

    const existingOrder = existingMap.get(documentNumber);

    if (existingOrder) {
      const same =
        existingOrder.date.getTime() === date.getTime() &&
        existingOrder.deliveryDate.getTime() === deliveryDate.getTime() &&
        existingOrder.vatType === vatType &&
        existingOrder.discount === discount &&
        existingOrder.totalPriceNoVat.toFixed(2) === totalPriceNoVat.toFixed(2) &&
        existingOrder.vat.toFixed(2) === vat.toFixed(2) &&
        existingOrder.totalPrice.toFixed(2) === totalPrice.toFixed(2) &&
        existingOrder.reference === reference &&
        existingOrder.customerId === customerId &&
        existingOrder.creditTerm === creditTerm &&
        existingOrder.invoiceNumber === invoiceNumber &&
        existingOrder.billNumber === billNumber &&
        existingOrder.deliveryBy === deliveryBy &&
        existingOrder.companyId === companyId

      if (same) {
        result.skipped++;
        continue;
      }

      updatedOrders.push({
        id: existingOrder.id,
        date,
        deliveryDate,
        vatType,
        discount,
        totalPriceNoVat,
        vat,
        totalPrice,
        reference,
        customerId,
        creditTerm,
        invoiceNumber,
        billNumber,
        deliveryBy,
        companyId,
      });
      result.updated++;
      continue;
    }

    // ➕ เพิ่มใหม่
    newOrders.push(
      this.orderRepository.create({
        documentNumber,
        date,
        deliveryDate,
        vatType,
        discount,
        totalPriceNoVat,
        vat,
        totalPrice,
        reference,
        customerId,
        creditTerm,
        invoiceNumber,
        billNumber,
        deliveryBy,
        companyId,
      }),
    );
    result.inserted++;
  }

  // ✅ บันทึกครั้งเดียว
  // ✅ บันทึกข้อมูลในครั้งเดียว (batch ขนาด 100)
  const BATCH_SIZE = 100;
  if (newOrders.length > 0) {
    for (let i = 0; i < newOrders.length; i += BATCH_SIZE) {
      const batch = newOrders.slice(i, i + BATCH_SIZE);
      await this.orderRepository.save(batch);
    }
  }
  if (updatedOrders.length > 0) {
    for (let i = 0; i < updatedOrders.length; i += BATCH_SIZE) {
      const batch = updatedOrders.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map((u) => this.orderRepository.update(u.id, u)));
    }
  }

  // 🧹 ลบออก
  const ordersToDelete = existing.filter((r) => !exCodesFromFile.includes(r.documentNumber));
  if (ordersToDelete.length > 0) {
    const idsToDelete = ordersToDelete.map((r) => r.id);
    await this.orderRepository.softDelete({ id: In(idsToDelete), companyId });
    result.deleted = idsToDelete.length;
  }

  const finalCount = await this.orderRepository.count();

  console.log(`✅ ORDER Import Complete
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
  ): Promise<[OrderDto[], number]> {
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

    const [arr, count] = await this.orderRepository.findAndCount({
      where: Object.keys(where).length ? where : undefined,
      skip,
      take,
    });

    const result: [OrderDto[], number] = [arr.map((o) => this.mapEntityToDto(o)), count];
    return result;
  }

  async findByIds(ids: readonly string[]): Promise<OrderDto[]> {
    if (!ids || ids.length === 0) return [];
    
    const orders = await this.orderRepository.find({
      where: { id: In([...ids]) },
    });
    return orders.map((o) => this.mapEntityToDto(o));
  }

  async findById(id: string): Promise<OrderDto> {
    const order = await this.orderRepository.findOne({id})

    return this.mapEntityToDto(order)
  }
  async findByDocumentNumber(documentNumber: string,
    companyId: string = this.DEFAULT_COMPANY_ID
  ): Promise<OrderDto> {
    const order = await this.orderRepository.findOne({
      where: { documentNumber: documentNumber, companyId },
    })
    // console.log(order)
    return this.mapEntityToDto(order)
  }
  

  async findByExCode(documentNumber: string,
    companyId: string = this.DEFAULT_COMPANY_ID
  ): Promise<OrderDto | null> {
    const order = await this.orderRepository.findOne({
      where: { documentNumber: documentNumber, companyId },
    });

    return order ? this.mapEntityToDto(order) : null;
  }

  async findByExCodes(exCodes: string[],
    companyId: string = this.DEFAULT_COMPANY_ID
  ): Promise<OrderDto[]> {
  if (!exCodes || exCodes.length === 0) return [];
  const orders = await this.orderRepository.find({
    where: { documentNumber: In(exCodes), companyId },
  });
  return orders.map((o) => this.mapEntityToDto(o));
}

  
  async findByCustomerIds(
    customerIds: readonly string[],
  ): Promise<OrderDto[]> {
    const orders = await this.orderRepository.find({
      where: {
        customerId: In([...customerIds]),
      },
      relations: ['customer'],
    });
    return orders.map((o) => this.mapEntityToDto(o));
  }


  mapOrderEntityToDto(order: Order): OrderDto {
    return this.mapEntityToDto(order);
  }



  private mapEntityToDto(order: Order): OrderDto {
    if (!order) return null;
    const dto = plainToClass(OrderDto, order);
    return dto;
  }

  private cleanText(value: any): string {
    if (!value) return '';
    // แปลงเป็น string แล้ว trim และลดช่องว่างซ้ำให้เหลือ 1 ช่อง
    return String(value).trim().replace(/\s+/g, ' ');
  }


}