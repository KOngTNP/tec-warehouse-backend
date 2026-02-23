import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Brackets, In, IsNull, LessThanOrEqual, Like, Repository } from 'typeorm';
import { QuotationDto } from './dto/quotation.dto';
import { Quotation, QuotationStatus } from './models/quotation.entity';
import { plainToClass } from 'class-transformer';
import * as path from 'path';
import { DBFFile } from 'dbffile';
import * as fs from 'fs';
import { CreateQuotationInput } from './dto/create-quotation.args';
import { QuotationItem, QuotationItemStatus } from './models/quotation-item.entity';
import { EntityManager } from 'typeorm';
import { QuotationLog } from './models/quotation-log.entity';
import * as admin from 'firebase-admin';
import { PurchaseDto } from '../purchase/dto/purchase.dto';
import { UpdateQuotationInput } from './dto/update-quotation-input';
import dayjs from 'dayjs';
import { AuthUser } from '../auth/auth.dto';

@Injectable()
export class QuotationService {
  constructor(
    @InjectRepository(Quotation)
    private quotationRepository: Repository<Quotation>,
    private entityManager: EntityManager,
        @InjectRepository(QuotationLog)
    private quotationLogRepository: Repository<QuotationLog>,
  ) {}
  
private readonly DEFAULT_COMPANY_ID = 'a618ee20-7099-4fb0-9793-c9efcdf1807e';
    async findById(id: string): Promise<QuotationDto> {
      const quotation = await this.quotationRepository.findOne({
        where: { id },
      });
      return this.mapEntityToDto(quotation);
    }

  async findByIds(ids: readonly string[]): Promise<QuotationDto[]> {
    return this.quotationRepository
      .findByIds([...ids])
      .then((arr) => arr.map((o) => this.mapEntityToDto(o)));
  }

