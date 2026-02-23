import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Not, Repository } from 'typeorm';
import { CustomerDto } from './dto/customer.dto';
import { Customer } from './models/customer.entity';
import { plainToClass } from 'class-transformer';
import * as path from 'path';
import { DBFFile } from 'dbffile';
import * as fs from 'fs';
import * as admin from 'firebase-admin';
import { CreateCustomerInput } from './dto/customer.input';


@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
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
  

async importCustomerFromDbf(companyId: string, pathDBF: string): Promise<string> {
  const filePath = path.resolve(
    pathDBF,
  );

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const dbf = await DBFFile.open(filePath, { encoding: 'cp874' });
  const records = await dbf.readRecords();

  console.log(`📄 Read ${records.length} rows from ${path.basename(filePath)}`);

  const result = { inserted: 0, updated: 0, skipped: 0, deleted: 0 };

  // โหลดข้อมูลเก่าทั้งหมดใน DB
  const existing: Customer[] = await this.customerRepository.find({
    where: { companyId }
  });
  const existingMapByExCode = new Map(existing.map((r) => [r.ExCode, r]));

  const exCodesFromFile: string[] = [];
  const newCustomers: Customer[] = [];
  const updatedCustomers: Partial<Customer & { id: string }>[] = [];

  for (const record of records) {
    const type =
      this.cleanText(record.CUSTYP) == '00' ? 'ลูกค้าประจำ' :
      this.cleanText(record.CUSTYP) == '02' ? 'เงินสด โอนเงิน ก่อนส่ง' :
      this.cleanText(record.CUSTYP) == '06' ? 'อุตสาหกรรมเครื่องดื่ม' :
      this.cleanText(record.CUSTYP) == '04' ? 'อุตสาหกรรมอาหาร' :
      this.cleanText(record.CUSTYP) == '11' ? 'ลูกค้ากลุ่ม BNI' :
      this.cleanText(record.CUSTYP) == '08' ? 'รับเหมาก่อสร้าง' :
      null;

    const ExCode = this.cleanText(record.CUSCOD);
    const name = `${this.cleanText(record.PRENAM)} ${this.cleanText(record.CUSNAM)}`;

    const rawTaxId = this.cleanText(record.TAXID);
    const taxId = rawTaxId.length === 12 ? '0' + rawTaxId : rawTaxId;

    const ExAcCode = this.cleanText(record.ACCNUM);
    const orgNum = `0000${this.cleanText(record.ORGNUM)}`;
    const rawOrg = orgNum.slice(-5);
    const branch =
      this.cleanText(record.ORGNUM) == '' || this.cleanText(record.ORGNUM).length == 0
        ? 'สำนักงานใหญ่'
        : `สาขาที่ ${rawOrg}`;

    const address = this.cleanText(
      `${this.cleanText(record.ADDR01)} ${this.cleanText(record.ADDR02)} ${this.cleanText(record.ADDR03)}`,
    );

    const zipCode = this.cleanText(record.ZIPCOD);
    const area = this.cleanText(record.AREACOD);
    const contact = this.cleanText(record.CONTACT);
    const telNumber = this.cleanText(record.TELNUM);
    const creditTerm = Number(this.cleanText(record.PAYTRM));
    const financialAmount = Number(this.cleanText(record.CRLINE));
    const rawDelivery = this.cleanText(record.DLVBY);
    const deliveryBy = rawDelivery.length > 0 ? this.deliveryMap(rawDelivery) : null;
    const condition = this.cleanText(record.PAYCOND);
    const remark = this.cleanText(record.REMARK);

    // ข้ามถ้าข้อมูลหลักหาย
    if (!type || !ExCode || !name || ExCode.length == 0 || name.length == 0) {
      result.skipped++;
      continue;
    }

    exCodesFromFile.push(ExCode);

    // ✅ ตรวจซ้ำทุกฟิลด์
    const foundAll = existing.find(
      (r) =>
        r.type === type &&
        r.ExCode === ExCode &&
        r.name === name &&
        r.taxId === taxId &&
        r.ExAcCode === ExAcCode &&
        r.branch === branch &&
        r.address === address &&
        r.zipCode === zipCode &&
        r.area === area &&
        r.contact === contact &&
        r.telNumber === telNumber &&
        r.creditTerm === creditTerm &&
        r.financialAmount === financialAmount &&
        r.deliveryBy === deliveryBy &&
        r.condition === condition &&
        r.remark === remark &&
        r.companyId === companyId,
        
    );
    if (foundAll) {
      result.skipped++;
      continue;
    }

    // 🔁 เจอ ExCode ซ้ำ → update
    const foundByExCode = existingMapByExCode.get(ExCode);
    if (foundByExCode) {
      updatedCustomers.push({
        id: foundByExCode.id,
        type,
        name,
        taxId,
        ExAcCode,
        branch,
        address,
        zipCode,
        area,
        contact,
        telNumber,
        creditTerm,
        financialAmount,
        deliveryBy,
        condition,
        remark,
        companyId,
      });
      result.updated++;
      continue;
    }

    // ➕ เพิ่มใหม่
    const newCustomer = this.customerRepository.create({
      ExCode,
      type,
      name,
      taxId,
      ExAcCode,
      branch,
      address,
      zipCode,
      area,
      contact,
      telNumber,
      creditTerm,
      financialAmount,
      deliveryBy,
      condition,
      remark,
      companyId,
    });
    newCustomers.push(newCustomer);
    result.inserted++;
  }

  // ✅ Batch Save / Update
  // ✅ บันทึกข้อมูลในครั้งเดียว (batch ขนาด 100 เพื่อไม่เต็ม connection pool)
  const BATCH_SIZE = 100;
  if (newCustomers.length > 0) {
    for (let i = 0; i < newCustomers.length; i += BATCH_SIZE) {
      const batch = newCustomers.slice(i, i + BATCH_SIZE);
      await this.customerRepository.save(batch);
    }
  }
  if (updatedCustomers.length > 0) {
    for (let i = 0; i < updatedCustomers.length; i += BATCH_SIZE) {
      const batch = updatedCustomers.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map((u) => this.customerRepository.update(u.id, u)));
    }
  }

  // 🗑️ Soft Delete รายการที่ไม่มีในไฟล์
  const customersToDelete = existing.filter((r) => r.ExCode && !exCodesFromFile.includes(r.ExCode));
  if (customersToDelete.length > 0) {
    const idsToDelete = customersToDelete.map((r) => r.id);
    await this.customerRepository.softDelete({ id: In(idsToDelete), companyId });
    result.deleted = idsToDelete.length;
  }

  const finalCount = await this.customerRepository.count();

  console.log(`✅ CUSTOMER Import Complete
📦 จากไฟล์: ${records.length}
📂 ใน DB (หลังอัปเดต): ${finalCount}
➕ เพิ่มใหม่: ${result.inserted}
🔁 อัปเดต: ${result.updated}
⏭️ ข้าม: ${result.skipped}
🗑️ ลบออก: ${result.deleted}`);

  return 'DONE';
}

    async findById(id: string): Promise<CustomerDto> {
      const product = await this.customerRepository.findOne({
        where: { id },
      });
  
      return this.mapEntityToDto(product);
    }

  async findAll(args?: {
    limit?: number;
    offset?: number;
    query?: string;
    customerId?: string[];
    companyId?: string;
  }): Promise<[CustomerDto[], number]> {
      const {
    limit,
    offset = 0,
    query,
    customerId,
    companyId = this.DEFAULT_COMPANY_ID,
  } = args ?? {};

  const where: any = {companyId};

  // filter by name
  if (query != null) {
    where.name = Like(`%${query}%`);
  }

  // exclude cubstomerIds
  if (customerId && customerId.length > 0) {
    where.id = Not(In(customerId));
  }

  const skip = offset ?? 0;
  const take = limit && limit > 0 ? limit : undefined;

  const [arr, count] = await this.customerRepository.findAndCount({
    where: Object.keys(where).length ? where : undefined,
    order: { ExCode: 'ASC' },   // <-- order by ExCode ASC
    skip,
    take,
  });

  const result: [CustomerDto[], number] = [arr.map((o) => this.mapEntityToDto(o)), count];
  // await this.createCustomerSearchFile(arr);
  return result;
}
  

