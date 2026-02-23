import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { PurchaseDto, VatSummaryResponse } from './dto/purchase.dto';
import { Purchase } from './models/purchase.entity';
import { plainToClass } from 'class-transformer';
import * as path from 'path';
import { DBFFile } from 'dbffile';
import * as fs from 'fs';
import { VenderService } from '../vender/vender.service';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    @Inject(forwardRef(() => VenderService))
    private readonly venderService: VenderService,
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


async importPurchaseFromDbf(companyId: string, pathDBF: string, pathDBFIV: string): Promise<string> {
  const filePath = path.resolve(
    pathDBF,
  );
  if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);

  const filePathPU = path.resolve(
    pathDBFIV,
  );
  if (!fs.existsSync(filePathPU)) throw new Error(`File not found: ${filePathPU}`);

  // 🧠 เปิดและอ่าน DBF ทั้งสองไฟล์พร้อมกัน
  const [dbf, dbfPU] = await Promise.all([
    DBFFile.open(filePath, { encoding: 'cp874' }),
    DBFFile.open(filePathPU, { encoding: 'cp874' }),
  ]);
  const [records, recordsPU] = await Promise.all([dbf.readRecords(), dbfPU.readRecords()]);

  console.log(`📄 Read ${records.length} rows from ${path.basename(filePath)}`);
  console.log(`📄 Read PU ${recordsPU.length} rows from ${path.basename(filePathPU)}`);

  const result = { inserted: 0, updated: 0, skipped: 0, deleted: 0 };

  // โหลดข้อมูลเก่าทั้งหมดจาก DB
  const existing = await this.purchaseRepository.find({
    where: { companyId }
  });
  const existingMap = new Map(existing.map((r) => [r.documentNumber, r]));

  // รวม record PU ทั้งหมดตาม PONUM
  const recordPUMap = new Map<string, any[]>();
  for (const r of recordsPU) {
    const key = this.cleanText(r.PONUM);
    if (!recordPUMap.has(key)) recordPUMap.set(key, []);
    recordPUMap.get(key)!.push(r);
  }

  // เตรียม vendor codes ล่วงหน้าเพื่อลด query ใน loop
  const allVendorCodes = [...new Set(records.map((r) => this.cleanText(r.SUPCOD)))];
  const vendors = await this.venderService.findByExCodes(allVendorCodes, companyId);
  const vendorMap = new Map(vendors.map((v) => [v.ExCode, v]));

  const exCodesFromFile: string[] = [];
  const newPurchases: any[] = [];
  const updatedPurchases: Partial<any & { id: string }>[] = [];

  for (const record of records) {
    const documentNumber = this.cleanText(record.PONUM);
    const date = new Date(this.cleanText(record.PODAT));
    const receiptDate = new Date(this.cleanText(record.RCVDAT));
    const creditTerm = Number(this.cleanText(record.PAYTRM));
    const vatType = this.cleanText(record.FLGVAT);
    const discount = this.cleanText(record.DISC);
    const totalPriceNoVat = Number(this.cleanText(record.TOTAL));
    const vat = Number(this.cleanText(record.VATAMT));
    const totalPrice = Number(this.cleanText(record.NETAMT));
    const reference = this.cleanText(record.YOUREF);
    const vender = vendorMap.get(this.cleanText(record.SUPCOD));
    const venderId = vender?.id || null;
    const rawDelivery = this.cleanText(record.DLVBY);
    const deliveryBy = rawDelivery.length > 0 ? this.deliveryMap(rawDelivery) : null;

    // ✅ รวม DOCNUM (deduplicate)
    const recordPUList = recordPUMap.get(documentNumber) || [];
    const purchaseNumber = recordPUList.length
      ? [...new Set(recordPUList.map((r) => this.cleanText(r.DOCNUM)).filter(Boolean))].join(',')
      : null;

    if (!documentNumber || !venderId) {
      result.skipped++;
      continue;
    }

    exCodesFromFile.push(documentNumber);

    const existingPurchase = existingMap.get(documentNumber);

    // 🔎 ถ้ามีใน DB แล้ว ตรวจสอบว่าข้อมูลเหมือนเดิมไหม
    if (existingPurchase) {
      const same =
        existingPurchase.date.getTime() === date.getTime() &&
        existingPurchase.receiptDate.getTime() === receiptDate.getTime() &&
        existingPurchase.vatType === vatType &&
        existingPurchase.discount === discount &&
        existingPurchase.totalPriceNoVat.toFixed(2) === totalPriceNoVat.toFixed(2) &&
        existingPurchase.vat.toFixed(2) === vat.toFixed(2) &&
        existingPurchase.totalPrice.toFixed(2) === totalPrice.toFixed(2) &&
        existingPurchase.reference === reference &&
        existingPurchase.creditTerm === creditTerm &&
        existingPurchase.venderId === venderId &&
        existingPurchase.purchaseNumber === purchaseNumber &&
        existingPurchase.deliveryBy === deliveryBy &&
        existingPurchase.companyId === companyId

      if (same) {
        result.skipped++;
        continue;
      }

      updatedPurchases.push({
        id: existingPurchase.id,
        date,
        receiptDate,
        vatType,
        discount,
        totalPriceNoVat,
        vat,
        totalPrice,
        reference,
        venderId,
        creditTerm,
        purchaseNumber,
        deliveryBy,
        companyId,
      });
      result.updated++;
      continue;
    }

    // ➕ เพิ่มใหม่
    newPurchases.push(
      this.purchaseRepository.create({
        documentNumber,
        date,
        receiptDate,
        vatType,
        discount,
        totalPriceNoVat,
        vat,
        totalPrice,
        reference,
        venderId,
        creditTerm,
        purchaseNumber,
        deliveryBy,
        companyId,
      }),
    );
    result.inserted++;
  }

  // ✅ save / update แบบ batch
  // ✅ บันทึกข้อมูลในครั้งเดียว (batch ขนาด 100)
  const BATCH_SIZE = 100;
  if (newPurchases.length > 0) {
    for (let i = 0; i < newPurchases.length; i += BATCH_SIZE) {
      const batch = newPurchases.slice(i, i + BATCH_SIZE);
      await this.purchaseRepository.save(batch);
    }
  }
  if (updatedPurchases.length > 0) {
    for (let i = 0; i < updatedPurchases.length; i += BATCH_SIZE) {
      const batch = updatedPurchases.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map((u) => this.purchaseRepository.update(u.id, u)));
    }
  }

  // 🗑️ ลบข้อมูลที่ไม่มีในไฟล์
  const purchasesToDelete = existing.filter((r) => !exCodesFromFile.includes(r.documentNumber));
  if (purchasesToDelete.length > 0) {
    const idsToDelete = purchasesToDelete.map((r) => r.id);
    await this.purchaseRepository.softDelete({ id: In(idsToDelete), companyId });
    result.deleted = idsToDelete.length;
  }

  const finalCount = await this.purchaseRepository.count();
  console.log(`✅ PURCHASE Import Complete
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
      },
    ): Promise<[PurchaseDto[], number]> {
      const where: any = {};
      if (args?.query != null) where.name = Like(`%${args.query}%`);
      // sensible defaults: undefined means no limit
      const skip = args?.offset ?? 0;
      const take = args?.limit && args.limit > 0 ? args.limit : undefined;
  
      const [arr, count] = await this.purchaseRepository.findAndCount({
        where: Object.keys(where).length ? where : undefined,
        skip,
        take,
      });
  
      const result: [PurchaseDto[], number] = [arr.map((o) => this.mapEntityToDto(o)), count];
      return result;
    }
  
    async findByIds(ids: readonly string[]): Promise<PurchaseDto[]> {
      if (!ids || ids.length === 0) return [];
      
      const purchases = await this.purchaseRepository.find({
        where: { id: In([...ids]) },
      });
      return purchases.map((o) => this.mapEntityToDto(o));
    }

      async findByExCode(documentNumber: string,
        companyId: string = this.DEFAULT_COMPANY_ID
      ): Promise<PurchaseDto | null> {
        const purchase = await this.purchaseRepository.findOne({
          where: { documentNumber: documentNumber, companyId },
        });
    
        return purchase ? this.mapEntityToDto(purchase) : null;
      }

        async findByExCodes(exCodes: string[],
          companyId: string = this.DEFAULT_COMPANY_ID
        ): Promise<PurchaseDto[]> {
        if (!exCodes || exCodes.length === 0) return [];
        const purchases = await this.purchaseRepository.find({
          where: { documentNumber: In(exCodes), companyId },
        });
        return purchases.map((o) => this.mapEntityToDto(o));
      }



      async findByVenderIds(
        venderIds: readonly string[],
      ): Promise<PurchaseDto[]> {
        const purchases = await this.purchaseRepository.find({
          where: {
            venderId: In([...venderIds]),
          },
          relations: ['vender'],
        });
        return purchases.map((o) => this.mapEntityToDto(o));
      }

// สร้าง Interface เพื่อให้ TypeScript ไม่ฟ้อง Error
async findVatTypeByVenderId(venderId: string): Promise<VatSummaryResponse> {
  const purchases = await this.purchaseRepository.find({
    where: { venderId: venderId },
    order: { date: 'DESC' },
  });

  if (!purchases || purchases.length === 0) {
    return { vatType: null, text: null };
  }

  // 1. นับจำนวนแต่ละ VatType
  const counts = purchases.reduce((acc, curr) => {
    if (curr.vatType) {
      acc[curr.vatType] = (acc[curr.vatType] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // 2. หา VatType ที่มีจำนวน count มากที่สุด (Mode)
  let mostFrequentVatType = '2';
  let maxCount = -1;

  Object.entries(counts).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequentVatType = type;
    }
  });

  // 3. แปลงค่าที่นับได้เป็นข้อความสรุป
  const summaryText = Object.entries(counts)
    .map(([type, count]) => {
      const typeName = this.mapVatType(type);
      return typeName ? `${typeName} (${count} ครั้ง)` : null;
    })
    .filter(Boolean)
    .join(', ');

  return {
    vatType: mostFrequentVatType, // ส่งประเภทที่ใช้บ่อยที่สุดกลับไป (เช่น "1")
    text: summaryText || null    // ส่งข้อความสรุปกลับไป
  };
}

private mapVatType(vatType: string) {
  return vatType === '0'
    ? 'ไม่มี VAT'
    : vatType === '1'
    ? 'รวม VAT'
    : vatType === '2'
    ? 'บวก VAT'
    : null;
}

            async findByPurchaseItemIds(
        purchaseItemIds: readonly string[],
      ): Promise<PurchaseDto[]> {
        if (!purchaseItemIds || purchaseItemIds.length === 0) return [];

        const purchases = await this.purchaseRepository
          .createQueryBuilder('purchase')
          .leftJoinAndSelect('purchase.purchaseItem', 'pi')
          .where('pi.id IN (:...ids)', { ids: purchaseItemIds })
          .getMany();

        // ensure uniqueness (defensive)
        const uniquePurchases = purchases.filter(
          (p, idx, arr) => arr.findIndex(x => x.id === p.id) === idx,
        );

        return uniquePurchases.map((o) => this.mapEntityToDto(o));
      }


      mapPurchaseEntityToDto(purchase: Purchase): PurchaseDto {
        return this.mapEntityToDto(purchase);
      }
    
    
    
      private mapEntityToDto(purchase: Purchase): PurchaseDto {
        if (!purchase) return null;
        const dto = plainToClass(PurchaseDto, purchase);
        return dto;
      }
        private cleanText(value: any): string {
    if (!value) return '';
    // แปลงเป็น string แล้ว trim และลดช่องว่างซ้ำให้เหลือ 1 ช่อง
    return String(value).trim().replace(/\s+/g, ' ');
  }

      
}
