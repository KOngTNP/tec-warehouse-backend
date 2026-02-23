import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Raw, Repository } from 'typeorm';
import { RemarkDto } from './dto/remark.dto';
import { Remark } from './models/remark.entity';
import { plainToClass } from 'class-transformer';
import * as path from 'path';
import { DBFFile } from 'dbffile';
import * as fs from 'fs';

@Injectable()
export class RemarkService {
  constructor(
    @InjectRepository(Remark)
    private remarkRepository: Repository<Remark>,
  ) {}
private readonly DEFAULT_COMPANY_ID = 'a618ee20-7099-4fb0-9793-c9efcdf1807e';
async importRemarkFromDbf(companyId: string, pathDBF: string): Promise<string> {
  const filePath = path.resolve(
        pathDBF,
  );

  if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);

  const dbf = await DBFFile.open(filePath, { encoding: 'cp874' });
  const records = await dbf.readRecords();

  console.log(`📄 Read ${records.length} rows from ${path.basename(filePath)}`);

  const result = { inserted: 0, updated: 0, skipped: 0, deleted: 0 };

  // ✅ โหลดข้อมูลทั้งหมดจาก DB ก่อน
  const existing: Remark[] = await this.remarkRepository.find({
    where: { companyId }
  });
  const existingMap = new Map<string, Remark>(
    existing.map(
      (r) => [`${r.documentNumber}-${r.seqNumber}-${r.remark}`, r],
    ),
  );

  const exCodesFromFile: string[] = [];
  const newRemarks: Remark[] = [];

  // ✅ เตรียมสร้าง remark ใหม่ทั้งหมดก่อน (batch insert)
  for (const record of records) {
    const documentNumber = this.cleanText(record.DOCNUM);
    const seqNumber = this.cleanText(record.SEQNUM);
    const remark = this.cleanText(record.REMARK);

    // skip ถ้าไม่มีข้อมูล
    if (!documentNumber && !seqNumber && !remark) {
      result.skipped++;
      continue;
    }

    const remarkKey = `${documentNumber}-${seqNumber}-${remark}`;
    exCodesFromFile.push(remarkKey);

    // ถ้ามีอยู่แล้ว -> ข้าม
    if (existingMap.has(remarkKey)) {
      result.skipped++;
      continue;
    }

    // สร้าง remark ใหม่
    newRemarks.push(
      this.remarkRepository.create({
        documentNumber,
        seqNumber,
        remark,
        companyId,
      }),
    );
    result.inserted++;
  }

  // ✅ insert ทีเดียว
  if (newRemarks.length > 0) {
    await this.remarkRepository.save(newRemarks);
  }

  // ✅ หารายการที่จะลบออก (soft delete)
const remarksToDelete = existing.filter(
  (r) => !exCodesFromFile.includes(`${r.documentNumber}-${r.seqNumber}-${r.remark}`),
);

// 🔹 ลบ duplicate ใน DB (documentNumber + seqNumber + remark)
const seen = new Map<string, string>(); // key = documentNumber-seqNumber-remark, value = id
const duplicates = [];

for (const r of existing) {
  const key = `${r.documentNumber}-${r.seqNumber}-${r.remark}`;
  if (seen.has(key)) {
    // ถ้าเคยเจอ key นี้แล้ว แถวนี้เป็น duplicate
    duplicates.push(r.id);
  } else {
    seen.set(key, r.id);
  }
}

// รวมรายการที่จะลบทั้งสองกรณี
const idsToDelete = [
  ...remarksToDelete.map((r) => r.id),
  ...duplicates,
];

// ทำ soft delete ถ้ามี
if (idsToDelete.length > 0) {
  await this.remarkRepository.softDelete({ id: In(idsToDelete), companyId });
  result.deleted = idsToDelete.length;
}

  const finalCount = await this.remarkRepository.count();

  console.log(`✅ REMARK Import Complete
📦 จากไฟล์: ${records.length}
📂 ใน DB (หลังอัปเดต): ${finalCount}
➕ เพิ่มใหม่: ${result.inserted}
🔁 อัปเดต: ${result.updated}
⏭️ ข้าม: ${result.skipped}
🗑️ ลบออก: ${result.deleted}`);