  async findByQuotationNumber(quotationNumber: string): Promise<QuotationDto | null> {
    const quotation = await this.quotationRepository.findOne({
      where: { quotationNumber },
    });
    return quotation ? this.mapEntityToDto(quotation) : null;
  }
     
async updateQuotationDate(id: string, newDate: Date): Promise<QuotationDto> {
  const quotation = await this.quotationRepository.findOne({ where: { id } });
  if (!quotation) {
    throw new Error('ไม่พบใบเสนอราคา');
  }
  quotation.quotedDate = newDate;
  const updatedQuotation = await this.quotationRepository.save(quotation);
  return this.mapEntityToDto(updatedQuotation);
}

async findCreateToDay(): Promise<QuotationDto[]> {
  // 1. สร้างช่วงเวลาเริ่มต้นของวันนี้ (00:00:00)
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  // 2. สร้างช่วงเวลาสิ้นสุดของวันนี้ (23:59:59)
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return this.quotationRepository.find({
    where: {
      // ✅ ใช้ Between เพื่อความแม่นยำและ Query ได้เร็ว (Index Work)
      createdAt: Between(start, end),
    },
    order: {
      createdAt: 'ASC'
    }
  }).then((arr) => arr.map((o) => this.mapEntityToDto(o)));
}

// async updateAssignTo(id: string, username: string): Promise<Quotation> {
//   const quotation = await this.quotationRepository.findOne({ where: { id } });
  
//   if (!quotation) {
//     throw new Error('ไม่พบใบเสนอราคาที่ระบุ');
//   }

//   // ✅ อัปเดตฟิลด์ผู้รับผิดชอบ (สมมติว่าชื่อฟิลด์ใน DB คือ salesUser หรือ assignedTo)
//   quotation.assignTo = username; 
//   // หรือถ้ามีฟิลด์ modifiedAt ก็อัปเดตด้วย
//   quotation.modifiedAt = new Date();

//   return await this.quotationRepository.save(quotation);
// }
async updateStatus(id: string, status: string, username: string, user: AuthUser): Promise<QuotationDto> {
  return await this.entityManager.transaction(async (manager) => {
    // 1. หาใบเสนอราคาเดิม
    const quotation = await manager.findOne(Quotation, { 
      where: { id },
      relations: ['customer'] // โหลด relation ที่จำเป็นสำหรับ DTO
    });

    if (!quotation) throw new NotFoundException('ไม่พบใบเสนอราคาที่ระบุ');

    // 2. เก็บสถานะเดิมไว้ก่อนเปลี่ยน (เอาไว้ทำ Log)
    const oldStatus = quotation.status;

    // 3. อัปเดตสถานะใหม่
    quotation.status = status as QuotationStatus;
    const updatedQuotation = await manager.save(quotation);

    // ✅ 4. เพิ่มการบันทึก Log (แนะนำให้ทำเพื่อให้ตรวจสอบย้อนหลังได้)
    
    const log = manager.create(QuotationLog, {
      affectedId: id,
      subject: 'CHANGE_STATUS', // ใช้ subject แทน action
      detail: `เปลี่ยนสถานะจาก "${oldStatus}" เป็น "${status}"`, // ใช้ detail เก็บรายละเอียด
      note: `Update By "${user.firstName} ${user.lastName}"`,
      timeStamp: new Date(), // ⚠️ อย่าลืมฟิลด์นี้ เพราะใน Entity พี่ไม่ได้ตั้งให้เป็น nullable
    });
    await manager.save(log);
    

    return this.mapEntityToDto(updatedQuotation);
  });
}
async update(input: UpdateQuotationInput , user: AuthUser): Promise<QuotationDto> {
  const { id, items, quotationImages, quotationDocuments,inSiderFile, ...headerUpdates } = input;
  const bucket = admin.storage().bucket();
  
  return await this.entityManager.transaction(async (manager) => {
    const existingQuotation = await manager.findOne(Quotation, {
      where: { id },
      relations: ['quotationItem'],
    });
    if (!existingQuotation) throw new Error('ไม่พบใบเสนอราคา');

    // console.log('input:',input)
    // ✅ [แก้ไขจุดนี้] จัดการเรื่องวันที่ให้แน่นอนก่อน Assign
    const updates = {
      ...headerUpdates,
      // ถ้าใน input มีส่ง expirationDate มา ให้ใช้ตัวนั้น แต่ถ้าไม่มี ให้ใช้ค่าเดิมใน DB
      expirationDate: headerUpdates.expirationDate 
        ? new Date(headerUpdates.expirationDate) 
        : existingQuotation.expirationDate,
      
      // แถม: ถ้า leadReceivedDate มีการเปลี่ยนแปลง อาจจะอยากอัปเดตตัวนี้ด้วย
      leadReceivedDate: headerUpdates.leadReceivedDate 
        ? new Date(headerUpdates.leadReceivedDate) 
        : existingQuotation.leadReceivedDate,
    };

      //     const header = {
      //   ...headerUpdates,
      //   // ✅ คำนวณวันหมดอายุบวกไป 7 วันจาก leadReceivedDate
      //   expirationDate: headerUpdates.leadReceivedDate 
      //     ? dayjs(headerUpdates.leadReceivedDate).add(7, 'day').toDate() 
      //     : dayjs().add(7, 'day').toDate(),
      // };

      // // 2. ใช้ Object.assign เพื่อรวมค่าเข้ากับ Entity เดิม
      // Object.assign(existingQuotation, header);
      Object.assign(existingQuotation, updates);

    // --- 📸 [1] จัดการรูปภาพ Header ---
    if (quotationImages) {
      const currentHeaderUrls = existingQuotation.images || [];
      const incomingHeaderUrls = quotationImages.filter(img => typeof img === 'string') as string[];
      const headersToDelete = currentHeaderUrls.filter(url => !incomingHeaderUrls.includes(url));
      await Promise.all(headersToDelete.map(url => this.deleteFileFromFirebase(url)));

      const finalHeaderUrls = await Promise.all(
        quotationImages.map(async (res: any, idx) => {
          const resolved = await res; // รอ Promise จาก AnyHybrid
          if (typeof resolved === 'string') return resolved;

          // ✅ เช็คให้ละเอียดว่า createReadStream อยู่ตรงไหน
          const file = resolved.file ? resolved.file : resolved; 
          
          if (file && typeof file.createReadStream === 'function') {
            const path = `WARE-HOUSE/quotation/${id}/Header/${Date.now()}_${idx}.jpg`;
            return this.uploadToFirebase(bucket, path, file);
          }
          return null;
        }),
      );
      existingQuotation.images = finalHeaderUrls.filter(u => u !== null);
    }

    if (quotationDocuments) {
      const currentDocumentUrls = existingQuotation.quotationDocuments || [];
      const incomingDocumentUrls = quotationDocuments.filter(document => typeof document === 'string') as string[];
      const documentsToDelete = currentDocumentUrls.filter(url => !incomingDocumentUrls.includes(url));
      await Promise.all(documentsToDelete.map(url => this.deleteFileFromFirebase(url)));

      const finalDocumentUrls = await Promise.all(
        quotationDocuments.map(async (res: any, idx) => {
          const resolved = await res; // รอ Promise จาก AnyHybrid
          if (typeof resolved === 'string') return resolved;

          // ✅ เช็คให้ละเอียดว่า createReadStream อยู่ตรงไหน
          const file = resolved.file ? resolved.file : resolved; 
          
          if (file && typeof file.createReadStream === 'function') {
            const path = `WARE-HOUSE/quotation/${id}/Document/${Date.now()}_${idx}.pdf`;
            return this.uploadToFirebase(bucket, path, file);
          }
          return null;
        }),
      );
      existingQuotation.quotationDocuments = finalDocumentUrls.filter(u => u !== null);
    }

    if (inSiderFile) {
      const currentDocumentUrls = existingQuotation.inSiderFile || [];
      const incomingDocumentUrls = inSiderFile.filter(document => typeof document === 'string') as string[];
      const documentsToDelete = currentDocumentUrls.filter(url => !incomingDocumentUrls.includes(url));
      await Promise.all(documentsToDelete.map(url => this.deleteFileFromFirebase(url)));

      const finalDocumentUrls = await Promise.all(
        inSiderFile.map(async (res: any, idx) => {
          const resolved = await res; // รอ Promise จาก AnyHybrid
          if (typeof resolved === 'string') return resolved;

          // ✅ เช็คให้ละเอียดว่า createReadStream อยู่ตรงไหน
          const file = resolved.file ? resolved.file : resolved; 
          
          if (file && typeof file.createReadStream === 'function') {
            const path = `WARE-HOUSE/quotation/${id}/Document/${Date.now()}_${idx}.pdf`;
            return this.uploadToFirebase(bucket, path, file);
          }
          return null;
        }),
      );
      existingQuotation.inSiderFile = finalDocumentUrls.filter(u => u !== null);
    }

    await manager.save(existingQuotation);

    // --- 📦 [2] จัดการ Items ---
    if (items) {
      const incomingItemIds = items.map(i => i.id).filter(itemId => !!itemId);
      const itemsToDelete = existingQuotation.quotationItem.filter(dbItem => !incomingItemIds.includes(dbItem.id));
      
      if (itemsToDelete.length > 0) {
        for (const item of itemsToDelete) {
          if (item.images) await Promise.all(item.images.map(url => this.deleteFileFromFirebase(url)));
        }
        await manager.remove(QuotationItem, itemsToDelete);
      }

      const itemEntities = await Promise.all(
        items.map(async (item, index) => {
          let itemEntity = item.id ? existingQuotation.quotationItem.find(dbItem => dbItem.id === item.id) : null;
          if (!itemEntity) itemEntity = manager.create(QuotationItem, { quotationId: id });

          if (item.images) {
            const oldImgs = itemEntity.images || [];
            const incomingUrls = item.images.filter(img => typeof img === 'string') as string[];
            const toDelete = oldImgs.filter(url => !incomingUrls.includes(url));
            await Promise.all(toDelete.map(url => this.deleteFileFromFirebase(url)));

            const finalItemUrls = await Promise.all(
              item.images.map(async (res: any, fIdx) => {
                const resolved = await res;
                if (typeof resolved === 'string') return resolved;

                // ✅ เช็ค createReadStream เหมือนกับ Header
                const file = resolved.file ? resolved.file : resolved;

                if (file && typeof file.createReadStream === 'function') {
                  const path = `WARE-HOUSE/quotation/${id}/Item/${Date.now()}-${index}-${fIdx}.jpg`;
                  return this.uploadToFirebase(bucket, path, file);
                }
                return null;
              }),
            );
            itemEntity.images = finalItemUrls.filter(u => u !== null);
          }

          itemEntity.sequence = index + 1;
          itemEntity.sellName = item.customerSpec;
          itemEntity.name = item.globalName;
          itemEntity.description = item.oldRefDoc;
          itemEntity.quantity = item.qty;
          itemEntity.unit = item.unit;
          itemEntity.vatType = '2'
          itemEntity.vat = (item.qty * item.pricePerUnit)* 0.07,
          itemEntity.totalPriceNoVat = item.qty * item.pricePerUnit,
          itemEntity.totalPrice = (item.qty * item.pricePerUnit)* 0.07 + item.qty * item.pricePerUnit,
          itemEntity.unitPrice = item.pricePerUnit;
          itemEntity.totalPriceNoVat = item.qty * item.pricePerUnit;
          itemEntity.note = item.note
          itemEntity.isHidden = item.isHidden
          itemEntity.isObsolete = item.isObsolete
          itemEntity.productLink = item.productLink;
          itemEntity.inSiderNote = item.inSiderNote;

          return itemEntity;
        }),
      );
      await manager.save(QuotationItem, itemEntities);
    }

    const finalResult = await manager.findOne(Quotation, {
      where: { id },
      relations: ['quotationItem', 'customer', 'purchasingUser'], 
    });
    const log = manager.create(QuotationLog, {
      affectedId: id,
      subject: 'UPDATE_QUOTATION', // ใช้ subject แทน action
      detail: `จาก "${JSON.stringify(existingQuotation)}" เป็น "${JSON.stringify(input)}"`,
      note: `Update By "${user.firstName} ${user.lastName}"`,
      timeStamp: new Date(), // ⚠️ อย่าลืมฟิลด์นี้ เพราะใน Entity พี่ไม่ได้ตั้งให้เป็น nullable
    });
    await manager.save(log);
    return this.mapEntityToDto(finalResult);
  });
}

// ✅ เพิ่ม Helper Function สำหรับลบไฟล์
private async deleteFileFromFirebase(fileUrl: string): Promise<void> {
  try {
    const bucket = admin.storage().bucket();
    // ดึง path จาก URL (เช่น WARE-HOUSE/quotation/...)
    const path = fileUrl.split('/o/')[1]?.split('?')[0];
    if (path) {
      const decodedPath = decodeURIComponent(path);
      await bucket.file(decodedPath).delete();
      // console.log(`Deleted file: ${decodedPath}`);
    }
  } catch (err) {
    console.error(`Failed to delete file: ${fileUrl}`, err);
  }
}
async findExpireInTwoDay(params: { companyId?: string, userId?: string, isShowAll?: boolean }): Promise<Quotation[]> {
  // ✅ เปลี่ยนจาก startOfToday เป็นไม่ต้องมีจุดเริ่ม แต่ไปตัดจบที่อีก 2 วันข้างหน้าแทน
  const twoDaysFromNow = dayjs().add(2, 'day').endOf('day').toDate(); // อีก 2 วัน 23:59

  const qb = this.quotationRepository.createQueryBuilder('q')
    .leftJoinAndSelect('q.customer', 'customer')
    .leftJoinAndSelect('q.user', 'user')
    .where('q.companyId = :companyId', { companyId: params.companyId || this.DEFAULT_COMPANY_ID })
    .andWhere('q.status IN (:...statuses)', { 
      statuses: ['OPEN', 'IN_PROGRESS', 'PRICE_CONFIRMED', 'WAITING_FOR_QUOTATION_SEND'] 
    })
    // ✅ แก้จาก BETWEEN เป็น <= (น้อยกว่าหรือเท่ากับ) 
    // เพื่อให้ดึงทั้งที่ "หมดไปแล้วเมื่อวาน/ปีก่อน" และ "จะหมดในอีก 2 วัน"
    .andWhere('q.expirationDate <= :end', { 
      end: twoDaysFromNow 
    });

  if (!params.isShowAll && params.userId) {
    qb.andWhere('q.userId = :userId', { userId: params.userId });
  }

  // เรียงเอาตัวที่ใกล้หมด (หรือหมดนานสุด) ขึ้นมาก่อน
  return await qb.orderBy('q.expirationDate', 'ASC').getMany();
}
async findAll(args: {
  limit: number;
  offset: number;
  query?: string;
  status?: string;
  viewMode?: string;
  userId?: string;
  companyId?: string;
  year?: string;   // ✅ รับปี เช่น "68"
  month?: string;
  type?: string;   // ✅ รับประเภท เช่น "QUICK", "WEB"
}): Promise<[Quotation[], number]> {
  const qb = this.quotationRepository.createQueryBuilder('q')
    .leftJoinAndSelect('q.customer', 'customer')
    .leftJoinAndSelect('q.user', 'assignedUser')
    .where('q.companyId = :companyId', { companyId: args.companyId });

  // 1. กรอง Status
  if (args.status && args.status !== 'ALL') {
    qb.andWhere('q.status = :status', { status: args.status });
  }

  // 2. กรองพนักงาน (View Mode)
  if (args.viewMode === 'All' && args.userId) {
    qb.andWhere(new Brackets(sb => {
      sb.where('q.userId IS NULL').orWhere('q.userId = :userId', { userId: args.userId });
    }));
  } else if (args.userId && args.viewMode === 'byUser' ) {
    qb.andWhere('q.userId = :userId', { userId: args.userId });
  }

  
if (args.year && args.year !== 'ALL') {
  if (args.month) {
    // 🎯 ใช้ % ไว้ข้างหน้าด้วย เพื่อให้เจอเลขที่ที่มี Prefix เช่น Q6901 หรือ TM Q6901
    qb.andWhere('q.quotationNumber LIKE :monthPattern', { 
      monthPattern: `%${args.year}${args.month}%` 
    });
  } else {
    // 🎯 สำหรับการกรองรายปีใน Dashboard
    qb.andWhere('q.quotationNumber LIKE :yearPattern', { 
      yearPattern: `%${args.year}%` 
    });
  }
}

  // 4. ✅ กรองประเภท (Type) - ค้นหาตาม Prefix
  if (args.type && args.type !== 'ALL') {
    if (args.type === 'QUICK') {
  // ห้ามเขียน "Q%" ลงไปตรงๆ
  qb.andWhere('(q.quotationNumber LIKE :quick1 OR q.quotationNumber LIKE :quick2)', { 
    quick1: "Q%", 
    quick2: "TM Q%" 
  });
} 

// ✅ 2. แก้ไขประเภท WEB
else if (args.type === 'WEB') {
  qb.andWhere('q.quotationNumber LIKE :web', { web: "W%" });
}

// ✅ 3. แก้ไขประเภท OTHER
else if (args.type === 'OTHER') {
  qb.andWhere('q.quotationNumber LIKE :other', { other: "O%" });
}

// ✅ 4. แก้ไขประเภท NORMAL (ใช้ REGEXP)
else if (args.type === 'NORMAL') {
  // ต้องระบุ parameter สำหรับ regex ด้วย
  qb.andWhere('NOT (q.quotationNumber REGEXP :reg)', { 
    reg: '^(Q|TM Q|W|O)' 
  });
}
  }

  // 5. Search Query
  if (args.query) {
    qb.andWhere(new Brackets(sb => {
      sb.where('q.quotationNumber LIKE :s')
        .orWhere('customer.name LIKE :s')
        // .orWhere('q.endUser.name LIKE :s');
    }), { s: `%${args.query}%` });
  }

  return qb.orderBy('q.createdAt', 'DESC')
    .take(args.limit)
    .skip(args.offset)
    .getManyAndCount();
}

// ✅ เพิ่ม Query สำหรับสรุปยอด Status แยกต่างหาก
async getStatusSummary(companyId: string, userId?: string, viewMode?: string) {
    const qb = this.quotationRepository.createQueryBuilder('q')
      .select('q.status', 'status')
      .addSelect('COUNT(q.id)', 'count')
      .where('q.companyId = :companyId', { companyId });

    if (userId) {
      qb.andWhere(new Brackets(sb => sb.where('q.userId = :userId', { userId })));
    }

    const result = await qb.groupBy('q.status').getRawMany();
    return result.reduce((acc, curr) => ({ ...acc, [curr.status]: parseInt(curr.count) }), {});
}
        async findByCustomerIds(
          customerIds: readonly string[],
        ): Promise<QuotationDto[]> {
          const quotations = await this.quotationRepository.find({
            where: {
              customerId: In([...customerIds]),
            },
            relations: ['customer'],
          });
          return quotations.map((o) => this.mapEntityToDto(o));
        }
        async findByPurchasingUserIds(
          purchasingUserIds: readonly string[],
        ): Promise<QuotationDto[]> {
          const quotations = await this.quotationRepository.find({
            where: {
              purchasingUserId: In([...purchasingUserIds]),
            },
            relations: ['purchasingUser'],
          });
          return quotations.map((o) => this.mapEntityToDto(o));
        }

