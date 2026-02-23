import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Like, Repository } from 'typeorm';
import { ComparePriceDto } from './dto/compare-price.dto';
import { ComparePrice } from './models/compare-price.entity';
import { plainToClass } from 'class-transformer';
import { CreateComparePriceInput } from './dto/create-compare-price.input';
import * as admin from 'firebase-admin';
import { UpdateComparePriceInput } from './dto/update-compare-price.input';
import { QuotationLog } from '../quotation/models/quotation-log.entity';
import { AuthUser } from '../auth/auth.dto';

@Injectable()
export class ComparePriceService {
  constructor(
    @InjectRepository(ComparePrice)
    private comparePriceRepository: Repository<ComparePrice>,
    private readonly entityManager: EntityManager,
    @InjectRepository(QuotationLog)
    private quotationLogRepository: Repository<QuotationLog>,
  ) {}

  async findByQuotationItemProductIds(ids: readonly string[]): Promise<ComparePriceDto[]> {
    if (!ids || ids.length === 0) return [];

    const results = await this.comparePriceRepository.find({
      where: {
        quotationItemProductId: In([...ids]),
      },
      // สามารถใส่ order เพื่อให้ราคาที่ถูกที่สุดขึ้นก่อนได้
      order: { 
        sequence: 'ASC',   // ✅ เรียงตามลำดับที่จัดไว้ก่อน
        createdAt: 'DESC'  // ถ้า sequence เท่ากัน ค่อยเอาอันใหม่ขึ้นก่อน
      },
      relations: ['vender', 'saleUser'], // ✅ ถ้าต้องการโชว์ชื่อ Vender ใน Card ต้องโหลด relation มาด้วย
    });

    return results.map((o) => this.mapEntityToDto(o));
  }
  // ใน ComparePriceService

