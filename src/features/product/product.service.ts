import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Like, Repository, Brackets } from 'typeorm';
import { ProductDto, SearchSuggestionDto } from './dto/product.dto';
import { Product } from './models/product.entity';
import { plainToClass } from 'class-transformer';
import { OrderItemService } from '../order/order-item.service';
import { PurchaseItemService } from '../purchase/purchase-item.service';
import * as admin from 'firebase-admin';
import { CategoryService } from '../category/category.service';
import * as path from 'path';
import { DBFFile } from 'dbffile';
import * as fs from 'fs';
import { CreateProductInput } from './dto/product.input';
import { UpdateProductInput } from './dto/update-product.input';


@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @Inject(forwardRef(() => OrderItemService))
    private readonly orderItemService: OrderItemService,
    private readonly entityManager: EntityManager,

    @Inject(forwardRef(() => PurchaseItemService))
    private readonly purchaseItemService: PurchaseItemService,
       @Inject(forwardRef(() => CategoryService))
    private readonly categoryService: CategoryService,
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

async importProductFromDbf(companyId: string, pathDBF: string): Promise<string> {
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

  // โหลดข้อมูลเก่าใน DB
  const existing: Product[] = await this.productRepository.find({
    where: { companyId }
  });
  const existingMapByExCode = new Map(existing.map((r) => [r.ExCode, r]));
  const existingMapByName = new Map(existing.map((r) => [r.name, r]));

  // เตรียมรหัส Category ทั้งหมดเพื่อลด query
  const allCategoryCodes = [...new Set(records.map((r) => this.cleanText(r.STKGRP)))];
  const categories = await this.categoryService.findByExCodes(allCategoryCodes, companyId);
  const categoryMap = new Map(categories.map((c) => [c.ExCode, c.id]));

  const exCodesFromFile: string[] = [];
  const newProducts: Product[] = [];
  const updatedProducts: Partial<Product & { id: string }>[] = [];

  for (const record of records) {
    const ExCode = this.cleanText(record.STKCOD);
    const partstore = this.cleanText(record.BARCOD);
    const name = this.cleanText(`${record.STKDES} ${record.STKDES2}`);
    const rawUnit = this.cleanText(record.QUCOD);
    const unit = this.unitMap(rawUnit) || rawUnit;
    const description = this.cleanText(record.REMARK);
    const categoryCode = this.cleanText(record.STKGRP);
    const categoryId = categoryMap.get(categoryCode) || null;
    const isGroup = this.cleanText(record.STKLEV).length > 0;
    const stock = Number(this.cleanText(record.TOTBAL));

    // ถ้าไม่มีข้อมูลหลัก → ข้าม
    if (!ExCode || !rawUnit || !name || name.length === 0 || ExCode.length === 0) {
      result.skipped++;
      continue;
    }

    exCodesFromFile.push(ExCode);

    // ✅ ตรวจข้อมูลซ้ำทุกฟิลด์ (เหมือนเดิม)
    const foundAll = existing.find(
      (r) =>
        r.ExCode === ExCode &&
        r.partstore === partstore &&
        r.name === name &&
        r.unit === unit &&
        r.categoryId === categoryId &&
        r.description === description &&
        r.companyId === companyId &&
        r.stock === stock
    );
    if (foundAll) {
      result.skipped++;
      continue;
    }

    // 🔁 ตรวจซ้ำแบบ by ExCode ก่อน
    const foundByExCode = existingMapByExCode.get(ExCode);
    if (foundByExCode) {
      updatedProducts.push({
        id: foundByExCode.id,
        name,
        partstore,
        description,
        unit,
        categoryId,
        isGroup,
        companyId,
        stock,
      });
      // console.log('foundByExCode.name: ',foundByExCode.name)
      // console.log('name: ',name)
      // console.log('foundByExCode partstore: ',foundByExCode.partstore)
      // console.log('partstore: ',partstore)
      // console.log('foundByExCode description: ',foundByExCode.description)
      // console.log('description: ',description)

      //       console.log('foundByExCode unit: ',foundByExCode.unit)
      // console.log('unit: ',unit)

      //             console.log('foundByExCode categoryId: ',foundByExCode.categoryId)
      // console.log('categoryId: ',categoryId)

      //                   console.log('foundByExCode isGroup: ',foundByExCode.isGroup)
      // console.log('isGroup: ',isGroup)
      result.updated++;
      continue;
    }

    // 🔁 ตรวจซ้ำแบบ by Name ถ้า ExCode ไม่เจอ
    const foundByName = existingMapByName.get(name);
    if (foundByName) {
      updatedProducts.push({
        id: foundByName.id,
        ExCode,
        partstore,
        description,
        unit,
        categoryId,
        isGroup,
        companyId,
        stock,
      });
      //       console.log('foundByExCode.ExCode: ',foundByExCode.ExCode)
      // console.log('name: ',ExCode)
      // console.log('foundByExCode partstore: ',foundByExCode.partstore)
      // console.log('partstore: ',partstore)
      // console.log('foundByExCode description: ',foundByExCode.description)
      // console.log('description: ',description)

      //       console.log('foundByExCode unit: ',foundByExCode.unit)
      // console.log('unit: ',unit)

      //             console.log('foundByExCode categoryId: ',foundByExCode.categoryId)
      // console.log('categoryId: ',categoryId)

      //                   console.log('foundByExCode isGroup: ',foundByExCode.isGroup)
      // console.log('isGroup: ',isGroup)
      result.updated++;
      continue;
    }

    // ➕ ถ้าไม่ซ้ำเลย → เพิ่มใหม่
    const newProduct = this.productRepository.create({
      partstore,
      ExCode,
      name,
      description,
      unit,
      categoryId,
      isGroup,
      companyId,
      stock,
    });
    newProducts.push(newProduct);
    result.inserted++;
  }

  // ✅ บันทึกทั้งหมดในครั้งเดียว (batch ขนาด 100 เพื่อไม่เต็ม connection pool)
  const BATCH_SIZE = 100;
  
  if (newProducts.length > 0) {
    for (let i = 0; i < newProducts.length; i += BATCH_SIZE) {
      const batch = newProducts.slice(i, i + BATCH_SIZE);
      await this.productRepository.save(batch);
    }
  }
  
  if (updatedProducts.length > 0){
    console.log('updatedProducts count: ', updatedProducts.length)
    for (let i = 0; i < updatedProducts.length; i += BATCH_SIZE) {
      const batch = updatedProducts.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map((u) => this.productRepository.update(u.id, u)));
    }
  }

  // 🗑️ ลบข้อมูลที่ไม่มีในไฟล์
  const productsToDelete = existing.filter((r) => r.ExCode && !exCodesFromFile.includes(r.ExCode));
  if (productsToDelete.length > 0) {
    const idsToDelete = productsToDelete.map((r) => r.id);
    await this.productRepository.softDelete({ id: In(idsToDelete), companyId });
    result.deleted = idsToDelete.length;
  }

  const finalCount = await this.productRepository.count();

  console.log(`✅ PRODUCT Import Complete
📦 จากไฟล์: ${records.length}
📂 ใน DB (หลังอัปเดต): ${finalCount}
➕ เพิ่มใหม่: ${result.inserted}
🔁 อัปเดต: ${result.updated}
⏭️ ข้าม: ${result.skipped}
🗑️ ลบออก: ${result.deleted}`);

  return 'DONE';
}



