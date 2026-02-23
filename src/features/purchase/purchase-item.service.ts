import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { LastPurchaseItemDetail, PaginatedPurchaseItem, PurchaseItemDto, PurchaseItemSummaryDto } from './dto/purchase-item.dto';
import { PurchaseItem } from './models/purchase-item.entity';
import { plainToClass } from 'class-transformer';
import { Remark } from '../remark/models/remark.entity';
import { RemarkService } from '../remark/remark.service';
import * as path from 'path';
import { DBFFile } from 'dbffile';
import * as fs from 'fs';
import { PurchaseService } from './purchase.service';
import { ProductService } from '../product/product.service';
import { PurchaseDto } from './dto/purchase.dto';
import { Product } from '../product/models/product.entity';

@Injectable()
export class PurchaseItemService {
  constructor(
    @InjectRepository(PurchaseItem)
    private purchaseItemRepository: Repository<PurchaseItem>,
    @Inject(forwardRef(() => RemarkService))
    private readonly remarkService: RemarkService,

    @Inject(forwardRef(() => PurchaseService))
    private readonly purchaseService: PurchaseService,

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

async importPurchaseItemFromDbf(companyId: string, pathDBF: string, pathDBFREMARK: string): Promise<string> {
  const filePath = path.resolve(
      pathDBF,
  );
  const filePathREMARK = path.resolve(
      pathDBFREMARK,
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

  // โหลดข้อมูลเก่าใน DB
  const existing: PurchaseItem[] = await this.purchaseItemRepository.find({
      where: { companyId }
    });
  const existingMap = new Map(existing.map((r) => [r.documentNumber, r]));

  // เตรียมข้อมูลจากไฟล์
  const allPurchaseCodes = [...new Set(records.map((r) => this.cleanText(r.PONUM)))];
  const allProductCodes = [...new Set(records.map((r) => this.cleanText(r.STKCOD)))];

  // ดึงข้อมูลที่เกี่ยวข้องทั้งหมดในครั้งเดียว
  const [purchases, products] = await Promise.all([
    this.purchaseService.findByExCodes(allPurchaseCodes, companyId),
    this.productService.findByExCodes(allProductCodes, companyId),
  ]);

  const purchaseMap = new Map<string, PurchaseDto>(
    purchases.map((p) => [p.documentNumber, p]),
  );
  const productMap = new Map<string, Product>(
    products.map((p): [string, Product] => [p.ExCode, p]),
  );

  const exCodesFromFile: string[] = [];
  const newItems: PurchaseItem[] = [];
  const updatedItems: Partial<PurchaseItem & { id: string }>[] = [];

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
    const documentNumber = `${this.cleanText(record.PONUM)}-${seqNumber}`;
    exCodesFromFile.push(documentNumber);

    const remarkKey = `${this.cleanText(record.SONUM)}-${this.cleanText(record.SEQNUM)}`;
    const remarkText = (remarkMap.get(remarkKey) || []).join(' ');

    const buyName = `${this.cleanText(record.STKDES)} ${remarkText}`.trim();

    const quantity = Number(this.cleanText(record.ORDQTY));
    const actualQuantity = Number(this.cleanText(record.ORDQTY)) * Number(this.cleanText(record.TFACTOR));
    const rawUnit = this.cleanText(record.TQUCOD);
    const unit = this.unitMap(rawUnit) || rawUnit;
    const unitPrice = Number(this.cleanText(record.UNITPR));
    const discount = this.cleanText(record.DISC);
    const totalPrice = Number(this.cleanText(record.TRNVAL));

    const purchase = purchaseMap.get(this.cleanText(record.PONUM));
    const purchaseId = purchase?.id;
    const reference = purchase?.reference;

    const isFree = this.cleanText(record.FREE) == 'Y' || this.cleanText(record.FREE).length > 0 ? true :false;

    const product = productMap.get(this.cleanText(record.STKCOD));
    const productId = product?.id || null;

    if (!documentNumber || !purchaseId) {
            // console.log('❌ ไม่มีข้อมูล');
      result.skipped++;
      continue;
    }

    const found = existingMap.get(documentNumber);

    // ✅ ถ้ามีข้อมูลใน DB แล้ว ตรวจสอบว่าค่าทุกฟิลด์เหมือนเดิมไหม
    if (
      found &&
      found.buyName === buyName &&
      found.quantity.toFixed(2) === quantity.toFixed(2) &&
      found.actualQuantity.toFixed(2) === actualQuantity.toFixed(2) &&
      found.unit === unit &&
      found.unitPrice.toFixed(2) === unitPrice.toFixed(2) &&
      found.discount === discount &&
      found.totalPrice.toFixed(2) === totalPrice.toFixed(2) &&
      found.purchaseId === purchaseId &&
      found.reference === reference &&
      found.productId === productId &&
      found.isFree == isFree &&
      found.companyId === companyId
    ) {
        // console.log('ข้าม')
      result.skipped++;
      continue;
    }

    if (found) {
      // 🔁 อัปเดตข้อมูลที่เปลี่ยน
      updatedItems.push({
        id: found.id,
        buyName,
        quantity,
        actualQuantity,
        unit,
        unitPrice,
        discount,
        totalPrice,
        purchaseId,
        reference,
        productId,
        isFree,
        companyId,
      });
            // console.log(`🔁 พบ ExCode ซ้ำ: ${documentNumber} → อัปเดตข้อมูล`);
      result.updated++;
    } else {
      // ➕ เพิ่มใหม่
      newItems.push(
        this.purchaseItemRepository.create({
          documentNumber,
          buyName,
          quantity,
          actualQuantity,
          unit,
          unitPrice,
          discount,
          totalPrice,
          purchaseId,
          reference,
          productId,
          isFree,
          companyId,
        }),
      );
          // console.log('สร้าง')
      result.inserted++;
    }
  }

  // ✅ บันทึกการเปลี่ยนแปลงทั้งหมดในครั้งเดียว (batch ขนาด 100)
  const BATCH_SIZE = 100;
  if (newItems.length > 0) {
    for (let i = 0; i < newItems.length; i += BATCH_SIZE) {
      const batch = newItems.slice(i, i + BATCH_SIZE);
      await this.purchaseItemRepository.save(batch);
    }
  }
  if (updatedItems.length > 0) {
    for (let i = 0; i < updatedItems.length; i += BATCH_SIZE) {
      const batch = updatedItems.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map((u) => this.purchaseItemRepository.update(u.id, u)));
    }
  }

  // 🗑️ Soft Delete รายการที่ไม่มีในไฟล์
  const purchaseItemsToDelete = existing.filter(
    (r) => !exCodesFromFile.includes(r.documentNumber),
  );
  if (purchaseItemsToDelete.length > 0) {
    const idsToDelete = purchaseItemsToDelete.map((r) => r.id);
    await this.purchaseItemRepository.softDelete({ id: In(idsToDelete), companyId });
    result.deleted = idsToDelete.length;
  }

  const finalCount = await this.purchaseItemRepository.count();

  console.log(`✅ PURCHASE ITEM Import Complete
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
    ): Promise<[PurchaseItemDto[], number]> {
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
  
      const [arr, count] = await this.purchaseItemRepository.findAndCount({
        where: Object.keys(where).length ? where : undefined,
        skip,
        take,
      });
  
      const resultArray = await Promise.all(arr.map((o) => this.mapEntityToDto(o)));
      const result: [PurchaseItemDto[], number] = [resultArray, count];
      return result;
    }
  
    async findByIds(ids: readonly string[]): Promise<PurchaseItemDto[]> {
      const purchaseItems = await this.purchaseItemRepository.find({
        where: { id: In([...ids]) },
      });
      return await Promise.all(purchaseItems.map((o) => this.mapEntityToDto(o)));
    }

    async getLastBuyDetail(productId: string): Promise<LastPurchaseItemDetail | null> {
    const lastPurchaseItem = await this.purchaseItemRepository
      .createQueryBuilder('purchaseItem')
      .leftJoinAndSelect('purchaseItem.purchase', 'purchase')
      .leftJoinAndSelect('purchase.vender', 'vender')
      .where('purchaseItem.productId = :productId', { productId })
      .orderBy('purchase.date', 'DESC') // ✅ sort ตาม date ของ relation
      .getOne();
      return this.mapLastPurchaseItemDetailEntityToDto(lastPurchaseItem) ?? null;
    }

    async getLastBuyDetailMap(productIds: string[], companyId: string): Promise<Map<string, LastPurchaseItemDetail>> {
  if (!productIds.length) return new Map();

  // โหลด purchaseItem พร้อม vender ทีเดียว
  const items = await this.purchaseItemRepository
    .createQueryBuilder('purchaseItem')
    .leftJoinAndSelect('purchaseItem.purchase', 'purchase')
    .leftJoinAndSelect('purchase.vender', 'vender')
    .where('purchaseItem.productId IN (:...productIds)', { productIds })
    .orderBy('purchase.date', 'DESC')
    .getMany();

  // preload remark ทั้งหมดที่เกี่ยวข้อง
  const docNumbers = items.map(i => i.documentNumber).filter(Boolean);
  const remarkMap = await this.remarkService.getRemarkMapByDocNumbers(docNumbers, companyId);
  // console.log('purchaseItemService: ',remarkMap)
  const map = new Map<string, LastPurchaseItemDetail>();
  for (const item of items) {
    if (!map.has(item.productId)) {
      const remark = remarkMap.get(item.documentNumber);
      const dto = plainToClass(LastPurchaseItemDetail, item);
      dto.date = item.purchase?.date ?? null;
      dto.venderName = item.purchase?.vender?.name ?? null;
      dto.venderContact = item.purchase?.vender?.contact ?? null;
      dto.purchaseReference = item.purchase?.reference ?? null;
      dto.vatType = item.purchase?.vatType ?? null;
      dto.remark = remark?.remark || [];
      dto.compareFileNumber = remark?.compareFileNumber || [];
      map.set(item.productId, dto);
    }
  }
  return map;
}


async findByVenderId(
  venderId: string,
  sortField: string = 'purchase.date',
  sortOrder: 'ASC' | 'DESC' = 'DESC',
  // limit = 10,
  // offset = 0,
): Promise<PurchaseItemDto[]> {
  const qb = this.purchaseItemRepository
    .createQueryBuilder('purchaseItem')
    .leftJoinAndSelect('purchaseItem.purchase', 'purchase')
    .leftJoinAndSelect('purchase.vender', 'vender')
    .where('purchase.vender.id = :venderId', { venderId });

  const allowedFields = [
    'purchase.date',
    'purchase.documentNumber',
    'purchaseItem.buyName',
    'vender.name',
    'purchaseItem.unitPrice',
    'purchaseItem.quantity',
    'purchaseItem.discount',
    'purchaseItem.totalPrice',
    'unitPriceAfterDiscount',
  ];

  if (sortField === 'unitPriceAfterDiscount') {
    qb.addSelect(
      'purchaseItem.totalPrice / purchaseItem.quantity',
      'unitPriceAfterDiscount',
    ).orderBy('unitPriceAfterDiscount', sortOrder);
  } else if (allowedFields.includes(sortField)) {
    qb.orderBy(sortField, sortOrder);
  } else {
    qb.orderBy('purchase.date', 'DESC');
  }

  // ---------- ดึงหน้าปัจจุบัน ----------
  const purchases = await qb.getMany();


  return await this.mapEntitiesToDtos(purchases);
}



async findByProductId(
  productId: string,
  sortField: string = 'purchase.date',
  sortOrder: 'ASC' | 'DESC' = 'DESC',
): Promise<PurchaseItemDto[]> {
  const qb = this.purchaseItemRepository
    .createQueryBuilder('purchaseItem')
    .leftJoinAndSelect('purchaseItem.purchase', 'purchase')
    .leftJoinAndSelect('purchase.vender', 'vender')
    .where('purchaseItem.productId = :productId', { productId });

  // whitelist เพื่อกัน SQL injection
  const allowedFields = [
    'purchase.date',
    'purchase.documentNumber',
    'purchaseItem.buyName',
    'vender.name',
    'purchaseItem.unitPrice',
    'purchaseItem.quantity',
    'purchaseItem.discount',
    'purchaseItem.totalPrice',
    'unitPriceAfterDiscount',
  ];

  if (sortField === 'unitPriceAfterDiscount') {
    qb.addSelect(
      'purchaseItem.totalPrice / purchaseItem.quantity',
      'unitPriceAfterDiscount',
    ).orderBy('unitPriceAfterDiscount', sortOrder);
  } else if (allowedFields.includes(sortField)) {
    qb.orderBy(sortField, sortOrder);
  } else {
    qb.orderBy('purchase.date', 'DESC');
  }

  const purchases = await qb.getMany();

  return await this.mapEntitiesToDtos(purchases);
}


      async findByProductIds(
        productIds: readonly string[],
      ): Promise<PurchaseItemDto[]> {
        const purchaseItems = await this.purchaseItemRepository.find({
          where: {
            productId: In([...productIds]),
          },
          relations: ['product'],
        });
        return await Promise.all(purchaseItems.map((o) => this.mapEntityToDto(o)));
      }

          async sumOverallByProductId(productId: string): Promise<PurchaseItemSummaryDto> {
            const totalQuantity = await this
              .purchaseItemRepository
              .createQueryBuilder('purchase_item')
              .select('SUM(purchase_item.actualQuantity)', 'sum')
              .where('purchase_item.productId = :productId', { productId })
              .getRawOne();
                    
            const totalRevenue = await this
              .purchaseItemRepository
              .createQueryBuilder('purchase_item')
              .select('SUM(purchase_item.totalPrice)', 'sum')
              .where('purchase_item.productId = :productId', { productId })
              .getRawOne();
            
            const totalPurchase = await this
              .purchaseItemRepository
              .createQueryBuilder('purchase_item')
              .select('COUNT(purchase_item.id)', 'sum')
              .where('purchase_item.productId = :productId', { productId })
              .getRawOne();
            const summaryDto = new PurchaseItemSummaryDto();
            summaryDto.totalQuantity = totalQuantity.sum;
            summaryDto.totalRevenue = totalRevenue.sum;
            summaryDto.totalPurchase = totalPurchase.sum;

           
            return summaryDto;
      
          }




      async findByPurchaseIds(
        purchaseIds: readonly string[],
      ): Promise<PurchaseItemDto[]> {
        const purchases = await this.purchaseItemRepository.find({
          where: {
            purchaseId: In([...purchaseIds]),
          },
          relations: ['purchase'],
        });
        return await Promise.all(purchases.map((o) => this.mapEntityToDto(o)));
      }

      async findAllByPurchaseId(purchaseId: string): Promise<PurchaseItemDto[]> {
        const purchases = await this.purchaseItemRepository
          .createQueryBuilder('purchaseItem')
          .leftJoinAndSelect('purchaseItem.purchase', 'purchase')
          .where('purchaseItem.purchaseId = :purchaseId', { purchaseId })
          .orderBy('purchaseItem.documentNumber', 'ASC') // หรือ DESC
          .getMany();
      
        return await Promise.all(purchases.map((o) => this.mapEntityToDto(o)));
      }


    private async mapLastPurchaseItemDetailEntityToDto(purchaseItem: PurchaseItem): Promise<LastPurchaseItemDetail> {
      if (!purchaseItem) return null;
      const remarkDetail = await this.remarkService.findRemarkWithValidCode(purchaseItem.documentNumber, purchaseItem.companyId)
      const dto = plainToClass(LastPurchaseItemDetail, purchaseItem);
      dto.date = purchaseItem?.purchase?.date ?? null;
      dto.venderName = purchaseItem?.purchase?.vender?.name ?? null;
      dto.venderContact = purchaseItem?.purchase?.vender?.contact ?? null;
      dto.purchaseReference = purchaseItem?.purchase?.reference ?? null;
      dto.vatType = purchaseItem?.purchase?.vatType ?? null;
      dto.remark = remarkDetail.remark
      dto.compareFileNumber = remarkDetail.compareFileNumber
      return dto;
    }

    async mapPurchaseItemEntityToDto(purchaseItem: PurchaseItem): Promise<PurchaseItemDto> {
      return await this.mapEntityToDto(purchaseItem);
    }
    
    
    
  private async mapEntityToDto(purchaseItem: PurchaseItem): Promise<PurchaseItemDto> {
    if (!purchaseItem) return null;
    const remarkDetail = await this.remarkService.findRemarkWithValidCode(purchaseItem.documentNumber, purchaseItem.companyId)
    const dto = plainToClass(PurchaseItemDto, purchaseItem);
    dto.purchase = purchaseItem.purchase
    dto.remark = remarkDetail.remark
    dto.compareFileNumber = remarkDetail.compareFileNumber
    dto.buyName == purchaseItem.buyName
    return dto;
  }

async mapEntitiesToDtos(purchases: PurchaseItem[]): Promise<PurchaseItemDto[]> {
  if (!purchases?.length) return [];

  const documentNumbers = purchases.map(p => {
    const parts = p.documentNumber?.split('-') || [];
    const seq = parts.length > 1 ? parts.pop() : '0';
    return parts.join('-').trim();
  });

  const remarkList = await this.remarkService.findRemarksWithValidCodes(documentNumbers, purchases[0].companyId);

  // map remarkList ตาม documentNumber
  const remarkMap = new Map<string, typeof remarkList[0][]>();
  for (const r of remarkList) {
    if (!remarkMap.has(r.documentNumber)) remarkMap.set(r.documentNumber, []);
    remarkMap.get(r.documentNumber)!.push(r);
  }

  return purchases.map(p => {
    const dto = plainToClass(PurchaseItemDto, p);

    const parts = p.documentNumber?.split('-') || [];
    const sequence = parts.length > 1 ? parts.pop() : '0';
    const documentNumber = parts.join('-').trim();

    const remarks = remarkMap.get(documentNumber) ?? [];
    const remarkDetail = remarks[0]; // pick first, หรือปรับ logic ตามต้องการ

    dto.purchase = p.purchase;
    dto.remark = remarkDetail?.remark ?? [];
    dto.compareFileNumber = remarkDetail?.compareFileNumber ?? [];
    dto.buyName = p.buyName;

    return dto;
  });
}


async parseDocNumber(code: string) {
  if (!code) return { documentNumber: '', seqNumber: 0 };

  const parts = code.split('-');
  let sequence = '0';

  // ถ้ามีขีด → ตัวสุดท้ายคือ sequence
  if (parts.length > 1) {
    sequence = parts.pop() || '0';
  }

  const documentNumber = parts.join('-').trim();
  const seqNumber = parseInt(sequence.replace(/^0+/, '') || '0', 10);
  
  return { documentNumber, seqNumber };
}

      private cleanText(value: any): string {
    if (!value) return '';
    // แปลงเป็น string แล้ว trim และลดช่องว่างซ้ำให้เหลือ 1 ช่อง
    return String(value).trim().replace(/\s+/g, ' ');
  }


}