  async updateSequence(sequences: { id: string; sequence: number }[]): Promise<boolean> {
  return await this.entityManager.transaction(async (manager) => {
    try {
      await Promise.all(
        sequences.map((item) =>
          manager.update(ComparePrice, item.id, { sequence: item.sequence }),
        ),
      );
      return true;
    } catch (error) {
      console.error('Update sequence failed:', error);
      throw new Error('ไม่สามารถเปลี่ยนลำดับได้');
    }
  });
}


async delete(id: string, user:AuthUser): Promise<boolean> {
  const bucket = admin.storage().bucket();

  return await this.entityManager.transaction(async (manager) => {
    // 1. ค้นหาข้อมูลเดิมก่อนลบ
    const cp = await manager.findOne(ComparePrice, { where: { id } });
    if (!cp) throw new Error('ไม่พบข้อมูลราคาเปรียบเทียบที่ต้องการลบ');

    try {
      // 2. ลบรูปภาพทั้งหมดใน Firebase Storage ที่ผูกกับ ID นี้
      if (cp.images && cp.images.length > 0) {
        await Promise.all(
          cp.images.map(async (url) => {
            try {
              // ดึง path จาก URL เพื่อลบไฟล์
              const path = url.split(`${bucket.name}/`)[1];
              if (path) {
                await bucket.file(path).delete();
              }
            } catch (err) {
              console.error(`ลบไฟล์ใน Storage ไม่สำเร็จ: ${url}`, err);
              // ไม่โยน error เพื่อให้การลบ Record ใน DB ดำเนินต่อไปได้
            }
          }),
        );
      }

      // 3. ลบข้อมูลจาก Database
                  const log = this.quotationLogRepository.create({
    affectedId: id,
    subject: 'DELETE_COMPARE-PRICE', // เปลี่ยนชื่อให้ตรงกับเหตุการณ์
    detail: `${JSON.stringify(cp)}`, // ใช้ detail เก็บรายละเอียด
    note: `Delete By "${user.firstName} ${user.lastName}"`,
    timeStamp: new Date(),
  });
  await this.quotationLogRepository.save(log);

      await manager.delete(ComparePrice, id);

      return true;
    } catch (error) {
      throw new Error(`การลบข้อมูลล้มเหลว: ${error.message}`);
    }
  });
}

// async updatePoNumber(id: string, poNumber?: string): Promise<ComparePriceDto> {
//   return await this.entityManager.transaction(async (manager) => {
//     // 1. หาข้อมูลรายการที่กำลังจะแก้
//     const target = await manager.findOne(ComparePrice, { where: { id } });
//     if (!target) throw new Error('ไม่พบข้อมูลราคาเปรียบเทียบ');

//     // 2. [Optional Logic] ถ้าพี่ต้องการให้ 1 Product เลือกได้แค่เจ้าเดียว 
//     // ให้เคลียร์ isPick ของเจ้าอื่นใน quotationItemProductId เดียวกันก่อน

//     // 3. อัปเดตข้อมูลการเลือก
//     await manager.update(ComparePrice, id, {
//       poNumber: poNumber ? poNumber : null
//     });

//     const updated = await manager.findOne(ComparePrice, { where: { id } });
//     return this.mapEntityToDto(updated);
//   });
// }

async updateDisableStatus(id: string, isDisable: boolean, disableNote?: string, user?: AuthUser): Promise<ComparePriceDto> {
  return await this.entityManager.transaction(async (manager) => {
    // 1. หาข้อมูลรายการที่กำลังจะแก้
    const target = await manager.findOne(ComparePrice, { where: { id } });
    if (!target) throw new Error('ไม่พบข้อมูลราคาเปรียบเทียบ');

    // 2. [Optional Logic] ถ้าพี่ต้องการให้ 1 Product เลือกได้แค่เจ้าเดียว 
    // ให้เคลียร์ isPick ของเจ้าอื่นใน quotationItemProductId เดียวกันก่อน
    if (isDisable && target.quotationItemProductId) {
      await manager.update(ComparePrice, 
        { quotationItemProductId: target.quotationItemProductId }, 
        { isPick: false , poNumber : ''}
      );
    }

    // 3. อัปเดตข้อมูลการเลือก
    await manager.update(ComparePrice, id, {
      isDisable,
      disableNote: isDisable ? disableNote : null,
      disableBy: isDisable ? `${user.firstName} ${user.lastName}` : null,
    });

        await manager.update(ComparePrice, id, {
      isDisable,
      disableNote: isDisable ? disableNote : null, // ถ้าเอาออกให้ล้าง Note ด้วย (หรือจะเก็บไว้ก็ได้แล้วแต่พี่)
      disableBy: isDisable ? `${user.firstName} ${user.lastName}` : null,
    });

          const log = this.quotationLogRepository.create({
    affectedId: id,
    subject: 'UPDATE_COMPARE-PRICE-DISABLE', // เปลี่ยนชื่อให้ตรงกับเหตุการณ์
    detail: `จาก ${JSON.stringify({isDisable: target.isDisable,disableNote: target.disableNote, disableBy: target.disableBy})} เป็น ${JSON.stringify({isDisable,disableNote: isDisable ? disableNote : null, disableBy: isDisable ? `${user.firstName} ${user.lastName}` : null,
    })}`, 
   note: `Update By "${user.firstName} ${user.lastName}"`,
    timeStamp: new Date(),
  });
  await this.quotationLogRepository.save(log);


    const updated = await manager.findOne(ComparePrice, { where: { id } });
    return this.mapEntityToDto(updated);
  });
}

async updatePickStatus(id: string, isPick: boolean, pickNote?: string, poNumber?: string, user?: AuthUser): Promise<ComparePriceDto> {
  return await this.entityManager.transaction(async (manager) => {
    // 1. หาข้อมูลรายการที่กำลังจะแก้
    const target = await manager.findOne(ComparePrice, { where: { id } });
    if (!target) throw new Error('ไม่พบข้อมูลราคาเปรียบเทียบ');

    // 2. [Optional Logic] ถ้าพี่ต้องการให้ 1 Product เลือกได้แค่เจ้าเดียว 
    // ให้เคลียร์ isPick ของเจ้าอื่นใน quotationItemProductId เดียวกันก่อน
    if (isPick && target.quotationItemProductId) {
      await manager.update(ComparePrice, 
        { quotationItemProductId: target.quotationItemProductId }, 
        { isPick: false , poNumber : ''}
      );
    }

    // 3. อัปเดตข้อมูลการเลือก
    await manager.update(ComparePrice, id, {
      isPick,
      pickNote: isPick ? pickNote : null, // ถ้าเอาออกให้ล้าง Note ด้วย (หรือจะเก็บไว้ก็ได้แล้วแต่พี่)
      poNumber: poNumber ? poNumber : null,
      pickBy: (target.isPick && target.pickNote == pickNote && isPick == target.isPick) ? target.pickBy : isPick ? `${user.firstName} ${user.lastName}` : null,
    });

          const log = this.quotationLogRepository.create({
    affectedId: id,
    subject: 'UPDATE_COMPARE-PRICE-PICKUP', // เปลี่ยนชื่อให้ตรงกับเหตุการณ์
    detail: `จาก ${JSON.stringify({isPick: target.isPick,pickNote: target.pickNote, poNumber: target.poNumber, pickBy: target.pickBy})} เป็น ${JSON.stringify({isPick,pickNote: isPick ? pickNote : null, // ถ้าเอาออกให้ล้าง Note ด้วย (หรือจะเก็บไว้ก็ได้แล้วแต่พี่)poNumber: poNumber ? poNumber : null,pickBy: isPick ? `${user.firstName} ${user.lastName}` : null,
    })}`, 
   note: `Update By "${user.firstName} ${user.lastName}"`,
    timeStamp: new Date(),
  });
  await this.quotationLogRepository.save(log);

    const updated = await manager.findOne(ComparePrice, { where: { id } });
    return this.mapEntityToDto(updated);
  });
}
// ใน ComparePriceService


async findByProductId(productId: string): Promise<ComparePriceDto[]> {
  const results = await this.comparePriceRepository.find({
    where: { productId },
    order: { createdAt: 'DESC' }, // เอาล่าสุดขึ้นก่อน
    relations: ['vender', 'saleUser'], // โหลดข้อมูลร้านค้าและคนติดต่อมาด้วย
  });

  return results.map((o) => this.mapEntityToDto(o));
}
  async update(id: string, input: UpdateComparePriceInput, user: AuthUser): Promise<ComparePrice> {
  const { images, quotations, ...updateData } = input;
  const bucket = admin.storage().bucket();

  return await this.entityManager.transaction(async (manager) => {
    // 1. ดึงข้อมูลเดิมมาเพื่อตรวจสอบไฟล์ที่ต้องลบ
    const oldCp = await manager.findOne(ComparePrice, { where: { id } });
    if (!oldCp) throw new Error('ไม่พบข้อมูลราคาเปรียบเทียบ');

    // 2. จัดการรูปภาพ (Images)
    let finalImages: string[] = [];
    if (images) {
      finalImages = await Promise.all(
        images.map(async (res: any, idx) => {
          const resolved = await res; // แกะ Promise จาก AnyHybrid
          const file = resolved?.file ? resolved.file : resolved;

          if (file && typeof file.createReadStream === 'function') {
            const path = `WARE-HOUSE/compare-price/${id}/images/${Date.now()}_${idx}.jpg`;
            return this.uploadToFirebase(bucket, path, file);
          }
          // ถ้าเป็น String URL เดิม ให้ส่งกลับไปเลย
          return typeof resolved === 'string' ? resolved : null;
        }),
      ).then(urls => urls.filter(u => u !== null));
    }

    // 3. จัดการไฟล์ใบเสนอราคา (Quotations)
    let finalQuotations: string[] = [];
    if (quotations) {
      finalQuotations = await Promise.all(
        quotations.map(async (res: any, idx) => {
          const resolved = await res;
          const file = resolved?.file ? resolved.file : resolved;

          if (file && typeof file.createReadStream === 'function') {
            const path = `WARE-HOUSE/compare-price/${id}/quotations/${Date.now()}_${idx}.pdf`;
            return this.uploadToFirebase(bucket, path, file);
          }
          return typeof resolved === 'string' ? resolved : null;
        }),
      ).then(urls => urls.filter(u => u !== null));
    }

    // 4. [Important] ลบไฟล์ออกจาก Storage ที่ไม่อยู่ในรายการใหม่ (Cleanup)
    const oldFiles = [...(oldCp.images || []), ...(oldCp.quotations || [])];
    const newFiles = [...finalImages, ...finalQuotations];
    
    const filesToDelete = oldFiles.filter(url => !newFiles.includes(url));
    
    await Promise.all(
      filesToDelete.map(async (url) => {
        try {
          // แกะ path จาก URL (สมมติว่าเป็น Firebase Storage URL)
          const path = url.split(`${bucket.name}/`)[1]?.split('?')[0];
          if (path) {
            const decodedPath = decodeURIComponent(path);
            await bucket.file(decodedPath).delete();
          }
        } catch (e) {
          console.error(`Failed to delete old file: ${url}`, e);
        }
      })
    );

    // 5. บันทึกข้อมูลที่อัปเดต
    await manager.update(ComparePrice, id, {
      ...updateData,
      images: finalImages,
      quotations: finalQuotations,
    });
      const log = this.quotationLogRepository.create({
    affectedId: id,
    subject: 'UPDATE_COMPARE-PRICE', // เปลี่ยนชื่อให้ตรงกับเหตุการณ์
    detail: `จาก "${JSON.stringify(oldCp)}" เป็น "${JSON.stringify(input)}"`, // ใช้ detail เก็บรายละเอียด
    note: `Update By "${user.firstName} ${user.lastName}"`,
    timeStamp: new Date(),
  });
  await this.quotationLogRepository.save(log);

    return await manager.findOne(ComparePrice, { where: { id } });
  });
}
async create(input: CreateComparePriceInput, user:AuthUser): Promise<ComparePrice> {
  const { images, quotations, ...data } = input;
  const bucket = admin.storage().bucket();

  return await this.entityManager.transaction(async (manager) => {
    // 1. คำนวณราคาและภาษี (Logic เดิมของพี่)
    const qty = data.quantity || 0;
    const price = data.unitPrice || 0;
    const delivery = data.deliveryPrice || 0;
    const totalPriceNoVat = data.totalPriceNoVat;
    // ตัวอย่างการคิด VAT 7%
    // const vat = totalPriceNoVat * 0.07; 

    // 2. สร้าง Entity เบื้องต้น
    const cp = manager.create(ComparePrice, {
      ...data,
      totalPriceNoVat,
      // vat,
      totalPrice: data.totalPrice,
      images: [],
      quotations: [],
    });
    const savedCp = await manager.save(cp);

    // 3. Upload Images (แกะ AnyHybrid เหมือน CreateQuotation)
    if (images && images.length > 0) {
      const imageUrls = await Promise.all(
        images.map(async (res: any, idx) => {
          const resolved = await res; // แกะ Promise
          const file = resolved?.file ? resolved.file : resolved; // เช็คโครงสร้าง

          if (file && typeof file.createReadStream === 'function') {
            const path = `WARE-HOUSE/compare-price/${savedCp.id}/images/${Date.now()}_${idx}.jpg`;
            return this.uploadToFirebase(bucket, path, file);
          }
          return typeof resolved === 'string' ? resolved : null;
        }),
      );
      savedCp.images = imageUrls.filter(u => u !== null);
    }

    // 4. Upload Quotation Documents (แกะ AnyHybrid)
    if (quotations && quotations.length > 0) {
      const quotationUrls = await Promise.all(
        quotations.map(async (res: any, idx) => {
          const resolved = await res;
          const file = resolved?.file ? resolved.file : resolved;

          if (file && typeof file.createReadStream === 'function') {
            const path = `WARE-HOUSE/compare-price/${savedCp.id}/quotations/${Date.now()}_${idx}.pdf`;
            return this.uploadToFirebase(bucket, path, file);
          }
          return typeof resolved === 'string' ? resolved : null;
        }),
      );
      savedCp.quotations = quotationUrls.filter(u => u !== null);
    }
      const log = this.quotationLogRepository.create({
    affectedId: savedCp.id,
    subject: 'CREATE_COMPARE-PRICE', // เปลี่ยนชื่อให้ตรงกับเหตุการณ์
    detail: `${JSON.stringify(input)}`, 
    note: `Create By "${user.firstName} ${user.lastName}"`,
    timeStamp: new Date(),
  });
  await this.quotationLogRepository.save(log);

    // 5. บันทึก URLs ที่ได้ลงในฐานข้อมูล
    return await manager.save(savedCp);
  });
}
  private async uploadToFirebase(bucket: any, path: string, file: any): Promise<string> {
    const { createReadStream, mimetype } = file;
    const cloudFile = bucket.file(path);

    return new Promise((resolve, reject) => {
      createReadStream()
        .pipe(
          cloudFile.createWriteStream({
            metadata: { contentType: mimetype },
            public: true,
          }),
        )
        .on('error', (err) => reject(err))
        .on('finish', () => resolve(cloudFile.publicUrl()));
    });
  }

  
  async findByIds(ids: readonly string[]): Promise<ComparePriceDto[]> {
    return this.comparePriceRepository
      .findByIds([...ids])
      .then((arr) => arr.map((o) => this.mapEntityToDto(o)));
  }