  return 'DONE';
}



  async findAll(args?: {
    limit?: number;
    offset?: number;
    query?: string;
    companyId?: string;
  }): Promise<[RemarkDto[], number]> {
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

    const [arr, count] = await this.remarkRepository.findAndCount({
      where: Object.keys(where).length ? where : undefined,
      skip,
      take,
    });

    const result: [RemarkDto[], number] = [
      arr.map((o) => this.mapEntityToDto(o)),
      count,
    ];
    return result;
  }

  async findByIds(ids: readonly string[]): Promise<RemarkDto[]> {
    const remarks = await this.remarkRepository.find({
      where: { id: In([...ids]) },
    });
    return remarks.map((o) => this.mapEntityToDto(o));
  }

  async parseDocNumberArray(codes: string[]) {
  return codes.map(code => {
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

async getRemarkMapByDocNumbers(
  docNumbers: string[],
  companyId: string
): Promise<Map<string, { remark: string[]; compareFileNumber: string[] }>> {
  const map = new Map<string, { remark: string[]; compareFileNumber: string[] }>();
  if (!docNumbers.length) return map;

  // 1️⃣ แปลง code → { documentNumber, seqNumber }
  const parsedDocs = await this.parseDocNumberArray(docNumbers);
  const docNumberStrings = parsedDocs.map(d => d.documentNumber); // string[]

  // 2️⃣ query remarks ทีเดียว
  const remarks = await this.remarkRepository.find({
    where: { documentNumber: In(docNumberStrings), companyId },
  });

  // 3️⃣ สร้าง map สำหรับ documentNumber → remark list
  const remarksGrouped = new Map<string, typeof remarks>();
  for (const r of remarks) {
    const key = r.documentNumber;
    if (!remarksGrouped.has(key)) remarksGrouped.set(key, []);
    remarksGrouped.get(key).push(r);
  }

  // 4️⃣ loop docNumbers (original order) แล้ว map remark
  for (let i = 0; i < docNumbers.length; i++) {
    const originalDoc = docNumbers[i];
    const parsed = parsedDocs[i];
    const filteredRemarks = remarksGrouped.get(parsed.documentNumber) || [];

    const parsedRemark = await this.findRemarkWithValidCode2(
      originalDoc,
      companyId,
      filteredRemarks,
      parsed.seqNumber,
    );

    map.set(originalDoc, parsedRemark);
  }

  return map;
}



  async findRemarkWithValidCode(rawDocumentNumber: string, companyId: string) {
    const { documentNumber, seqNumber } =
      await this.parseDocNumber(rawDocumentNumber);
    const remarks = await this.remarkRepository.find({
      where: { documentNumber, companyId },
    });
    if (!remarks?.length) {
      return { documentNumber, seqNumber, remark: [], compareFileNumber: [] };
    }
    const regex =
      /\bQ?([6-9][0-9]|[0-9]{2})(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])-[0-9]{3}\b/;
    const validRemarks = remarks.filter((r) => {
      const text = r.remark?.trim() ?? '';
      return text !== '' && regex.test(text);
    });
    if (!validRemarks.length) {
      return { documentNumber, seqNumber, remark: [], compareFileNumber: [] };
    }
    regex.lastIndex = 0;
    const filteredRemarks = validRemarks.filter(
      (r) => Number(r.seqNumber) >= Number(seqNumber),
    );
    if (!filteredRemarks.length) {
      return { documentNumber, seqNumber, remark: [], compareFileNumber: [] };
    }
    const minSeqRemark = filteredRemarks.reduce(
      (min, r) =>
        !min || Number(r.seqNumber) < Number(min.seqNumber) ? r : min,
      null as (typeof remarks)[number] | null,
    );
    if (!minSeqRemark) {
      return { documentNumber, seqNumber, remark: [], compareFileNumber: [] };
    }
    const remarkNotes = [minSeqRemark.remark?.trim() || ''];
    const regex2 =
      /\bQ?([6-9][0-9]|[0-9]{2})(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])-[0-9]{3}\b/g;
    const matches = (minSeqRemark.remark || '').match(regex2) || [];
    const uniqueCodes = [...new Set(matches)];
    return {
      documentNumber,
      seqNumber,
      remark: remarkNotes,
      compareFileNumber: uniqueCodes,
    };
  }


async findRemarksWithValidCodes(rawDocumentNumbers: string[], companyId: string) {
  if (!rawDocumentNumbers?.length) return [];

  // ---- 1) parse documentNumber & seqNumber ทุกตัว ----
  const parsedList = await Promise.all(
    rawDocumentNumbers.map(raw => this.parseDocNumber(raw))
  );

  // ---- 2) unique documentNumber ----
  const uniqueDocNumbers = Array.from(new Set(parsedList.map(p => p.documentNumber)));

  // ---- 3) fetch remark entities ----
  const remarkEntities = await this.remarkRepository.find({
    where: { documentNumber: In(uniqueDocNumbers), companyId },
  });

  // ---- 4) regex & pre-process remarkMap ----
  const regex = /\bQ?([6-9][0-9]|[0-9]{2})(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])-[0-9]{3}\b/g;
  const remarkMap = new Map<string, { remark: string[]; compareFileNumber: string[]; seqNumber: number }[]>();

  for (const r of remarkEntities) {
    const text = r.remark?.trim() ?? '';
    if (!text || !regex.test(text)) continue; // filter remark ที่ไม่ตรง regex

    const matches = [...new Set(text.match(regex) || [])]; // unique codes

    const item = { remark: [text], compareFileNumber: matches, seqNumber: Number(r.seqNumber) };

    if (!remarkMap.has(r.documentNumber)) remarkMap.set(r.documentNumber, []);
    remarkMap.get(r.documentNumber)!.push(item);
  }

  // sort array ตาม seqNumber เพื่อง่ายต่อการ pick min
  for (const arr of remarkMap.values()) arr.sort((a, b) => a.seqNumber - b.seqNumber);

  // ---- 5) map result ----
  return parsedList.map(({ documentNumber, seqNumber }) => {
    const remarks = remarkMap.get(documentNumber) ?? [];
    const selected = remarks.find(r => r.seqNumber >= seqNumber) ?? { remark: [], compareFileNumber: [] };
    return { documentNumber, seqNumber, remark: selected.remark, compareFileNumber: selected.compareFileNumber };
  });
}