async createTempCustomer(customerInput: CreateCustomerInput): Promise<CustomerDto> {
  // 1. สร้างรหัสชั่วคราว หรือใช้ Timestamp เพื่อไม่ให้ ExCode ซ้ำ (Unique Constraint)
  // หากระบบพี่ต้องดึง ExCode ล่าสุดมาบวกหนึ่ง ควรทำ Logic ตรงนี้ครับ
  const customer = this.customerRepository.create({
    type: 'เงินสด โอนเงิน ก่อนส่ง',
    ExCode: '', // ใส่รหัสชั่วคราวกัน Error ใน Database
    name: customerInput.name,
    contact: customerInput.contact,
    ExAcCode: '',
    taxId: customerInput.taxId,
    branch: customerInput.branch,
    address: customerInput.address,
    zipCode: customerInput.zipCode,
    area: '',
    // รวมข้อมูล Tax ID และ สาขา ไว้ในช่องเบอร์โทรตามที่พี่ต้องการ
    telNumber: `TAX ID: ${customerInput.taxId || '-'} ${customerInput.branch || ''}`.trim(),
    creditTerm: 0,
    financialAmount: 0,
    deliveryBy: 'ขนส่งเอกชน',
    condition: 'เงินสด',
    remark: customerInput.remark,
    companyId: customerInput.companyId || 'a618ee20-7099-4fb0-9793-c9efcdf1807e', // ควรระบุบริษัทแม่ที่สร้างรายการนี้
  });

  const savedCustomer = await this.customerRepository.save(customer);
  // แปลงจาก Entity เป็น DTO (หากมีฟิลด์คำนวณใน DTO)
  return plainToClass(CustomerDto, savedCustomer);
}