    async findById(id: string): Promise<ComparePriceDto> {
    const product = await this.comparePriceRepository.findOne({
        where: { id },
    });

    return this.mapEntityToDto(product);
    }

  async findAll(args?: {
    limit?: number;
    offset?: number;
    query?: string;
  }): Promise<[ComparePriceDto[], number]> {
    const where: any = {};
    if (args?.query != null) where.name = Like(`%${args.query}%`);
    // sensible defaults: undefined means no limit
    const skip = args?.offset ?? 0;
    const take = args?.limit && args.limit > 0 ? args.limit : undefined;

    const [arr, count] = await this.comparePriceRepository.findAndCount({
      where: Object.keys(where).length ? where : undefined,
      skip,
      take,
    });

    const result: [ComparePriceDto[], number] = [
      arr.map((o) => this.mapEntityToDto(o)),
      count,
    ];
    return result;
  }
  

  private mapEntityToDto(comparePrice: ComparePrice): ComparePriceDto {
    return plainToClass(ComparePriceDto, comparePrice);
  }

  private cleanText(value: any): string {
    if (!value) return '';
    // แปลงเป็น string แล้ว trim และลดช่องว่างซ้ำให้เหลือ 1 ช่อง
    return String(value)
      .trim()
      .replace(/\s+/g, ' ');
  }



}
