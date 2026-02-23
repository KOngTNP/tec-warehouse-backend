import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Like, Not, Repository } from 'typeorm';
import { VenderDto } from './dto/vender.dto';
import { Vender } from './models/vender.entity';
import { plainToClass } from 'class-transformer';
import * as path from 'path';
import { DBFFile } from 'dbffile';
import * as fs from 'fs';
import * as admin from 'firebase-admin';
import { CreateVenderInput } from './dto/create-vender.args';
import { AuthUser } from '../auth/auth.dto';
import { QuotationLog } from '../quotation/models/quotation-log.entity';
import { PurchaseItemService } from '../purchase/purchase-item.service';
import { PurchaseService } from '../purchase/purchase.service';

@Injectable()
export class VenderService {
  constructor(
    @InjectRepository(Vender)
    private venderRepository: Repository<Vender>,
    private entityManager: EntityManager,
    @InjectRepository(QuotationLog)
    private quotationLogRepository: Repository<QuotationLog>,
    @Inject(forwardRef(() => PurchaseService))
    private readonly purchaseService: PurchaseService,
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

async importVenderFromDbf(companyId: string, pathDBF: string): Promise<string> {
  const filePath = path.resolve(
    pathDBF
  );

  if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);

  const dbf = await DBFFile.open(filePath, { encoding: 'cp874' });
  const records = await dbf.readRecords();

  console.log(`📄 Read ${records.length} rows from ${path.basename(filePath)}`);

  const result = { inserted: 0, updated: 0, skipped: 0, deleted: 0 };

  // ✅ โหลดข้อมูลทั้งหมดจาก DB ครั้งเดียว
  const existing: Vender[] = await this.venderRepository.find({
    where: { companyId }
  });
  const existingMap = new Map(existing.map((r) => [r.ExCode, r]));

  const exCodesFromFile: string[] = [];
  const newVenders: Vender[] = [];
  const updatedVenders: { id: string; data: Partial<Vender> }[] = [];

  for (const record of records) {
    const type =
      this.cleanText(record.SUPTYP) == '06' ? 'ผู้จำหน่ายโอนเงิน' :
      this.cleanText(record.SUPTYP) == '04' ? 'ผู้จำหน่ายเงินสด' :
      this.cleanText(record.SUPTYP) == '01' ? 'ผู้จำหน่ายเครดิต' :
      this.cleanText(record.SUPTYP) == '03' ? 'ผู้จำหน่ายออนไลน์' :
      this.cleanText(record.SUPTYP) == '05' ? 'ผู้จำหน่ายรับเช็ค' :
      this.cleanText(record.SUPTYP) == '02' ? 'ผู้จำหน่ายต่างประเทศ' : '';

    const ExCode = this.cleanText(record.SUPCOD);
    const ExAcCode = this.cleanText(record.ACCNUM);
    const name = this.cleanText(`${this.cleanText(record.PRENAM)} ${this.cleanText(record.SUPNAM)}`);

    const rawTaxId = this.cleanText(record.TAXID);
    const taxId = rawTaxId.length === 12 ? '0' + rawTaxId : rawTaxId;

    const orgNum = `0000${this.cleanText(record.ORGNUM)}`;
    const rawOrg = orgNum.slice(-5);
    const branch =
      this.cleanText(record.ORGNUM) == '0' || this.cleanText(record.ORGNUM).length == 0
        ? 'สำนักงานใหญ่'
        : `สาขาที่ ${rawOrg}`;

    const address = this.cleanText(
      `${this.cleanText(record.ADDR01)} ${this.cleanText(record.ADDR02)} ${this.cleanText(record.ADDR03)}`,
    );

    const zipCode = this.cleanText(record.ZIPCOD);
    const creditTerm = Number(this.cleanText(record.PAYTRM));
    const financialCondition = this.cleanText(record.PAYCOND);
    const financialAmount = Number(this.cleanText(record.CRLINE));
    const contact = this.cleanText(record.CONTACT);
    const telNumber = this.cleanText(record.TELNUM);
    const remark = this.cleanText(record.REMARK);
    const rawDelivery = this.cleanText(record.DLVBY);
    const deliveryBy = rawDelivery.length > 0 ? this.deliveryMap(rawDelivery) : null;
    // ✅ ข้ามถ้าไม่มีข้อมูลหลัก
    if (!ExCode || !name || ExCode.length == 0 || name.length == 0) {
      result.skipped++;
      continue;
    }

    exCodesFromFile.push(ExCode);

    const foundByExCode = existingMap.get(ExCode);

    // ถ้ามีข้อมูลอยู่แล้ว → เช็คว่าเหมือนกันทุกฟิลด์ไหม
    if (
      foundByExCode &&
      foundByExCode.type === type &&
      foundByExCode.ExCode === ExCode &&
      foundByExCode.name === name &&
      foundByExCode.taxId === taxId &&
      foundByExCode.ExAcCode === ExAcCode &&
      foundByExCode.branch === branch &&
      foundByExCode.address === address &&
      foundByExCode.zipCode === zipCode &&
      foundByExCode.contact === contact &&
      foundByExCode.telNumber === telNumber &&
      foundByExCode.creditTerm === creditTerm &&
      foundByExCode.financialAmount === financialAmount &&
      foundByExCode.financialCondition === financialCondition &&
      foundByExCode.remark === remark &&
      foundByExCode.deliveryBy == deliveryBy &&
      foundByExCode.companyId == companyId
    ) {
      result.skipped++;
      continue;
    }

    if (foundByExCode) {
      // 🔁 update vendor เดิม
      updatedVenders.push({
        id: foundByExCode.id,
        data: {
          type,
          name,
          taxId,
          ExAcCode,
          branch,
          address,
          zipCode,
          contact,
          telNumber,
          creditTerm,
          financialAmount,
          financialCondition,
          remark,
          deliveryBy,
          companyId,
        },
      });
      result.updated++;
      continue;
    }

    // ➕ เพิ่มใหม่
    newVenders.push(
      this.venderRepository.create({
        ExCode,
        type,
        name,
        taxId,
        ExAcCode,
        branch,
        address,
        zipCode,
        contact,
        telNumber,
        creditTerm,
        financialAmount,
        financialCondition,
        remark,
        deliveryBy,
        companyId,
      }),
    );
    result.inserted++;
  }

  // ✅ save/update ทีเดียว
  // ✅ บันทึกข้อมูลในครั้งเดียว (batch ขนาด 100 เพื่อไม่เต็ม connection pool)
  const BATCH_SIZE = 100;
  if (newVenders.length > 0) {
    for (let i = 0; i < newVenders.length; i += BATCH_SIZE) {
      const batch = newVenders.slice(i, i + BATCH_SIZE);
      await this.venderRepository.save(batch);
    }
  }
  if (updatedVenders.length > 0) {
    for (let i = 0; i < updatedVenders.length; i += BATCH_SIZE) {
      const batch = updatedVenders.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map((v) =>
          this.venderRepository.update(v.id, v.data),
        ),
      );
    }
  }