async createTempProduct(input: CreateProductInput): Promise<Product> {
  // ✅ ดึงฟิลด์ใหม่ที่พี่เพิ่มเข้ามาออกมารับค่า
  const { imageFiles, videoFiles, dataSheetFiles, ...productData } = input;
  const bucket = admin.storage().bucket();
  const uploadedPaths: string[] = []; 

  return await this.entityManager.transaction(async (manager) => {
    try {
      // 1. เตรียม Entity (ใส่ค่าเริ่มต้นเป็น Array ว่างให้ครบทุกฟิลด์)
      const product = manager.create(Product, {
        ...productData,
        images: [],
        videos: [],
        dataSheets: [],
        isGroup: !!input.isGroup,
        createdAt: new Date(),
      });

      const savedProduct = await manager.save(product);

      // 2. ฟังก์ชันช่วย Upload เพื่อลดโค้ดซ้ำซ้อน
      const uploadFiles = async (files: Promise<any>[], folder: string) => {
        if (!files || files.length === 0) return [];
        return Promise.all(
          files.map(async (filePromise, idx) => {
            const file = await filePromise;
            // แยก path ตามประเภท: products/{id}/{folder}/{timestamp}_{idx}
            const path = `products/${savedProduct.id}/${folder}/${Date.now()}_${idx}`;
            uploadedPaths.push(path);
            return this.uploadToStorage(bucket, path, file);
          }),
        );
      };

      // 3. รันการอัปโหลดพร้อมกันทุกประเภท (Parallel)
      const [imageUrls, videoUrls, dataSheetUrls] = await Promise.all([
        uploadFiles(imageFiles, 'images'),
        uploadFiles(videoFiles, 'videos'),
        uploadFiles(dataSheetFiles, 'documents'),
      ]);

      // 4. อัปเดตข้อมูลไฟล์ทั้งหมดกลับเข้าไปที่ ID เดิม
      await manager.update(Product, savedProduct.id, {
        images: imageUrls,
        videos: videoUrls,
        dataSheets: dataSheetUrls,
      });

      // คืนค่าก้อนข้อมูลที่อัปเดตแล้ว
      return { ...savedProduct, images: imageUrls, videos: videoUrls, dataSheets: dataSheetUrls };

    } catch (error) {
      // 🚨 Rollback: ถ้า Error ให้ตามลบไฟล์ทุกประเภทที่ขึ้นไปแล้ว
      if (uploadedPaths.length > 0) {
        await Promise.all(uploadedPaths.map(path => bucket.file(path).delete().catch(() => {})));
      }
      throw error;
    }
  });
}
  private async uploadToStorage(bucket: any, path: string, file: any): Promise<string> {
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
        .on('finish', () => {
          // คืนค่า Public URL เพื่อนำไปเก็บใน string[] ของ Entity
          resolve(cloudFile.publicUrl());
        });
    });
  }

  async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  const { 
    imageFiles, videoFiles, dataSheetFiles, 
    existingImages, existingVideos, existingSheets, 
    ...productData 
  } = input;
  
  const bucket = admin.storage().bucket();

  return await this.entityManager.transaction(async (manager) => {
    // 1. ดึงข้อมูลเดิมมาเช็คก่อน
    const oldProduct = await manager.findOne(Product, { where: { id } });
    if (!oldProduct) throw new Error('ไม่พบข้อมูลสินค้า');

    try {
      // 2. จัดการไฟล์ใหม่ (Upload New Files)
      const uploadFiles = async (files: Promise<any>[], folder: string) => {
        if (!files || files.length === 0) return [];
        return Promise.all(
          files.map(async (filePromise, idx) => {
            const file = await filePromise;
            const path = `products/${id}/${folder}/${Date.now()}_${idx}`;
            return this.uploadToStorage(bucket, path, file);
          }),
        );
      };

      const [newImageUrls, newVideoUrls, newDataSheetUrls] = await Promise.all([
        uploadFiles(imageFiles, 'images'),
        uploadFiles(videoFiles, 'videos'),
        uploadFiles(dataSheetFiles, 'documents'),
      ]);

      // 3. รวมไฟล์เดิมที่ผู้ใช้ "เลือกเก็บไว้" กับไฟล์ใหม่ที่อัปโหลด
      const finalImages = [...(existingImages || []), ...newImageUrls];
      const finalVideos = [...(existingVideos || []), ...newVideoUrls];
      const finalSheets = [...(existingSheets || []), ...newDataSheetUrls];

      // 4. [สำคัญ] ลบไฟล์ใน Storage ที่ไม่อยู่ในรายการที่เก็บไว้แล้ว (Cleanup)
      const findDeletedFiles = (oldList: string[], newList: string[]) => 
        oldList.filter(oldUrl => !newList.includes(oldUrl));

      const deletedImages = findDeletedFiles(oldProduct.images || [], finalImages);
      const deletedVideos = findDeletedFiles(oldProduct.videos || [], finalVideos);
      const deletedSheets = findDeletedFiles(oldProduct.dataSheets || [], finalSheets);

      // รันการลบไฟล์ออกจาก Firebase/Cloud Storage
      const allDeleted = [...deletedImages, ...deletedVideos, ...deletedSheets];
      await Promise.all(
        allDeleted.map(url => {
          // แปลง URL กลับเป็น Path เพื่อลบไฟล์
          const path = url.split(`${bucket.name}/`)[1]; 
          return bucket.file(path).delete().catch(() => {});
        })
      );

      // 5. บันทึกข้อมูลที่แก้ไขทั้งหมดลง Database
      await manager.update(Product, id, {
        ...productData,
        images: finalImages,
        videos: finalVideos,
        dataSheets: finalSheets,
        modifiedAt: new Date(),
      });

      return await manager.findOne(Product, { where: { id } });
    } catch (error) {
      throw error;
    }
  });
}
  
  async findProductByExCode(ExCode: string, companyId:string = this.DEFAULT_COMPANY_ID): Promise<Product | null> {
    const product = await this.productRepository.findOne({
      where: { ExCode: ExCode , companyId},
    });

    // if (!product) {
    //   throw new NotFoundException(`Product with ExCode ${ExCode} not found`);
    // }

    return product ? product : null
  }