async findRemarkWithValidCode2(documentNumber: string, companyId?: string, remarksFromMap?: Remark[], seqNumber?:number) {
  // const { documentNumber, seqNumber } = await this.parseDocNumber(rawDocumentNumber);
  const remarks = remarksFromMap ?? (await this.remarkRepository.find({ where: { documentNumber, companyId } }));

  if (!remarks?.length) {
    return {
      documentNumber,
      seqNumber,
      remark: [],
      compareFileNumber: [],
    };
  }

 const regex = /\bQ?([6-9][0-9]|[0-9]{2})(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])-[0-9]{3}\b/;
const validRemarks = remarks.filter(r => {
  const text = r.remark?.trim() ?? '';
  return text !== '' && regex.test(text);
});


  if (!validRemarks.length) {
    return {
      documentNumber,
      seqNumber,
      remark: [],
      compareFileNumber: [],
    };
  }

  // ⚡️ รีเซ็ต regex.lastIndex (เพราะ regex.test() ใช้ global flag)
  regex.lastIndex = 0;

  // ⚡️ กรอง remarks ที่มี seqNumber >= seqNumber ของ documentNumber
  const filteredRemarks = validRemarks.filter(
    (r) => Number(r.seqNumber) >= Number(seqNumber),
  );
  if (!filteredRemarks.length) {
    return {
      documentNumber,
      seqNumber,
      remark: [],
      compareFileNumber: [],
    };
  }

  // ⚡️ หา remark ที่มี seqNumber น้อยที่สุดจากกลุ่มนี้
  const minSeqRemark = filteredRemarks.reduce((min, r) =>
    !min || Number(r.seqNumber) < Number(min.seqNumber) ? r : min,
    null as (typeof remarks)[number] | null,
  );

  if (!minSeqRemark) {
    return {
      documentNumber,
      seqNumber,
      remark: [],
      compareFileNumber: [],
    };
  }

  // ✅ remarkNotes: remark เดียว (เพราะเลือกตัว seqNumber น้อยที่สุดที่ >=)
  const remarkNotes = [minSeqRemark.remark?.trim() || ''];
const regex2 = /\bQ?([6-9][0-9]|[0-9]{2})(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])-[0-9]{3}\b/g;
  // ✅ ดึงเฉพาะ remark ที่ match pattern
  const matches = (minSeqRemark.remark || '').match(regex2) || [];
  // console.log('matches: ',matches)
  const uniqueCodes = [...new Set(matches)];

  return {
    documentNumber,
    seqNumber,
    remark: remarkNotes,
    compareFileNumber: uniqueCodes,
  };
}


  mapRemarkEntityToDto(remark: Remark): RemarkDto {
    return this.mapEntityToDto(remark);
  }

  private cleanText(value: any): string {
    if (!value) return '';
    // แปลงเป็น string แล้ว trim และลดช่องว่างซ้ำให้เหลือ 1 ช่อง
    return String(value).trim().replace(/\s+/g, ' ');
  }

  private mapEntityToDto(remark: Remark): RemarkDto {
    if (!remark) return null;
    const dto = plainToClass(RemarkDto, remark);
    return dto;
  }
}