  // 🗑️ ลบข้อมูลที่ไม่มีใน DBF
  const vendersToDelete = existing.filter(
    (r) => r.ExCode && !exCodesFromFile.includes(r.ExCode),
  );

  if (vendersToDelete.length > 0) {
    const idsToDelete = vendersToDelete.map((r) => r.id);
    await this.venderRepository.softDelete({ id: In(idsToDelete), companyId });
    result.deleted = vendersToDelete.length;
  }

  const finalCount = await this.venderRepository.count();

  console.log(`✅ Update VENDER Complete
📦 จากไฟล์: ${records.length}
📂 ใน DB (หลังอัปเดต): ${finalCount}
➕ เพิ่มใหม่: ${result.inserted}
🔁 อัปเดต: ${result.updated}
⏭️ ข้าม: ${result.skipped}
🗑️ ลบออก: ${result.deleted}`);

  return 'DONE';
}

async updateNote(vendorId: string, note: string, user: AuthUser): Promise<VenderDto> {
  await this.venderRepository.update(vendorId, { note });
  const updatedVender = await this.venderRepository.findOne({ where: { id: vendorId } });
  
  if (!updatedVender) {
    throw new Error(`Vendor with id ${vendorId} not found`);
  }

  const log = this.quotationLogRepository.create({
    affectedId: vendorId,
    subject: 'UPDATE_VENDER-NOTE',
    detail: `จาก ${updatedVender.note || '-'} เป็น ${JSON.stringify(note)}`, 
    note: `Update By "${user?.firstName || ''} ${user?.lastName || ''}"`,
    timeStamp: new Date(),
  });
  
  await this.quotationLogRepository.save(log);
  return this.mapEntityToDto(updatedVender);
}