async removeProductImageById(
  productId: string,
  imageUrl: string,
): Promise<Product> {
  const product = await this.productRepository.findOne({
    where: { id: productId },
  });

  if (!product) {
    throw new NotFoundException("Product not found");
  }

  const images = product.images ?? [];

  // ✅ เช็คว่ามีรูปนี้จริงไหม
  if (!images.includes(imageUrl)) {
    throw new BadRequestException("Image not found in product");
  }

  // ✅ ลบรูปออก
  product.images = images.filter((img) => img !== imageUrl);

  return this.productRepository.save(product);
}
  async addProductImageById(
    productId: string,
    imageUrl: string,
  ): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    // ✅ ถ้า images ยังไม่มี ให้เป็น array เปล่า
    if (!product.images) {
      product.images = [];
    }

    // ✅ push รูปใหม่เข้าไปทีละรูป
    product.images.push(imageUrl);

    return await this.productRepository.save(product);
  }

  async findByExCodes(exCodes: string[],
      companyId: string = this.DEFAULT_COMPANY_ID
  ): Promise<Product[] | []> {
  if (!exCodes || exCodes.length === 0) return [];
  const products = await this.productRepository.find({
    where: { ExCode: In(exCodes), companyId  },
  });
  return products
}

  async findAll(args?: {
    limit?: number;
    offset?: number;
    query?: string;
    productId?: string[]; // <-- รับเป็น array
    companyId?: string;
  }): Promise<[ProductDto[], number]> {
        const {
    limit,
    offset = 0,
    query,
    productId = [],
    companyId = this.DEFAULT_COMPANY_ID,
  } = args ?? {};
  
    const where: any = {companyId};
    const skip = offset ?? 0;
    const take = limit && limit > 0 ? limit : undefined;

    // 1️⃣ กรณีไม่มี query → ปกติ
    if (!query || query.trim() === '') {
      // console.log('innnn1')
      const [arr, count] = await this.productRepository.findAndCount({
        where: Object.keys(where)?.length ? where : undefined,
        order: { name: 'ASC' },
        skip,
        take,
      });
      // console.log('arr: ',arr)
      // console.log('innnn2')
      const result: [ProductDto[], number] = [
        await this.mapEntitiesToDtos(arr),
        count,
      ];
      // console.log('innnn3')
      return result;
    }

    // 2️⃣ smart search path
    const remainingLimit = Math.max(0, (limit || 20) - (productId?.length || 0));
    const suggestResult = await this.suggestions(
      query,
      companyId,
      remainingLimit,
    );

    const filteredProducts = suggestResult.filter(
      (product) => !(productId?.includes(product.id))
    );

    // // map by id
    // const dtoList: ProductDto[] = await Promise.all(
    //   arr.map((o) => this.mapEntityToDto(o)),
    // );
    // const dtoMap: Record<string, ProductDto> = dtoList.reduce(
    //   (acc, dto) => {
    //     if (dto && dto.id) acc[dto.id] = dto;
    //     return acc;
    //   },
    //   {} as Record<string, ProductDto>,
    // );

    // // preserve final order
    // const ordered: ProductDto[] = finalIds
    //   .map((id) => dtoMap[id])
    //   .filter(Boolean);

    // // pagination in-memory
    // const start = args.offset ?? 0;
    // const end = start + (args.limit ?? ordered?.length);
    // const paginated = ordered.slice(start, end);

    const safeResults = filteredProducts || [];
    return [safeResults, safeResults.length];
  }



  //   async findAll(args?: {
  //   limit?: number;
  //   offset?: number;
  //   query?: string;
  //   productId?: string[]; // <-- รับเป็น array
  // }): Promise<[ProductDto[], number]> {
  //   const where: any = {};
  //   const skip = args?.offset ?? 0;
  //   const take = args?.limit && args.limit > 0 ? args.limit : undefined;

  //   // 1️⃣ กรณีไม่มี query → ปกติ
  //   if (!args?.query || args.query.trim() === '') {
  //     const [arr, count] = await this.productRepository.findAndCount({
  //       where: Object.keys(where)?.length ? where : undefined,
  //       order: { name: 'ASC' },
  //       skip,
  //       take,
  //     });
  //     const result: [ProductDto[], number] = [
  //       await Promise.all(arr.map((o) => this.mapEntityToDto(o))),
  //       count,
  //     ];
  //     return result;
  //   }

  //   // 2️⃣ smart search path
  //   const suggestResult = await this.suggestions(
  //     args.query,
  //     args.limit - (args?.productId?.length || 0),
  //   );
  //   let productIdsFromSearch = suggestResult.products?.map((p) => p.id) || [];

  //   // 3️⃣ ถ้ามี productId ให้เอามาไว้หน้า
  //   const frontIds: string[] = Array.isArray(args.productId)
  //     ? args.productId
  //     : [];

  //   // remove duplicates: เอา productId ที่กำหนดไว้แล้วออกจากผล search
  //   productIdsFromSearch = productIdsFromSearch.filter(
  //     (id) => !frontIds.includes(id),
  //   );

  //   // รวมลำดับ: productId (front) → smart search
  //   // const finalIds = [...frontIds, ...productIdsFromSearch];
  //   const finalIds = productIdsFromSearch;

  //   if (!finalIds?.length) return [[], 0];

  //   // 4️⃣ โหลด entities สำหรับ finalIds
  //   const [arr, _]: [Product[], number] = await this.productRepository
  //     .createQueryBuilder('product')
  //     .where('product.id IN (:...productIds)', { productIds: finalIds })
  //     .getManyAndCount();

  //   // map by id
  //   const dtoList: ProductDto[] = await Promise.all(
  //     arr.map((o) => this.mapEntityToDto(o)),
  //   );
  //   const dtoMap: Record<string, ProductDto> = dtoList.reduce(
  //     (acc, dto) => {
  //       if (dto && dto.id) acc[dto.id] = dto;
  //       return acc;
  //     },
  //     {} as Record<string, ProductDto>,
  //   );

  //   // preserve final order
  //   const ordered: ProductDto[] = finalIds
  //     .map((id) => dtoMap[id])
  //     .filter(Boolean);

  //   // pagination in-memory
  //   const start = args.offset ?? 0;
  //   const end = start + (args.limit ?? ordered?.length);
  //   const paginated = ordered.slice(start, end);

  //   return [paginated, ordered?.length];
  // }

  async findById(id: string): Promise<ProductDto> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    return this.mapEntityToDto(product);
  }

