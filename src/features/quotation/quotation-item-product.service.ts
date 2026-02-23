import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { EntityManager, In, Repository } from 'typeorm';
import { QuotationItemProduct } from './models/quotation-item-product.entity';
import { QuotationItemProductDto } from './dto/quotation-item-product.dto';
import { CreateQuotationItemProductInput } from './dto/create-quotation-item-product.args';
import * as admin from 'firebase-admin';
import { QuotationStatus } from './models/quotation.entity';
import { QuotationService } from './quotation.service';
import { AuthUser } from '../auth/auth.dto';
import { QuotationLog } from './models/quotation-log.entity';

@Injectable()
export class QuotationItemProductService {
  constructor(
    @InjectRepository(QuotationItemProduct)
    private quotationItemProductRepository: Repository<QuotationItemProduct>,
    private readonly quotationService: QuotationService,
        @InjectRepository(QuotationLog)
        private quotationLogRepository: Repository<QuotationLog>,
    private entityManager: EntityManager, // ✅ ใช้สำหรับ Transaction
  ) {}

  async findByQuotationItemId(quotationItemId: string): Promise<QuotationItemProduct[]> {
  return await this.quotationItemProductRepository.find({
    where: { quotationItemId },
    order: { sequence: 'ASC' },
  });
}

  async findByQuotationItemIds(quotationItemIds: readonly string[]): Promise<QuotationItemProductDto[][]> {
    const items = await this.quotationItemProductRepository.find({
      where: { quotationItemId: In([...quotationItemIds]) },
    });

    // กลุ่มรายการสินค้าตาม QuotationId
    return quotationItemIds.map((id) => items.filter((item) => item.quotationItemId === id).map(i => this.mapEntityToDto(i)));
  }


    async updateSequence(sequences: { id: string; sequence: number }[]): Promise<boolean> {
    return await this.entityManager.transaction(async (manager) => {
      try {
        await Promise.all(
          sequences.map((item) =>
            manager.update(QuotationItemProduct, item.id, { sequence: item.sequence }),
          ),
        );
        return true;
      } catch (error) {
        console.error('Update sequence failed:', error);
        throw new Error('ไม่สามารถเปลี่ยนลำดับได้');
      }
    });
  }

  async findByIds(ids: readonly string[]): Promise<QuotationItemProductDto[][]> {
    const items = await this.quotationItemProductRepository.find({
      where: { id: In([...ids]) },
    });

    // กลุ่มรายการสินค้าตาม QuotationId
    return ids.map((id) => items.filter((item) => item.id === id).map(i => this.mapEntityToDto(i)));
  }

// ใน quotation-item-product.service.ts

async delete(id: string, user:AuthUser): Promise<boolean> {
  const bucket = admin.storage().bucket();

  return await this.entityManager.transaction(async (manager) => {
    // 1. ค้นหาข้อมูลเดิมเพื่อเอารายชื่อรูปภาพมาลบใน Storage
    const qip = await manager.findOne(QuotationItemProduct, { where: { id } });
    if (!qip) throw new Error('ไม่พบรายการสินค้าที่ต้องการลบ');

    try {
      // 2. ลบรูปภาพใน Firebase Storage (ถ้ามี)
      if (qip.workSheetImages && qip.workSheetImages.length > 0) {
        await Promise.all(
          qip.workSheetImages.map(async (url) => {
            try {
              // แปลง Public URL กลับเป็น Path เพื่อลบไฟล์
              // URL format: https://storage.googleapis.com/bucket-name/path/to/file
              const path = url.split(`${bucket.name}/`)[1];
              if (path) {
                await bucket.file(path).delete();
              }
            } catch (err) {
              console.error(`ลบไฟล์ไม่สำเร็จ: ${url}`, err);
              // ไม่ throw error เพื่อให้การลบใน Database ดำเนินการต่อได้
            }
          }),
        );
      }

      // 3. ลบข้อมูลจาก Database
      // หมายเหตุ: ถ้ามี ComparePrice ผูกอยู่ ต้องมั่นใจว่าใน Entity ตั้ง OnDelete: 'CASCADE' ไว้ 
      // หรือต้องลบ ComparePrice ออกก่อนในขั้นตอนนี้
      await manager.delete(QuotationItemProduct, id);

          const log = this.quotationLogRepository.create({
    affectedId: id,
    subject: 'DELETE_QUOTATION-ITEM-PRODUCT', // เปลี่ยนชื่อให้ตรงกับเหตุการณ์
    detail: `${JSON.stringify(qip)}`, 
    note: `Delete By "${user.firstName} ${user.lastName}"`,
    timeStamp: new Date(),
  });
  await this.quotationLogRepository.save(log);

      return true;
    } catch (error) {
      throw new Error(`การลบล้มเหลว: ${error.message}`);
    }
  });
}
  async uploadWorkSheetImages(
    id: string,
    files: any[]
  ): Promise<QuotationItemProductDto> {
    const bucket = admin.storage().bucket();

    // 1. หาข้อมูลเดิมก่อน
    const quotationItemProduct = await this.quotationItemProductRepository.findOne({ where: { id } });
    if (!quotationItemProduct) throw new Error('ไม่พบรายการสินค้าที่ระบุ');

    // 2. จัดการอัปโหลดไฟล์ใหม่
    const newImageUrls = await Promise.all(
      files.map(async (filePromise, idx) => {
        const file = await filePromise;
        // Path: WARE-HOUSE/quotationItemProduct/{id}/worksheet_{timestamp}_{index}.jpg
        const path = `WARE-HOUSE/quotationItemProduct/${id}/worksheet_${Date.now()}_${idx}.jpg`;
        return this.uploadToFirebase(bucket, path, file);
      }),
    );

    // 3. รวมรูปเก่ากับรูปใหม่ (ถ้ามีรูปเก่าอยู่แล้ว)
    const currentImages = quotationItemProduct.workSheetImages || [];
    quotationItemProduct.workSheetImages = [...currentImages, ...newImageUrls];

    // 4. บันทึกข้อมูล
    const updated = await this.quotationItemProductRepository.save(quotationItemProduct);
    
    // ดึงข้อมูลใหม่พร้อม relations เพื่อส่งกลับเป็น DTO
    const result = await this.quotationItemProductRepository.findOne({
      where: { id: updated.id },
      relations: ['product', 'quotationItem']
    });

    return this.mapEntityToDto(result);
  }
  