async findByExCode(
  exCode: string, 
  companyId: string = this.DEFAULT_COMPANY_ID
): Promise<CustomerDto | null> {
  const customer = await this.customerRepository.findOne({
    where: { ExCode: exCode, companyId },
  });

  return customer ? this.mapEntityToDto(customer) : null;
}

async findByExCodes(
  exCodes: string[],
  companyId: string = this.DEFAULT_COMPANY_ID
): Promise<CustomerDto[]> {
  if (!exCodes || exCodes.length === 0) return [];

  const customer = await this.customerRepository.find({
    where: { ExCode: In(exCodes), companyId },
  });

  return customer.map((o) => this.mapEntityToDto(o));
}


  async createCustomerSearchFile(companyId: string = this.DEFAULT_COMPANY_ID): Promise<boolean> {
    try {
      const rawCustomers = await this.customerRepository
        .createQueryBuilder('customer')
        .leftJoin('order', 'order', 'order.customerId = customer.id')
        .leftJoin('order_item', 'orderItem', 'orderItem.orderId = order.id')
        .leftJoin('product', 'product', 'product.id = orderItem.productId') // join product
        .select([
          'customer.id AS id',
          'customer.name AS name',
          'customer.ExCode AS exCode',
          'customer.telNumber AS telNumber',
          'customer.contact AS contact',
          'customer.taxId AS taxId',
          'product.name AS productName',
          'order.date AS orderDate',
          'product.ExCode AS productExCode', // เอา exCode ของ product
          'orderItem.documentNumber AS documentNumber',
        ])
          .where('product.companyId = :companyId', { companyId })
        .getRawMany();
  
      // Group by customer
      const customersGrouped = rawCustomers.reduce((acc, row) => {
    let customer = acc.find((v) => v.id === row.id);
    if (!customer) {
      customer = {
        id: row.id,
        name: row.name,
        exCode: row.exCode,
        telNumber: row.telNumber,
        contact: row.contact,
        taxId: row.taxId,
        products: [] as { name: string; exCode?: string; lastOrderDates?: string }[],
      };
      acc.push(customer);
    }
  
    if (row.productName) {
      const existingProduct = customer.products.find(p => p.name === row.productName);
      if (existingProduct) {
        // เก็บวันที่ล่าสุด
        if (!existingProduct.lastOrderDates || row.orderDate > existingProduct.lastOrderDates) {
          existingProduct.lastOrderDates = row.orderDate;
        }
      } else {
        customer.products.push({
          name: row.productName,
          exCode: row.productExCode,
          lastOrderDates: row.orderDate,
        });
      }
    }
  
    return acc;
  }, []);
  
  // Sort products by lastOrderDates (descending)
  customersGrouped.forEach(customer => {
    customer.products.sort((a, b) => {
      const dateA = a.lastOrderDates ? new Date(a.lastOrderDates).getTime() : 0;
      const dateB = b.lastOrderDates ? new Date(b.lastOrderDates).getTime() : 0;
      return dateB - dateA; // มาก → น้อย
    });
  });
  
      // Map to DTO
      const dtoList = customersGrouped.map((v) => this.mapEntityToSearchDto(v));
      // console.log('dtoList', dtoList);
      // Save JSON
      const buffer = Buffer.from(JSON.stringify(dtoList, null, 2), 'utf8');
      const bucket = admin.storage().bucket();
      let file
      if(companyId == '887e6d2f-a266-4a0f-baf3-c6ece1f38210') {
        file = bucket.file('WARE-HOUSE/search/customer-tm-db.json');
      } else {
        file = bucket.file('WARE-HOUSE/search/customer-tec-db.json');
      }

      await file.save(buffer, { contentType: 'application/json', public: true });
  
      console.log(
        `✅ Uploaded to: https://storage.googleapis.com/${bucket.name}/WARE-HOUSE/search/customer-db.json`
      );
  
      return true;
    } catch (error) {
      console.error('❌ Error in createCustomerSearchFile:', error);
      return false;
    }
  }


  private mapEntityToSearchDto(entity: any) {
  return {
    id: entity.id,
    customerName: entity.name,
    exCode: entity.exCode,
    tel: `${entity.telNumber || ""}${entity.contact || ""}`,
    taxId: entity.taxId || "",
    products: entity.products || [],
  };
}



  async findByIds(ids: readonly string[]): Promise<CustomerDto[]> {
    const customers = await this.customerRepository.find({
      where: { id: In([...ids]) },
    });
          const mapped = await customers.map((o) => this.mapEntityToDto(o));

    // sort mapped results to follow the original ids order
    const ordered = ids
      .map((id) => mapped.find((p) => p.id === id))
      .filter(Boolean);

    return ordered;

    }


  async findByOrderIds(orderIds: readonly string[]): Promise<CustomerDto[]> {
    const customers = await this.customerRepository.find({
      where: {
        orderId: In([...orderIds]),
      },
      relations: ['order'],
    });
    return customers.map((o) => this.mapEntityToDto(o));
  }

  mapCustomerEntityToDto(customer: Customer): CustomerDto {
    return this.mapEntityToDto(customer);
  }

  private mapEntityToDto(customer: Customer): CustomerDto {
    if (!customer) return null;
    const dto = plainToClass(CustomerDto, customer);
    return dto;
  }

  private cleanText(value: any): string {
    if (!value) return '';
    // แปลงเป็น string แล้ว trim และลดช่องว่างซ้ำให้เหลือ 1 ช่อง
    return String(value).trim().replace(/\s+/g, ' ');
  }
}