async suggestions(
  query: string,
  companyId: string,
  limit?: number,
): Promise<ProductDto[]> {
  let products: Product[] = [];
  const searchLimit = limit || 20; // ป้องกัน unlimited search

  // 1️⃣ Query products by "starts with"
  const productWithStart = await this.searchProductWithStart(query, companyId, searchLimit);
  
  // ถ้าเจอครบแล้ว return เลย (ลด unnecessary queries)
  if (productWithStart?.length >= searchLimit) {
    const productDtos = await this.mapEntitiesToDtos(productWithStart);
    return productDtos;
  }

  const excludeProductIdSet = new Set(productWithStart.map((p) => p.id));

  // 2️⃣ Query products by Full-Text Search (ถ้ายังไม่เจอพอ)
  const remainingLimit = Math.max(0, searchLimit - productWithStart.length); // ป้องกัน negative limit
  const productWithFTS = await this.searchProductWithFTSBoolean(
    query,
    Array.from(excludeProductIdSet),
    remainingLimit,
    companyId,
  );

  // รวมผล
  products = [
    ...productWithStart,
    ...productWithFTS.filter((p) => !excludeProductIdSet.has(p.id)),
  ];

  // 3️⃣ Fallback: SOUNDEX (ถ้าไม่เจอเลย)
  if (products?.length === 0) {
    try {
      const findsoundDex = await this.entityManager.query(
        'SELECT CAST(SUBSTRING(SOUNDEX(?) FROM 2) AS UNSIGNED) AS numeric_part',
        [query],
      );
      const soundDex: string = (findsoundDex[0]?.numeric_part)?.toString();

      if (soundDex?.length > 3) {
        products = await this.entityManager
          .createQueryBuilder(Product, 'product')
          .where("SOUNDEX(product.name) LIKE CONCAT('%', :soundDex, '%')", { soundDex })
          .andWhere(`product.companyId = :companyId`, { companyId })
          .limit(searchLimit)
          .getMany();
      }
    } catch (e) {
      // ถ้า SOUNDEX fail ให้ข้าม
    }
  }

  // 4️⃣ Fallback สุดท้าย: general search
  if (products?.length === 0) {
    products = await this.entityManager
      .createQueryBuilder(Product, 'product')
      .where(`product.companyId = :companyId`, { companyId })
      .andWhere(
        new Brackets(qb => {
          qb.where(`product.name LIKE CONCAT('%', :query, '%')`, { query })
            .orWhere(`product.ExCode LIKE CONCAT('%', :query, '%')`, { query });
        })
      )
      .limit(searchLimit)
      .getMany();
  }

  // 5️⃣ Map entities to DTOs
  const productDtos: ProductDto[] = await this.mapEntitiesToDtos(products);
  return productDtos;
}