        async findByEndUserIds(
          endUserIds: readonly string[],
        ): Promise<QuotationDto[]> {
          const quotations = await this.quotationRepository.find({
            where: {
              endUserId: In([...endUserIds]),
            },
            relations: ['endUser'],
          });
          return quotations.map((o) => this.mapEntityToDto(o));
        }
  
async updateInsiderNote(id: string, inSiderNote: string, user: AuthUser): Promise<QuotationDto> {
  // 1. ตรวจสอบว่ามีรายการจริงไหม
  const quotation = await this.quotationRepository.findOne({ where: { id } });
  if (!quotation) throw new Error('ไม่พบรายการที่ต้องการแก้ไข');

  // 2. อัปเดตข้อมูล (แนะนำให้ใช้ save เพื่อให้ได้ object กลับมาเลย)
    const log = this.quotationLogRepository.create({
    affectedId: id,
    subject: 'UPDATE_QUOTATION-INSIDER-NOTE', // เปลี่ยนชื่อให้ตรงกับเหตุการณ์
    detail: `จาก "${quotation.inSiderNote || ''}" เป็น "${inSiderNote}"`, 
    note: `Update By "${user.firstName} ${user.lastName}"`,
    timeStamp: new Date(),
  });
    quotation.inSiderNote = inSiderNote;
  await this.quotationLogRepository.save(log);
  const updatedItem = await this.quotationRepository.save(quotation);

  // 3. บันทึก Log การแก้ไข
  // 💡 ถ้าพี่ใช้ Repository ปกติ ให้เปลี่ยน manager เป็น this.quotationLogRepository

  return this.mapEntityToDto(updatedItem);
}


async create(input: CreateQuotationInput, user: AuthUser): Promise<QuotationDto> {
  // console.log('Creating quotation with input:', input);
  const { items, quotationImages,quotationDocuments,inSiderFile, ...header } = input;
  const bucket = admin.storage().bucket();

  return await this.entityManager.transaction(async (manager) => {
    // 1. บันทึก Quotation Header
    const quotation = manager.create(Quotation, {
      ...header,
      contact: header.contact,
      quotedDate: header.quotedDate || new Date(),
      status: header.status || QuotationStatus.OPEN,
      expirationDate: header.leadReceivedDate 
        ? dayjs(header.leadReceivedDate).add(7, 'day').toDate() 
        : dayjs().add(7, 'day').toDate(), // กรณีไม่มีวันที่รับ Lead ให้บวกจากวันนี้แทน
    });
    const savedQuotation = await manager.save(quotation);

    // 2. Upload Header Images (รองรับ AnyHybrid)
    if (quotationImages && quotationImages.length > 0) {
      const headerUrls = await Promise.all(
        quotationImages.map(async (res: any, idx) => {
          const resolved = await res; // แกะ Promise จาก AnyHybrid
          const file = resolved?.file ? resolved.file : resolved; // เช็คโครงสร้างไฟล์

          if (file && typeof file.createReadStream === 'function') {
            const path = `WARE-HOUSE/quotation/${savedQuotation.id}/Header/${Date.now()}_${idx}.jpg`;
            return this.uploadToFirebase(bucket, path, file);
          }
          return typeof resolved === 'string' ? resolved : null;
        }),
      );
      savedQuotation.images = headerUrls.filter(u => u !== null);
      await manager.save(savedQuotation);
    }

    if (quotationDocuments && quotationDocuments.length > 0) {
      const documentUrls = await Promise.all(
        quotationDocuments.map(async (res: any, idx) => {
          const resolved = await res; // แกะ Promise จาก AnyHybrid
          const file = resolved?.file ? resolved.file : resolved; // เช็คโครงสร้างไฟล์

          if (file && typeof file.createReadStream === 'function') {
            const path = `WARE-HOUSE/quotation/${savedQuotation.id}/Document/${Date.now()}_${idx}.pdf`;
            return this.uploadToFirebase(bucket, path, file);
          }
          return typeof resolved === 'string' ? resolved : null;
        }),
      );
      savedQuotation.quotationDocuments = documentUrls.filter(u => u !== null);
      await manager.save(savedQuotation);
    }

    if (inSiderFile && inSiderFile.length > 0) {
      const documentUrls = await Promise.all(
        inSiderFile.map(async (res: any, idx) => {
          const resolved = await res; // แกะ Promise จาก AnyHybrid
          const file = resolved?.file ? resolved.file : resolved; // เช็คโครงสร้างไฟล์

          if (file && typeof file.createReadStream === 'function') {
            const path = `WARE-HOUSE/quotation/${savedQuotation.id}/inSiderFile/${Date.now()}_${idx}.pdf`;
            return this.uploadToFirebase(bucket, path, file);
          }
          return typeof resolved === 'string' ? resolved : null;
        }),
      );
      savedQuotation.inSiderFile = documentUrls.filter(u => u !== null);
      await manager.save(savedQuotation);
    }

    // 3. บันทึก Quotation Items พร้อมรูปภาพรายรายการ
    if (items?.length > 0) {
      const itemEntities = await Promise.all(
        items.map(async (item, index) => {
          let itemImageUrls: string[] = [];

          if (item.images && item.images.length > 0) {
            itemImageUrls = await Promise.all(
              (item.images as any[]).map(async (res: any, fIdx) => {
                const resolved = await res;
                const file = resolved?.file ? resolved.file : resolved;

                if (file && typeof file.createReadStream === 'function') {
                  const path = `WARE-HOUSE/quotation/${savedQuotation.id}/Item/${savedQuotation.id}-${index + 1}-${fIdx}.jpg`;
                  return this.uploadToFirebase(bucket, path, file);
                }
                return typeof resolved === 'string' ? resolved : null;
              }),
            );
          }
          return manager.create(QuotationItem, {
            sequence: index + 1,
            sellName: item.customerSpec,
            name: item.globalName,
            description: item.oldRefDoc,
            quantity: item.qty,
            unit: item.unit,
            unitPrice: item.pricePerUnit,
            vatType: '2',
            vat: (item.qty * item.pricePerUnit)* 0.07,
            totalPriceNoVat: item.qty * item.pricePerUnit,
            totalPrice: (item.qty * item.pricePerUnit)* 0.07 + item.qty * item.pricePerUnit,
            images: itemImageUrls.filter(u => u !== null),
            quotationId: savedQuotation.id,
            status: QuotationItemStatus.OPEN,
            isHidden: item.isHidden,
            isObsolete: item.isObsolete,
            productLink: item.productLink,
            inSiderNote: item.inSiderNote,
            note: item.note
          });
        }),
      );
      await manager.save(QuotationItem, itemEntities);
    }

    const finalResult = await manager.findOne(Quotation, {
      where: { id: savedQuotation.id },
      relations: ['quotationItem'],
    });

      const log = manager.create(QuotationLog, {
      affectedId: finalResult.id,
      subject: 'CREATE_QUOTATION', // ใช้ subject แทน action
      detail: `${JSON.stringify(input)}`, // ใช้ detail เก็บรายละเอียด
      note: `Create By "${user.firstName} ${user.lastName}"`,
      timeStamp: new Date(), // ⚠️ อย่าลืมฟิลด์นี้ เพราะใน Entity พี่ไม่ได้ตั้งให้เป็น nullable
    });
    await manager.save(log);

    return this.mapEntityToDto(finalResult);
  });
}

  // ✅ Helper function สำหรับ Upload โดยรับ Stream จาก GraphQL
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

  
  // async findByQuotationNumber(quotationNumber: string): Promise<QuotationDto | null> {
  //   const quotation = await this.quotationRepository.findOne({
  //     where: { quotationNumber: quotationNumber },
  //   });

  //   return quotation ? this.mapEntityToDto(quotation) : null;
  // }


    async findByQuotationNumbers(quotationNumbers: string[]): Promise<QuotationDto[]> {
    if (!quotationNumbers || quotationNumbers.length === 0) return [];
    const quotation = await this.quotationRepository.find({
      where: { quotationNumber: In(quotationNumbers) },
    });
    return quotation.map((o) => this.mapEntityToDto(o));
  }

  private mapEntityToDto(quotation: Quotation): QuotationDto {
    return plainToClass(QuotationDto, quotation);
  }

  private cleanText(value: any): string {
    if (!value) return '';
    // แปลงเป็น string แล้ว trim และลดช่องว่างซ้ำให้เหลือ 1 ช่อง
    return String(value)
      .trim()
      .replace(/\s+/g, ' ');
  }



}