  /**
   * สร้างรายการสินค้าแตกย่อย (QuotationItemProduct)
   * รองรับการอัปโหลดรูปภาพหน้างาน/รูปจาก Line
   */
async create(
    input: CreateQuotationItemProductInput,
    user: AuthUser,
    files?: any[],
  ): Promise<QuotationItemProductDto> {
    const bucket = admin.storage().bucket();

    return await this.entityManager.transaction(async (manager) => {
      
      // ✅ 1. ตรวจสอบว่าเคยมีการเพิ่ม Product นี้ใน Quotation Item นี้ไปแล้วหรือยัง
      const existingEntry = await manager.findOne(QuotationItemProduct, {
        where: {
          quotationItemId: input.quotationItemId,
          productId: input.productId,
        },
        // relations: ['quotationItem'],
      });
      // const quotation = await this.quotationService.findById(existingEntry.quotationItemId.quotationId)
      // if(quotation.status == QuotationStatus.OPEN){
      //   await this.quotationService.updateStatus(quotation.id, QuotationStatus.IN_PROGRESS)
      // }
      if (existingEntry) {
        // พ่น Error กลับไปที่ GraphQL (จะแสดงเป็น Alert ในฝั่ง Frontend)
        throw new Error('สินค้านี้ถูกเพิ่มในรายการแตกยอดแล้ว ไม่สามารถเพิ่มซ้ำได้');
      }

      // 2. สร้าง Entity เบื้องต้น (ถ้าผ่านการเช็คด้านบนมาได้)
      const quotationItemProduct = manager.create(QuotationItemProduct, {
        quotationItemId: input.quotationItemId,
        productId: input.productId,
        note: input.note,
        workSheetImages: [],
      });

      const savedQip = await manager.save(quotationItemProduct);

      // 3. จัดการอัปโหลดรูปภาพ (ถ้ามีไฟล์ส่งมา)
      if (files && files.length > 0) {
        const imageUrls = await Promise.all(
          files.map(async (filePromise, idx) => {
            const file = await filePromise;
            const path = `WARE-HOUSE/quotationItemProduct/${savedQip.id}/${Date.now()}_${idx}.jpg`;
            return this.uploadToFirebase(bucket, path, file);
          }),
        );

        savedQip.workSheetImages = imageUrls;
        await manager.save(savedQip);
      }

      const result = await manager.findOne(QuotationItemProduct, {
        where: { id: savedQip.id },
        relations: ['product', 'quotationItem']
      });

          const log = this.quotationLogRepository.create({
    affectedId: savedQip.id,
    subject: 'CREATE_QUOTATION-ITEM-PRODUCT', // เปลี่ยนชื่อให้ตรงกับเหตุการณ์
    detail: `${JSON.stringify(input)}`, 
    note: `Create By "${user.firstName} ${user.lastName}"`,
    timeStamp: new Date(),
  });
  await this.quotationLogRepository.save(log);
  
      return this.mapEntityToDto(result);
    });
  }

async updateNote(id: string, note: string, user: AuthUser): Promise<QuotationItemProductDto> {
  return await this.entityManager.transaction(async (manager) => {
    // 1. ตรวจสอบว่ามีข้อมูลอยู่จริงไหม
    const qip = await manager.findOne(QuotationItemProduct, { where: { id } });
    if (!qip) throw new Error('ไม่พบรายการสินค้าที่ต้องการแก้ไขหมายเหตุ');

    // 2. อัปเดตเฉพาะฟิลด์ note
    await manager.update(QuotationItemProduct, id, { note: note });

    // 3. ดึงข้อมูลล่าสุดกลับมาโชว์
    const updated = await manager.findOne(QuotationItemProduct, {
      where: { id },
      relations: ['product'] // โหลดข้อมูล product กลับไปด้วยเพื่อให้ UI ไม่เพี้ยน
    });

    const log = this.quotationLogRepository.create({
    affectedId: id,
    subject: 'UPDATE_QUOTATION-ITEM-PRODUCT-NOTE', // เปลี่ยนชื่อให้ตรงกับเหตุการณ์
    detail: `จาก "${qip.note}" เป็น "${note}"`, 
    note: `Update By "${user.firstName} ${user.lastName}"`,
    timeStamp: new Date(),
  });
  await this.quotationLogRepository.save(log);

    return this.mapEntityToDto(updated);
  });
}

