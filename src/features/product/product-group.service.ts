import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { In, Repository } from 'typeorm';
import { ProductGroup } from './models/product-group.entity';
import { ProductGroupDto } from './dto/product-group.dto';
import { CategoryService } from '../category/category.service';
import * as path from 'path';
import { DBFFile } from 'dbffile';
import * as fs from 'fs';
import { ProductService } from './product.service';
import { Product } from './models/product.entity';

@Injectable()
export class ProductGroupService {
  constructor(
    @InjectRepository(ProductGroup)
    private productGroupRepository: Repository<ProductGroup>,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
  ) {}

async importProductGroupFromDbf(companyId: string, pathDBF: string): Promise<string> {
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

  // ✅ โหลดข้อมูลทั้งหมดจาก DB
  const existing = await this.productGroupRepository.find({
    where: { companyId },
    relations: ['parentProduct', 'childProduct'],
  });

  // ✅ preload สินค้าทั้งหมด (parent/child) เพื่อไม่ต้อง query ซ้ำ
  const allProductCodes = [
    ...new Set(
      records.flatMap((r) => [
        this.cleanText(r.PSTKCOD),
        this.cleanText(r.STKCOD),
      ]),
    ),
  ];
  const products = await this.productService.findByExCodes(allProductCodes, companyId);

  const productMap = new Map<string, Product>(
    products.map((p): [string, Product] => [p.ExCode, p]),
  );

  // ✅ เตรียมข้อมูลใน DB เป็น Map สำหรับค้นหาเร็ว
  const existingMap = new Map<string, ProductGroup>(
    existing.map((r) => [
      `${r.parentProduct.ExCode}-${r.childProduct.ExCode}-${r.seqNumber}`,
      r,
    ]),
  );

  const newGroups: ProductGroup[] = [];
  const updatedGroups: { id: string; quantity: number }[] = [];
  const exCodesFromFile: string[] = [];

  for (const record of records) {
    const parentCode = this.cleanText(record.PSTKCOD);
    const childCode = this.cleanText(record.STKCOD);
    const seqNumber = this.parseDotNumber(this.cleanText(record.SEQNUM));
    const quantity = this.parseDotNumber(this.cleanText(record.BOMQTY));

    if (!parentCode || !childCode || !seqNumber || !quantity) {
      result.skipped++;
      continue;
    }

    const parentProduct = productMap.get(parentCode);
    const childProduct = productMap.get(childCode);
    if (!parentProduct || !childProduct) {
      result.skipped++;
      continue;
    }

    const key = `${parentCode}-${childCode}-${seqNumber}`;
    exCodesFromFile.push(key);

    const found = existingMap.get(key);

    if (found) {
      // ถ้าจำนวนเปลี่ยน → update
      if (found.quantity !== quantity) {
        updatedGroups.push({ id: found.id, quantity });
        result.updated++;
      } else {
        result.skipped++;
      }
    } else {
      // ยังไม่มี → insert ใหม่
      newGroups.push(
        this.productGroupRepository.create({
          parentProductId: parentProduct.id,
          childProductId: childProduct.id,
          seqNumber,
          quantity,
          companyId,
        }),
      );
      result.inserted++;
    }
  }

  // ✅ save/ update ทีละ batch (ขนาด 100 เพื่อไม่เต็ม connection pool)
  const BATCH_SIZE = 100;
  if (newGroups.length > 0) {
    for (let i = 0; i < newGroups.length; i += BATCH_SIZE) {
      const batch = newGroups.slice(i, i + BATCH_SIZE);
      await this.productGroupRepository.save(batch);
    }
  }
  if (updatedGroups.length > 0) {
    for (let i = 0; i < updatedGroups.length; i += BATCH_SIZE) {
      const batch = updatedGroups.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map((g) =>
          this.productGroupRepository.update(g.id, { quantity: g.quantity }),
        ),
      );
    }
  }

  // ✅ ลบข้อมูลที่ไม่มีในไฟล์
  const toDelete = existing.filter(
    (r) =>
      !exCodesFromFile.includes(
        `${r.parentProduct.ExCode}-${r.childProduct.ExCode}-${r.seqNumber}`,
      ),
  );
  if (toDelete.length > 0) {
    const idsToDelete = toDelete.map((r) => r.id);
    await this.productGroupRepository.softDelete({ id: In(idsToDelete), companyId });
    result.deleted = idsToDelete.length;
  }

  const FinalCount = await this.productGroupRepository.count();
  console.log(`✅ Update Product Group Complete
  📦 จากไฟล์: ${records.length}
  📂 ใน DB (หลังอัปเดต): ${FinalCount}
  ➕ เพิ่มใหม่: ${result.inserted}
  🔁 อัปเดต: ${result.updated}
  ⏭️ ข้าม: ${result.skipped}
  🗑️ ลบออก: ${result.deleted}`);

  return 'DONE';
}




  async findByParentProductIds(parentIds: readonly string[]): Promise<ProductGroupDto[]> {
    if (!parentIds || parentIds.length === 0) return [];
    const groups = await this.productGroupRepository.find({
      where: { parentProductId: In([...parentIds]) },
      // ไม่จำเป็นต้อง join relations เพราะ DTO ใช้เฉพาะ ids/seq/quantity
      order: { seqNumber: 'ASC' },
    });
    return groups.map((g) => plainToClass(ProductGroupDto, g));
  }

  async findByChildProductIds(childIds: readonly string[]): Promise<ProductGroupDto[]> {
    if (!childIds || childIds.length === 0) return [];
    // console.log('childIds: ',childIds)
    const groups = await this.productGroupRepository.find({
      where: { childProductId: In([...childIds]) },
      order: { seqNumber: 'ASC' },
    });
    // console.log('group: ',groups)
    return groups.map((g) => plainToClass(ProductGroupDto, g));
  }

  async findByIds(ids: readonly string[]): Promise<ProductGroupDto[]> {
    if (!ids || ids.length === 0) return [];
    const groups = await this.productGroupRepository.findByIds([...ids]);
    return groups.map((o) => plainToClass(ProductGroupDto, o));
  }
  private cleanText(value: any): string {
    if (!value) return '';
    // แปลงเป็น string แล้ว trim และลดช่องว่างซ้ำให้เหลือ 1 ช่อง
    return String(value)
      .trim()
      .replace(/\s+/g, ' ');
  }
  private parseDotNumber(str: string): number {
  if (!str) return 0;

  // ลบจุดหน้าและหลัง
  const cleaned = str.replace(/^\.+|\.+$/g, '');

  // แปลงเป็น number
  const num = Number(cleaned);

  // ถ้าไม่ใช่ number ให้คืนค่า 0
  return isNaN(num) ? 0 : num;
}

}