async searchProductWithStart(
  query: string,
  companyId: string,
  limit?: number,
) {
    const searchLimit = limit || 20; // ป้องกัน 0 หรือ undefined

    let results = await this.entityManager
      .createQueryBuilder(Product, 'product')
      .leftJoin('order_item', 'orderItem', 'orderItem.productId = product.id')
      .where(`product.companyId = :companyId`, { companyId })
      .andWhere(
        new Brackets(qb => {
          qb.where(`product.name LIKE CONCAT(:query, '%')`, { query })
            .orWhere(`product.ExCode LIKE CONCAT(:query, '%')`, { query })
            .orWhere(`orderItem.sellName LIKE CONCAT(:query, '%')`, { query });
        })
      )
      .limit(searchLimit)
      .getMany();

    if (results?.length === 0) {
      results = await this.entityManager
        .createQueryBuilder(Product, 'product')
        .leftJoin('order_item', 'orderItem', 'orderItem.productId = product.id')
        .where(`product.companyId = :companyId`, { companyId })
        .andWhere(
          new Brackets(qb => {
            qb.where(`product.name LIKE CONCAT('%', :query, '%')`, { query })
              .orWhere(`product.ExCode LIKE CONCAT('%', :query, '%')`, { query })
              .orWhere(`orderItem.sellName LIKE CONCAT('%', :query, '%')`, { query });
          })
        )
        .limit(searchLimit)
        .getMany();
    }

    return results;
  }

  async searchProductWithFTSBoolean(
    query: string,
    excludeProductId: string[] = [],
    limit = 20,
    companyId: string,
    offset = 0,
  ) {
    // ถ้า limit เป็น 0 หรือติดลบ ให้ return empty
    if (!limit || limit <= 0) return [];

    const keywords = query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((k) => k?.length > 0);

    if (!keywords?.length) return [];

    const booleanQuery = keywords.map((k) => `+${k}*`).join(' ');

    const qb = this.entityManager
      .createQueryBuilder(Product, 'product')
      .leftJoin('order_item', 'orderItem', 'orderItem.productId = product.id')
      .where(`(
        MATCH(product.name) AGAINST (:booleanQuery IN BOOLEAN MODE) > 0
        OR MATCH(product.ExCode) AGAINST (:booleanQuery IN BOOLEAN MODE) > 0
        OR MATCH(orderItem.sellName) AGAINST (:booleanQuery IN BOOLEAN MODE) > 0
      )`)
      .andWhere(`product.companyId = :companyId`, { companyId })
      .setParameter('booleanQuery', booleanQuery)
    
    if (excludeProductId?.length > 0) {
      qb.andWhere('product.id NOT IN (:...excludeProductId)', {
        excludeProductId,
      });
    }

    const results = await qb
      .take(limit)
      .getMany();

    return results;
  }
  private async loadProductsByIds(ids: string[]): Promise<SearchSuggestionDto> {
    if (!ids?.length) return { products: [] };
    const products = await this.productRepository.find({
      where: { id: In(ids) },
    });
    // map and preserve order from ids
    const dtoList = await this.mapEntitiesToDtos(products);
    const dtoMap: Record<string, ProductDto> = dtoList.reduce((acc, d) => {
      if (d && d.id) acc[d.id] = d;
      return acc;
    }, {});
    const ordered = ids.map((id) => dtoMap[id]).filter(Boolean);
    return { products: ordered };
  }

  async findByIds(ids: readonly string[]): Promise<ProductDto[]> {
    const products = await this.productRepository.find({
      where: { id: In([...ids]) },
    });

    const mapped = await this.mapEntitiesToDtos(products);

    // sort mapped results to follow the original ids order
    const ordered = ids
      .map((id) => mapped.find((p) => p.id === id))
      .filter(Boolean);
    return ordered;
  }

  async createProductSearchFile( companyId: string = this.DEFAULT_COMPANY_ID): Promise<boolean> {
    try {
      // if(!products) {
      const rawProducts = await this.productRepository
        .createQueryBuilder('product')
        .leftJoin('order_item', 'orderItem', 'orderItem.productId = product.id')
        .leftJoin('order', 'order', 'order.id = orderItem.orderId')
        .leftJoin('customer', 'customer', 'customer.id = order.customerId')
        .select([
          'product.id AS id',
          'product.name AS name',
          'product.ExCode AS exCode',
          'orderItem.sellName AS sellName',
          'orderItem.documentNumber AS documentNumber',
          'customer.name AS customerName',
          'customer.ExCode AS customerCode',
        ])
        .where('product.companyId = :companyId', { companyId })
        .getRawMany();

      // Group by product
      const products = rawProducts.reduce((acc, row) => {
        let product = acc.find((p) => p.id === row.id);
        if (!product) {
          product = {
            id: row.id,
            name: row.name,
            exCode: row.exCode,
            sellNames: [],
            documentNumbers: [],
            customers: []
          };
          acc.push(product);
        }
        if (row.sellName) product.sellNames.push(row.sellName);
        if (row.documentNumber) product.documentNumbers.push(row.documentNumber);
        if (row.customer) product.customers.push(`${row.customerName | row.customerCode}`);

        return acc;
      }, [])
      .map((p) => ({
        ...p,
        documentNumbers: p.documentNumbers.sort((a, b) =>
          String(b).localeCompare(String(a))
        ),
      }));
      // }

      const dtoList = products.map((p) => this.mapEntityToSearchDto(p));
      // console.log(products);
      const buffer = Buffer.from(JSON.stringify(dtoList, null, 2), 'utf8');
      const bucket = admin.storage().bucket();
      let file
      if(companyId == '887e6d2f-a266-4a0f-baf3-c6ece1f38210') {
        file = bucket.file('WARE-HOUSE/search/product-tm-db.json');
      } else {
        file = bucket.file('WARE-HOUSE/search/product-tec-db.json');
      }
      // console.log('Preview JSON:', JSON.stringify(dtoList, null, 2));
      await file.save(buffer, {
        contentType: 'application/json',
        public: true,
      });

      console.log(
        `✅ Uploaded to: https://storage.googleapis.com/${bucket.name}/WARE-HOUSE/search/product-db.json`,
      );
      return true;
    } catch (error) {
      console.error('❌ Error in createProductSearchFile:', error);
      return false;
    }
  }

  private mapEntityToSearchDto(entity: any) {
    return {
      id: entity.id,
      name: entity.name,
      exCode: entity.exCode,
      sellNames: entity.sellNames || [],
      documentNumbers: entity.documentNumbers || [],
      customer: entity.customers || []
    };
  }
