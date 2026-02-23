import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { OrderIvDto } from './dto/order-iv.dto';
import { OrderIv } from './models/order-iv.entity';
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
export class OrderIvService {
  constructor(
    @InjectRepository(OrderIv)
    private orderIvRepository: Repository<OrderIv>,
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

async importOrderIvFromDbf(companyId: string, pathDBF: string, pathDBFREMARK: string): Promise<string> {
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
    const existing: OrderIv[] = await this.orderIvRepository.find({
      where: { companyId }
    });
    const existingMap = new Map(
      existing.map((r) => [`${r.documentNumber}_${r.seqNumber}${r.productId ? `_${r.productId}` : ''}`, r])
    );

    const allOrderCodes = [...new Set(records.map((r) => this.cleanSeqnum(r.RDOCNUM)))];
    const allProductCodes = [...new Set(records.map((r) => this.cleanText(r.STKCOD)))];

    const [orders, products] = await Promise.all([
      this.orderService.findByExCodes(allOrderCodes, companyId),
      this.productService.findByExCodes(allProductCodes, companyId),
    ]);

    const orderMap = new Map<string, OrderDto>(orders.map((o) => [o.documentNumber, o]));
    const productMap = new Map<string, Product>(
      products.map((p): [string, Product] => [p.ExCode, p])
    );

    const newItems: OrderIv[] = [];
    const updatedItems: Partial<OrderIv & { id: string }>[] = [];
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
      if ((this.cleanText(record.DOCNUM))?.includes("IV") || (this.cleanText(record.DOCNUM))?.includes("HS")) {
      const seqNumber = Number(this.cleanText(record.SEQNUM));
      const documentNumber = `${this.cleanText(record.DOCNUM)}`;
      // exCodesFromFile.push(documentNumber);
      const date = new Date(this.cleanText(record.DOCDAT));

      const remarkKey = `${this.cleanText(record.DOCNUM)}-${this.cleanText(record.SEQNUM)}`;
      const remarkText = (remarkMap.get(remarkKey) || []).join(' ');

      const sellName = `${this.cleanText(record.STKDES)} ${remarkText}`.trim();
      const quantity = Number(this.cleanText(record.TRNQTY));
      const actualQuantity = Number(this.cleanText(record.TRNQTY)) * Number(this.cleanText(record.TFACTOR));
      const unit = this.unitMap(this.cleanText(record.TQUCOD));

      const unitPrice = Number(this.cleanText(record.UNITPR));
      const discount = this.cleanText(record.DISC);

      const totalPrice = Number(this.cleanText(record.TRNVAL));
      const isFree = this.cleanText(record.FREE) == 'Y' || this.cleanText(record.FREE).length > 0 ? true :false;

      const order = orderMap.get(this.cleanSeqnum(record.RDOCNUM));
      // console.log("this.cleanSeqnum(record.RDOCNUM):",(this.cleanSeqnum(record.RDOCNUM)))
      const product = productMap.get(this.cleanText(record.STKCOD));
            exCodesFromFile.push(`${documentNumber}_${seqNumber}${product?.id ? `_${product?.id}` : ''}`);
      if (!documentNumber || !order?.id) {
        // console.log('pass ! docNum: ',order)
        // console.log('pass ! docNum: ',order)
        result.skipped++;
        continue;
      }

      const found = existingMap.get(`${documentNumber}_${seqNumber}${product?.id ? `_${product?.id}` : ''}`);
      // console.log('const found = existingMap.get(documentNumber);: ',existingMap.get(documentNumber))
      if (
        found &&
        found.sellName === sellName &&
        found.seqNumber === seqNumber &&
        found.date === date && 
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
  if (found.quantity.toFixed(2) !== quantity.toFixed(2)) {
    changes.push(`quantity: ${found.quantity.toFixed(2)} → ${quantity.toFixed(2)}`);
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
  if (found.totalPrice.toFixed(2) !== totalPrice.toFixed(2)) {
    changes.push(`totalPrice: ${found.totalPrice.toFixed(2)} → ${totalPrice}.toFixed(2)`);
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
    seqNumber,
    date,
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
          this.orderIvRepository.create({
            documentNumber,
            seqNumber,
            date,
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
            companyId
          }),
        );
        result.inserted++;
      }
      }
    }

    const BATCH_SIZE = 100;
    if (newItems.length > 0) {
      if (newItems.length > 500) {
        await this.saveInChunks(newItems, 500);
      } else {
        for (let i = 0; i < newItems.length; i += BATCH_SIZE) {
          const batch = newItems.slice(i, i + BATCH_SIZE);
          await this.orderIvRepository.save(batch);
        }
      }
    }
    if (updatedItems.length > 0) {
      for (let i = 0; i < updatedItems.length; i += BATCH_SIZE) {
        const batch = updatedItems.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map((u) => this.orderIvRepository.update(u.id, u)));
      }
    }

    // 🗑️ soft delete
    const orderIvsToDelete = existing.filter(
      (r) => !exCodesFromFile.includes(`${r.documentNumber}_${r.seqNumber}${r.productId ? `_${r.productId}` : ''}`),
    );
    if (orderIvsToDelete.length > 0) {
      const idsToDelete = orderIvsToDelete.map((r) => r.id);
      await this.orderIvRepository.softDelete({ id: In(idsToDelete), companyId });
      result.deleted = idsToDelete.length;
    }

    const finalCount = await this.orderIvRepository.count();
    console.log(`✅ ORDER IV Import Complete
    📦 จากไฟล์: ${records.length}
    📂 ใน DB (หลังอัปเดต): ${finalCount}
    ➕ เพิ่มใหม่: ${result.inserted}
    🔁 อัปเดต: ${result.updated}
    ⏭️ ข้าม: ${result.skipped}
    🗑️ ลบออก: ${result.deleted}`);

    return 'DONE';
  }

async findByOrderIdAndProductId(
  orderId: string,
  productId: string
): Promise<OrderIvDto[]> {
  const orderIvs = await this.orderIvRepository.find({
    where: { orderId, productId },
    relations: ['order'],
  });

  // --- เก็บเฉพาะ documentNumber ที่ unique ---
  const uniqueMap = new Map<string, OrderIv>();

  for (const iv of orderIvs) {
    if (!uniqueMap.has(iv.documentNumber)) {
      uniqueMap.set(iv.documentNumber, iv);
    }
  }

  return Array.from(uniqueMap.values()).map((iv) =>
    this.mapOrderIvEntityToDto(iv)
  );
}

  
    async findByOrderId(orderId: string): Promise<OrderIvDto[]> {
      const orderIvs = await this.orderIvRepository.find({
        where: {
          orderId,
        },
        order: {
        seqNumber: 'ASC', // หรือ 'DESC'
      },
        relations: ['order', 'product'],
      });
      return orderIvs.map((prr) => this.mapOrderIvEntityToDto(prr));
    }