async findAll(
  args?: {
    limit?: number;
    offset?: number;
    query?: string;
    vendorId?: string[];
    companyId?: string;
  },
): Promise<[VenderDto[], number]> {
  const {
    limit,
    offset = 0,
    query,
    vendorId,
    companyId = this.DEFAULT_COMPANY_ID,
  } = args ?? {};

  // 1. จัดการเงื่อนไข Where
  const where: any = {};

  // ✅ ถ้าไม่ใช่ 'all' ถึงจะใส่เงื่อนไข companyId เข้าไปใน Filter
  if (companyId !== 'all') {
    where.companyId = companyId;
  }
console.log('companyId in findAll:', companyId);
  // filter by name
  if (query != null && query.trim() !== '') {
    where.name = Like(`%${query}%`);
  }

  // exclude vendorIds
  if (vendorId && vendorId.length > 0) {
    where.id = Not(In(vendorId));
  }

  const skip = offset ?? 0;
  const take = limit && limit > 0 ? limit : undefined;

  // 2. Query ข้อมูลจาก Database
  const [arr, count] = await this.venderRepository.findAndCount({
    // ถ้า object where ว่างเปล่า (กรณีลบทุกอย่างออก) ให้ส่ง undefined เพื่อดึงทั้งหมด
    where: Object.keys(where).length ? where : undefined,
    order: { ExCode: 'ASC' },
    skip,
    take,
  });

  // 3. Map ข้อมูล (ใช้ Promise.all เพราะ mapEntityToDto เป็น async)
  const mappedArr = await Promise.all(arr.map((o) => this.mapEntityToDto(o)));

  return [mappedArr, count];
}
  
    async findByIds(ids: readonly string[]): Promise<VenderDto[]> {
      if (!ids || ids.length === 0) return [];
      
      const venders = await this.venderRepository.find({
        where: { id: In([...ids]) },
      });
      const mapped = await venders.map((o) => this.mapEntityToDto(o));

    // sort mapped results to follow the original ids order
    const ordered = ids
      .map((id) => mapped.find((p) => p.id === id))
      .filter(Boolean);

    return ordered;

    }

      async findById(id: string): Promise<VenderDto> {
        const product = await this.venderRepository.findOne({
          where: { id },
        });
    
        return this.mapEntityToDto(product);
      }

      async findByExCode(exCode: string,
        companyId: string = this.DEFAULT_COMPANY_ID
      ): Promise<VenderDto | null> {
        const vender = await this.venderRepository.findOne({
          where: { ExCode: exCode, companyId },
        });
    
        return vender ? this.mapEntityToDto(vender) : null;
      }

  async findByExCodes(exCodes: string[],
    companyId: string = this.DEFAULT_COMPANY_ID
  ): Promise<VenderDto[]> {
      if (!exCodes || exCodes.length === 0) return [];
      const vender = await this.venderRepository.find({
        where: { ExCode: In(exCodes), companyId },
      });
      return vender.map((o) => this.mapEntityToDto(o));
    }
      async findByPurchaseIds(
        purchaseIds: readonly string[],
      ): Promise<VenderDto[]> {
        const venders = await this.venderRepository.find({
          where: {
            purchaseId: In([...purchaseIds]),
          },
          relations: ['purchase'],
        });

        return venders.map((o) => this.mapEntityToDto(o));
      }
      
  
  
    mapVenderEntityToDto(vender: Vender): VenderDto {
      return this.mapEntityToDto(vender);
    }
  
  
  
    private mapEntityToDto(vender: Vender): VenderDto {
      if (!vender) return null;
      const dto = plainToClass(VenderDto, vender);
      return dto;
    }
  
    private cleanText(value: any): string {
    if (!value) return '';
    // แปลงเป็น string แล้ว trim และลดช่องว่างซ้ำให้เหลือ 1 ช่อง
    return String(value).trim().replace(/\s+/g, ' ');
  }