private cleanText(value: any): string {
    if (!value) return '';
    // แปลงเป็น string แล้ว trim และลดช่องว่างซ้ำให้เหลือ 1 ช่อง
    return String(value)
      .trim()
      .replace(/\s+/g, ' ');
  }

  async findByGroupIds(
    groupIds: readonly string[],
  ): Promise<ProductDto[]> {
    const products = await this.productRepository.find({
      where: {
        groupIds: In([...groupIds]),
      },
      relations: ['category'],
    });
    return await this.mapEntitiesToDtos(products);
  }

  async findByCategoryIds(
    categoryIds: readonly string[],
  ): Promise<ProductDto[]> {
    const products = await this.productRepository.find({
      where: {
        categoryId: In([...categoryIds]),
      },
      relations: ['category'],
    });
    return await this.mapEntitiesToDtos(products);
  }

    async findByBrandIds(
    brandIds: readonly string[],
  ): Promise<ProductDto[]> {
    const products = await this.productRepository.find({
      where: {
        brandId: In([...brandIds]),
      },
      relations: ['brand'],
    });
    return await this.mapEntitiesToDtos(products);
  }


  // mapProductEntityToDto(product: Product): ProductDto {
  //   return this.mapEntityToDto(product);
  // }

private async mapEntityToDto(product: Product): Promise<ProductDto> {
  if (!product) return null;

  const dto = plainToClass(ProductDto, product);

  const [lastSellDetail, lastBuyDetail] = await Promise.all([
    this.orderItemService.getLastSellDetail(product.id),
    this.purchaseItemService.getLastBuyDetail(product.id),
  ]);

  dto.lastSellDetail = lastSellDetail
    ? {
        lastSellDate: lastSellDetail.date || null,
        lastSellUnit: lastSellDetail.unit || null,
        lastSellUnitPrice: lastSellDetail.unitPrice || null,
        lastSellDiscount: lastSellDetail.discount || null,
        lastSellUnitPriceAfterDiscount:
          (lastSellDetail.quantity && lastSellDetail.quantity !== 0)
            ? (lastSellDetail.totalPrice / lastSellDetail.quantity)
            : 0,
        lastSellTotalPrice: lastSellDetail.totalPrice || null,
        lastSellQuantity: lastSellDetail.quantity || null,
        lastSellCustomerName: lastSellDetail.customerName || null,
        lastSellCustomerContact: lastSellDetail.customerContact || null,
        lastSellOrderReference: lastSellDetail.orderReference || null,
        lastSellVatType:
          lastSellDetail.vatType === '0'
            ? 'ไม่มี VAT'
            : lastSellDetail.vatType === '1'
            ? 'รวม VAT'
            : lastSellDetail.vatType === '2'
            ? 'บวก VAT'
            : null,
      }
    : null;

  dto.lastBuyDetail = lastBuyDetail
    ? {
        lastBuyDate: lastBuyDetail.date || null,
        lastBuyUnit: lastBuyDetail.unit || null,
        lastBuyUnitPrice: lastBuyDetail.unitPrice || null,
        lastBuyDiscount: lastBuyDetail.discount || null,
        lastBuyUnitPriceAfterDiscount:
          (lastBuyDetail.quantity && lastBuyDetail.quantity !== 0)
            ? (lastBuyDetail.totalPrice / lastBuyDetail.quantity)
            : 0,
        lastBuyTotalPrice: lastBuyDetail.totalPrice || null,
        lastBuyQuantity: lastBuyDetail.quantity || null,
        lastBuyVenderName: lastBuyDetail.venderName || null,
        lastBuyVenderContact: lastBuyDetail.venderContact || null,
        lastBuyPurchaseReference: lastBuyDetail.purchaseReference || null,
        lastBuyVatType:
          lastBuyDetail.vatType === '0'
            ? 'ไม่มี VAT'
            : lastBuyDetail.vatType === '1'
            ? 'รวม VAT'
            : lastBuyDetail.vatType === '2'
            ? 'บวก VAT'
            : null,
        lastBuyRemark: lastBuyDetail.remark,
        lastBuyCompareFileNumber: lastBuyDetail.compareFileNumber,
      }
    : null;

  return dto;
}