  // Helper สำหรับ Upload Stream ไปยัง Firebase
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
async findByQuotationId(quotationItemId: string): Promise<QuotationItemProductDto[]> {
  const items = await this.quotationItemProductRepository
    .createQueryBuilder('quotation_item_product') // Alias ของ QuotationItemProduct
    .leftJoinAndSelect('quotation_item_product.quotationItem', 'qi') // Join ตารางหลักเพื่อเอาลำดับ sequence
    .leftJoinAndSelect('quotation_item_product.comparePrice', 'cp') // Join ราคาเปรียบเทียบ/ประวัติเก่า
    .leftJoinAndSelect('quotation_item_product.product', 'p')       // Join ข้อมูลสินค้า Master
    .where('quotation_item_product.quotationItemId = :id', { id: quotationItemId })
    .orderBy('qi.sequence', 'ASC') // ✅ จัดเรียงตามลำดับ sequence ในตาราง Item หลักได้เลย
    .getMany();

  return items.map((item) => this.mapEntityToDto(item));
}
// DataLoader Version (Batch Loading)
async findByQuotationIds(quotationItemIds: readonly string[]): Promise<QuotationItemProductDto[][]> {
  const items = await this.quotationItemProductRepository
    .createQueryBuilder('quotation_item_product')
    .leftJoinAndSelect('quotation_item_product.quotationItem', 'qi') // Join ตาราง Item หลัก
    .leftJoinAndSelect('quotation_item_product.comparePrice', 'cp') // Join ราคาเปรียบเทียบ
    .leftJoinAndSelect('quotation_item_product.product', 'p')       // Join ข้อมูลสินค้า
    .where('quotation_item_product.quotationItemId IN (:...ids)', { ids: quotationItemIds })
    .orderBy('qi.sequence', 'ASC') // ✅ Order ข้ามตารางได้โดยตรงผ่าน Alias
    .getMany();

  // จัดกลุ่มข้อมูลกลับคืนตาม IDs เพื่อให้ DataLoader ทำงานถูกต้อง
  return quotationItemIds.map((id) =>
    items
      .filter((item) => item.quotationItemId === id)
      .map((item) => this.mapEntityToDto(item))
  );
}
  private mapEntityToDto(quotationItemProduct: QuotationItemProduct): QuotationItemProductDto {
    return plainToClass(QuotationItemProductDto, quotationItemProduct);
  }

}
