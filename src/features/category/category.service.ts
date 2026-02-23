import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { CategoryDto } from './dto/category.dto';
import { Category } from './models/category.entity';
import { plainToClass } from 'class-transformer';
import * as path from 'path';
import { DBFFile } from 'dbffile';
import * as fs from 'fs';


@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}
private readonly DEFAULT_COMPANY_ID = 'a618ee20-7099-4fb0-9793-c9efcdf1807e';
  async importCategoryFromDbf(companyId: string, pathDBF: string): Promise<string> {
        const filePath = path.resolve(
          pathDBF,
        );
        if (!fs.existsSync(filePath)) {
          throw new Error(`File not found: ${filePath}`);
        }
    
        const dbf = await DBFFile.open(filePath, { encoding: 'cp874' });
        const records = await dbf.readRecords();
    
        console.log(
          `📄 Read ${records.length} rows from ${path.basename(filePath)}`,
        );
    
        const result = { inserted: 0, updated: 0, skipped: 0 ,deleted: 0};
        const existing = await this.categoryRepository.find({
            where: { companyId }
          });
        const exCodesFromFile: string[] = [];
        let fileCount = 0
        const newCategories: Category[] = [];
        const updatedCategories: { id: string; name: string; description: string }[] = [];
        
        for (let i = 0; i < records.length; i++) {
          const record = records[i];
          if(this.cleanText(record.TABTYP) == '22'){
            fileCount = fileCount+1
            const ExCode = this.cleanText(record.TYPDES) == 'สินค้าชุด' ? '00' : this.cleanText(record.TYPCOD)
            const name = (this.cleanText(record.TYPDES)).length == 0 ? (this.cleanText(record.SHORTNAM).length) > 0 ? this.cleanText(record.SHORTNAM) : this.cleanText(record.TYPDES) :this.cleanText(record.TYPDES)
            const description = this.cleanText(record.SHORTNAM)
                      // ถ้าไม่มีข้อมูลใน 3 คอลัมน์นี้ ให้ข้าม
              // console.log(ExCode)
          if (
            !ExCode ||
            !name ||
            ExCode.length == 0 ||
            name.length == 0
          ) {
            result.skipped++;
        // console.log('❌ ไม่มีข้อมูล');
            continue;
          }
          exCodesFromFile.push(ExCode);
    
          const foundAll = existing.find(
            (r) =>
              r.ExCode === ExCode &&
              r.name === name &&
              r.description === description &&
              r.companyId === companyId
          );
    
          if (foundAll) {
            // ถ้ามีข้อมูลซ้ำทุกตัว => ข้าม
            result.skipped++;
      // console.log('⚠️ ข้อมูลซ้ำทุกตัว');
            continue;
          }
          const foundByExCode = existing.find((r) => r.ExCode === ExCode);
          if (foundByExCode) {
            // เก็บเอาไว้ update ในครั้งเดียว
            updatedCategories.push({
              id: foundByExCode.id,
              name,
              description,
            });
            result.updated++;
            continue;
          }

    
          // ถ้าไม่มีซ้ำเลย => เพิ่มใหม่
          const newCategory = this.categoryRepository.create({
            ExCode,
            name,
            description,
            companyId,
          });
          newCategories.push(newCategory);
          result.inserted++;
          }
        }

        // ✅ บันทึกข้อมูลใหม่ในครั้งเดียว (batch ขนาด 100)
        const BATCH_SIZE = 100;
        if (newCategories.length > 0) {
          for (let i = 0; i < newCategories.length; i += BATCH_SIZE) {
            const batch = newCategories.slice(i, i + BATCH_SIZE);
            await this.categoryRepository.save(batch);
          }
        }

        // ✅ อัปเดตข้อมูลในครั้งเดียว (batch ขนาด 100)
        if (updatedCategories.length > 0) {
          for (let i = 0; i < updatedCategories.length; i += BATCH_SIZE) {
            const batch = updatedCategories.slice(i, i + BATCH_SIZE);
            await Promise.all(
              batch.map((u) => this.categoryRepository.update(u.id, { name: u.name, description: u.description }))
            );
          }
        }

          const categoriesToDelete = existing.filter(
            (r) => r.ExCode && !exCodesFromFile.includes(r.ExCode),
          );

          if (categoriesToDelete.length > 0) {
            // console.log(`🗑️ พบข้อมูล Category เกิน ${categoriesToDelete.length} รายการ → กำลังลบ...`);
            const idsToDelete = categoriesToDelete.map((r) => r?.id);
            await this.categoryRepository.softDelete({ id: In(idsToDelete), companyId });
            result.deleted = categoriesToDelete.length;
          }

          const FinalCount = await this.categoryRepository.count();
          console.log(`✅ Update Category Complete
📦 จากไฟล์: ${fileCount}
📂 ใน DB (หลังอัปเดต): ${FinalCount}
➕ เพิ่มใหม่: ${result.inserted}
🔁 อัปเดต: ${result.updated}
⏭️ ข้าม: ${result.skipped}
🗑️ ลบออก: ${result.deleted}`)
return 'DONE';
}

  async findByIds(ids: readonly string[]): Promise<CategoryDto[]> {
    return this.categoryRepository
      .findByIds([...ids])
      .then((arr) => arr.map((o) => this.mapEntityToDto(o)));
  }
async findAll(args?: {
  limit?: number;
  offset?: number;
  query?: string;
  companyId?: string;
}): Promise<[CategoryDto[], number]> {
  const {
    limit,
    offset = 0,
    query,
    companyId = this.DEFAULT_COMPANY_ID,
  } = args ?? {};

  const where: any = { companyId };

  if (query != null) {
    where.name = Like(`%${query}%`);
  }

  const [arr, count] = await this.categoryRepository.findAndCount({
    where,
    skip: offset,
    take: limit && limit > 0 ? limit : undefined,
  });

  return [arr.map((o) => this.mapEntityToDto(o)), count];
}
  
  async findByExCode(exCode: string, companyId: string = this.DEFAULT_COMPANY_ID): Promise<CategoryDto | null> {
    const category = await this.categoryRepository.findOne({
      where: { ExCode: exCode, companyId },
    });

    return category ? this.mapEntityToDto(category) : null;
  }


    async findByExCodes(exCodes: string[], companyId: string = this.DEFAULT_COMPANY_ID): Promise<CategoryDto[]> {
    if (!exCodes || exCodes.length === 0) return [];
    const category = await this.categoryRepository.find({
      where: { ExCode: In(exCodes), companyId },
    });
    return category.map((o) => this.mapEntityToDto(o));
  }

  private mapEntityToDto(category: Category): CategoryDto {
    return plainToClass(CategoryDto, category);
  }

  private cleanText(value: any): string {
    if (!value) return '';
    // แปลงเป็น string แล้ว trim และลดช่องว่างซ้ำให้เหลือ 1 ช่อง
    return String(value)
      .trim()
      .replace(/\s+/g, ' ');
  }



}