// ProductService
async mapEntitiesToDtos(products: Product[]): Promise<ProductDto[]> {
  if (!products?.length) return [];

  // preload IDs
  const productIds = products.map(p => p.id);

  // 🔹 preload ข้อมูลทั้งหมดที่จำเป็นในครั้งเดียว
  const [lastSellMap, lastBuyMap] = await Promise.all([
    this.orderItemService.getLastSellDetailMap(productIds),
    this.purchaseItemService.getLastBuyDetailMap(productIds, products[0].companyId),
  ]);

  return products.map(product => {
    const dto = plainToClass(ProductDto, product);
    const lastSellDetail = lastSellMap.get(product.id);
    const lastBuyDetail = lastBuyMap.get(product.id);

    dto.lastSellDetail = lastSellDetail
      ? {
        lastSellDate: lastSellDetail.date || null,
        lastSellUnit: lastSellDetail.unit || null,
        lastSellUnitPrice: lastSellDetail.unitPrice || null,
        lastSellDiscount: lastSellDetail.discount || null,
        lastSellUnitPriceAfterDiscount:
          (lastSellDetail.quantity && lastSellDetail.quantity !== 0)
            ? (lastSellDetail.totalPrice / lastSellDetail.quantity)
            : 0,
        lastSellTotalPrice: lastSellDetail.totalPrice || null,
        lastSellQuantity: lastSellDetail.quantity || null,
        lastSellCustomerName: lastSellDetail.customerName || null,
        lastSellCustomerContact: lastSellDetail.customerContact || null,
        lastSellOrderReference: lastSellDetail.orderReference || null,
        lastSellVatType:
          lastSellDetail.vatType === '0'
            ? 'ไม่มี VAT'
            : lastSellDetail.vatType === '1'
            ? 'รวม VAT'
            : lastSellDetail.vatType === '2'
            ? 'บวก VAT'
            : null,
      }
      : null;

    dto.lastBuyDetail = lastBuyDetail
      ? {
        lastBuyDate: lastBuyDetail.date || null,
        lastBuyUnit: lastBuyDetail.unit || null,
        lastBuyUnitPrice: lastBuyDetail.unitPrice || null,
        lastBuyDiscount: lastBuyDetail.discount || null,
        lastBuyUnitPriceAfterDiscount:
          (lastBuyDetail.quantity && lastBuyDetail.quantity !== 0)
            ? (lastBuyDetail.totalPrice / lastBuyDetail.quantity)
            : 0,
        lastBuyTotalPrice: lastBuyDetail.totalPrice || null,
        lastBuyQuantity: lastBuyDetail.quantity || null,
        lastBuyVenderName: lastBuyDetail.venderName || null,
        lastBuyVenderContact: lastBuyDetail.venderContact || null,
        lastBuyPurchaseReference: lastBuyDetail.purchaseReference || null,
        lastBuyVatType:
          lastBuyDetail.vatType === '0'
            ? 'ไม่มี VAT'
            : lastBuyDetail.vatType === '1'
            ? 'รวม VAT'
            : lastBuyDetail.vatType === '2'
            ? 'บวก VAT'
            : null,
        lastBuyRemark: lastBuyDetail.remark,
        lastBuyCompareFileNumber: lastBuyDetail.compareFileNumber,
      }
      : null;

    return dto;
  });
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



}