     async findByDocumentNumber(documentNumber: string,    companyId: string = this.DEFAULT_COMPANY_ID ): Promise<OrderIvDto[]> {
      const orderIvs = await this.orderIvRepository.find({
        where: {
          documentNumber,
          companyId,
        },
        order: {
        seqNumber: 'ASC', // หรือ 'DESC'
      },
        relations: ['order', 'product'],
      });
      // console.log('orderIvs: ', orderIvs)
      return orderIvs.map((prr) => this.mapOrderIvEntityToDto(prr));
    }


      mapOrderIvEntityToDto(orderIv: OrderIv): OrderIvDto {
        return this.mapEntityToDto(orderIv);
      }
    
    
    
      private mapEntityToDto(orderIv: OrderIv): OrderIvDto {
        if (!orderIv) return null;
        const dto = plainToClass(OrderIvDto, orderIv);
        dto.order = orderIv.order
         dto.product = orderIv.product
        return dto;
      }
    private cleanText(value: any): string {
    if (!value) return '';
    // แปลงเป็น string แล้ว trim และลดช่องว่างซ้ำให้เหลือ 1 ช่อง
    return String(value).trim().replace(/\s+/g, ' ');
  }
private cleanSeqnum(value: any): string {
  if (!value) return '';

  // เอาช่องว่างทั้งหมดออก
  let cleaned = value.replace(/\d+$/, '');
  // ตัดเลขท้ายออก
  cleaned = cleaned.replace(/\s+/g, '');

  return cleaned;
}

private async saveInChunks(items: any[], chunkSize = 500) {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    await this.orderIvRepository.save(chunk);
    // console.log('length: ', items.length)
    // console.log('DONE: ', chunkSize)
  }
}

}