async create(input: CreateVenderInput): Promise<Vender> {
    return await this.entityManager.transaction(async (manager) => {
      // ตรวจสอบก่อนว่า ExCode ซ้ำหรือไม่ (ถ้าจำเป็น)
      const existing = await manager.findOne(Vender, { where: { ExCode: input.ExCode } });
      if (existing) {
        // อาจจะ return ตัวเดิม หรือ throw error ตาม business logic ของพี่
      }

      const newVender = manager.create(Vender, {
        ...input,
        createdAt: new Date(),
      });

      return await manager.save(newVender);
    });
  }
async createVendorSearchFile(companyId: string = this.DEFAULT_COMPANY_ID): Promise<boolean> {
  try {
    const rawVendors = await this.venderRepository
      .createQueryBuilder('vender')
      .leftJoin('purchase', 'purchase', 'purchase.venderId = vender.id')
      .leftJoin('purchase_item', 'purchaseItem', 'purchaseItem.purchaseId = purchase.id')
      .leftJoin('product', 'product', 'product.id = purchaseItem.productId') // join product
      .select([
        'vender.id AS id',
        'vender.name AS name',
        'vender.ExCode AS exCode',
        'vender.telNumber AS telNumber',
        'vender.contact AS contact',
        'vender.taxId AS taxId',
        'product.name AS productName',
        'purchase.date AS purchaseDate',
        'product.ExCode AS productExCode', // เอา exCode ของ product
        'purchaseItem.documentNumber AS documentNumber',
      ])
      .where('product.companyId = :companyId', { companyId })
      .getRawMany();

    // Group by vendor
    const vendorsGrouped = rawVendors.reduce((acc, row) => {
  let vendor = acc.find((v) => v.id === row.id);
  if (!vendor) {
    vendor = {
      id: row.id,
      name: row.name,
      exCode: row.exCode,
      telNumber: row.telNumber,
      contact: row.contact,
      taxId: row.taxId,
      products: [] as { name: string; exCode?: string; lastPurchaseDates?: string }[],
    };
    acc.push(vendor);
  }

  if (row.productName) {
    const existingProduct = vendor.products.find(p => p.name === row.productName);
    if (existingProduct) {
      // เก็บวันที่ล่าสุด
      if (!existingProduct.lastPurchaseDates || row.purchaseDate > existingProduct.lastPurchaseDates) {
        existingProduct.lastPurchaseDates = row.purchaseDate;
      }
    } else {
      vendor.products.push({
        name: row.productName,
        exCode: row.productExCode,
        lastPurchaseDates: row.purchaseDate,
      });
    }
  }

  return acc;
}, []);

// Sort products by lastPurchaseDates (descending)
// Sort products by lastPurchaseDates (descending)
vendorsGrouped.forEach(vendor => {
  vendor.products.sort((a, b) => {
    const dateA = a.lastPurchaseDates ? new Date(a.lastPurchaseDates).getTime() : 0;
    const dateB = b.lastPurchaseDates ? new Date(b.lastPurchaseDates).getTime() : 0;
    return dateB - dateA; // มาก → น้อย
  });
});

    // Map to DTO
    const dtoList = vendorsGrouped.map((v) => this.mapEntityToSearchDto(v));
    // console.log('dtoList', dtoList);
    // Save JSON
    const buffer = Buffer.from(JSON.stringify(dtoList, null, 2), 'utf8');
    const bucket = admin.storage().bucket();
    let file
    if(companyId == '887e6d2f-a266-4a0f-baf3-c6ece1f38210') {
      file = bucket.file('WARE-HOUSE/search/vendor-tm-db.json');
    } else {
      file = bucket.file('WARE-HOUSE/search/vendor-tec-db.json');
    }


    await file.save(buffer, { contentType: 'application/json', public: true });

    console.log(
      `✅ Uploaded to: https://storage.googleapis.com/${bucket.name}/WARE-HOUSE/search/vendor-db.json`
    );

    return true;
  } catch (error) {
    console.error('❌ Error in createVendorSearchFile:', error);
    return false;
  }
}

private mapEntityToSearchDto(entity: any) {
  return {
    id: entity.id,
    vendorName: entity.name,
    exCode: entity.exCode,
    tel: `${entity.telNumber || ""}${entity.contact || ""}`,
    taxId: entity.taxId || "",
    products: entity.products || [],
  };
}
}
