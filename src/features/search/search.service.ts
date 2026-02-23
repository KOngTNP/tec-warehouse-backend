import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { OrderService } from '../order/order.service';
import { OrderItemService } from '../order/order-item.service';
import { PurchaseService } from '../purchase/purchase.service';
import { PurchaseItemService } from '../purchase/purchase-item.service';
import { ProductService } from '../product/product.service';
import { CategoryService } from '../category/category.service';
import { VenderService } from '../vender/vender.service';
import { CustomerService } from '../customer/customer.service';
import tnthai = require('tnthai');

@Injectable()
export class SearchService {
  private analyzer: any;

  // กำหนด stopwords ที่ไม่ต้องการ
  private static STOPWORDS = new Set([
    'x', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
    'inch', 'mm', 'hp', 'a', 'v', 'vdc', 'vac', 'w', 'kw', 'rf', 'ce'
  ]);

  constructor(
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,

    @Inject(forwardRef(() => OrderItemService))
    private readonly orderItemService: OrderItemService,

    @Inject(forwardRef(() => PurchaseService))
    private readonly purchaseService: PurchaseService,

    @Inject(forwardRef(() => PurchaseItemService))
    private readonly purchaseItemService: PurchaseItemService,

    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,

    @Inject(forwardRef(() => CategoryService))
    private readonly categoryService: CategoryService,

    @Inject(forwardRef(() => VenderService))
    private readonly venderService: VenderService,

    @Inject(forwardRef(() => CustomerService))
    private readonly customerService: CustomerService,

    private readonly entityManager: EntityManager,
  ) {
    // เรียกใช้งาน tnthai ให้ถูกต้อง
    this.analyzer = new tnthai();
  }
  /** ---------------------------------------------------------
   *  Convert search phrase to MySQL MATCH AGAINST format
   *  Example: "ลวดเชื่อม YAWATA"
   *  => { separated: "+ลวดเชื่อม +YAWATA", combined: "+ลวดเชื่อมYAWATA" }
   * --------------------------------------------------------- */
async searchBestVenders(keyword: string) {
  // --------------------------
  // Build separated & combined keywords
  // --------------------------
  const words = keyword
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);

  if (words.length === 0) return [];

  const separated = words.map((w) => `+${w}`).join(' ');
  const combined = `+${words.join('')}`;
  const likeKeyword = `%${words.join('%')}%`; // flexible Thai substring

  // --------------------------
  // SQL Query
  // --------------------------
  const sql = `
WITH fluke_items AS (
    SELECT 
        v.id AS vender_id,
        v.name AS venderName,
        v.telNumber AS venderTel,
        p.id AS product_id,
        p.name AS productName,
        pi.discount,
        pi.totalPrice,
        pu.date AS purchaseDate,

        -- Fulltext relevance (ใช้ string literal)
        MATCH(p.name) AGAINST ('${separated}' IN BOOLEAN MODE) AS relevance_sep,
        MATCH(p.name) AGAINST ('${combined}' IN BOOLEAN MODE) AS relevance_comb,

        -- LIKE similarity for Thai substring (flexible)
        (CASE WHEN p.name LIKE ? THEN 5 ELSE 0 END) AS relevance_like,

        ROW_NUMBER() OVER (PARTITION BY v.id ORDER BY pu.date DESC) AS rn
    FROM product p
    JOIN purchase_item pi ON p.id = pi.productId
    JOIN purchase pu ON pi.purchaseId = pu.id
    JOIN vender v ON pu.venderId = v.id
    WHERE p.deletedAt IS NULL
      AND pu.deletedAt IS NULL
      AND v.deletedAt IS NULL
      AND (
            MATCH(p.name) AGAINST ('${separated}' IN BOOLEAN MODE) > 0
         OR MATCH(p.name) AGAINST ('${combined}' IN BOOLEAN MODE) > 0
         OR p.name LIKE ?
      )
),
vender_stats AS (
    SELECT vender_id, COUNT(*) AS purchaseCount
    FROM fluke_items
    GROUP BY vender_id
)
SELECT
fs.vender_id,
    fs.venderName,
    fs.venderTel,
    vs.purchaseCount,
    fs.productName,
    fs.purchaseDate,
    fs.discount,
    -- รวม relevance: FullText + LIKE
    (fs.relevance_sep * 2 + fs.relevance_comb + fs.relevance_like) AS totalRelevance
FROM fluke_items fs
JOIN vender_stats vs ON fs.vender_id = vs.vender_id
WHERE fs.rn = 1
ORDER BY vs.purchaseCount DESC
LIMIT 5;
`;

  // --------------------------
  // Execute
  // --------------------------
  return await this.entityManager.query(sql, [likeKeyword, likeKeyword]);
}
cleanProductName(name: string): string[] {
  if (!name) return [];

  // แยกคำ
  const result = this.analyzer.segmenting(name, { filterStopword: false });
  const tokens = result.solution.map((w: string) => w.trim().toLowerCase()).filter(Boolean);

  const mergedTokens: string[] = [];
  let thaiBuffer = '';

  for (const t of tokens) {
    if (/^[ก-๙]+$/.test(t)) {
      // token เป็นภาษาไทย เก็บไว้รวม
      thaiBuffer += t;
    } else {
      // token ไม่ใช่ไทย
      if (thaiBuffer) {
        if (thaiBuffer.length > 2 && thaiBuffer.length < 10) mergedTokens.push(thaiBuffer); // filter ไทยสั้น
        thaiBuffer = '';
      }
      // token ภาษาอังกฤษ/ตัวเลข
      if (!/^[\d\W]+$/.test(t) && t.length > 3) {
        mergedTokens.push(t);
      }
    }
  }
  // push buffer สุดท้าย
  if (thaiBuffer.length > 2 && thaiBuffer.length < 10) mergedTokens.push(thaiBuffer);

  return mergedTokens;
}

  private filterTopKeywords(keywords: { keyword: string}[]) {

      // if (/^[\d\W]+$/.test(k.keyword)) return false;

      // ตัดคำ generic ไทยหรืออังกฤษ/unit
      const genericWords = [
    'สี', 'ขนาด', 'inch', 'size', 'กลาง', 'xxxxx', 'ใช้', 'ช่อง',
    'ราคาปรับ', 'กว้าง', 'ฟุต', 'sqmm', 'foot', 'brand', 'ตัว',
    'กล่อง', 'ชิ้น', 'อัน', 'นูน', 'แถม', 'ซื้อ', 'รวม', 'รวมซื้อ',
    'เฉลี่ย', 'ปรับ', 'บาท', 'แบบ', 'ชุด', 'ลิตร', 'กก', 'กิโล',
    'กิโลกรัม', 'แพ็ค', 'แพค', 'ม้วน', 'มม', 'เมตร', 'เมตรคู่',
    'คู่', 'มิลลิเมตร', 'มิล', 'ลบ', 'ลบปลอก', 'ปลอก', 'ยาว',
    'ยาวพิเศษ', 'ยาวพิเศษx', 'ยาวx', 'extra', 'long', 'length',
    'high', 'height', 'wide', 'width','ถุง','บรรจุ','บรรจุx',
    'บรรจุxขนาด', 'มี','ทำแปรง','ทำ','แปรง', 'เกลียว', 'ฟรี', 
    'ราคา', 'นำเข้า', 'thailand' ,'สั่ง','ชั้น', 'หนา'
  ];

  return keywords.filter(k => {
    // ตัดคำสั้น <=2 ตัว, ตัวเลขล้วน, symbol
    // if (k.keyword.length <= 2) return false;
    // if (/^[\d\W]+$/.test(k.keyword)) return false;

    // ตัดคำ generic จาก list
    for (const gw of genericWords) {
      if (k.keyword.includes(gw)) return false;
    }

    return true;
  });

  }

  /**
   * นับ top keywords ของ vendor
   */
  async getTopKeywordsByVendor(venderId: string, limit = 50) {
    // 1. ดึงสินค้าของ vendor จาก purchase_item + purchase + product
    const products = await this.entityManager
      .createQueryBuilder('purchase_item', 'pri')
      .select('p.name', 'name')
      .innerJoin('product', 'p', 'pri.productId = p.id')
      .innerJoin('purchase', 'pr', 'pri.purchaseId = pr.id')
      .where('pr.venderId = :venderId', { venderId })
      .getRawMany<{ name: string }>();

    // 2. Segment และรวม keyword
    const keywordCounts: Record<string, number> = {};
    products.forEach((p) => {
      const tokens = this.cleanProductName(p.name);
      tokens.forEach((t) => {
        keywordCounts[t] = (keywordCounts[t] || 0) + 1;
      });
    });

    // 3. จัดเรียงตาม usage count
    let sorted = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([keyword]) => ({ keyword }));

    sorted = this.filterTopKeywords(sorted).slice(0, 10);

    return sorted.flatMap((k) => k.keyword);
  }



    async getTopKeywordsByCustomer(customerId: string, limit = 50) {
    // 1. ดึงสินค้าของ vendor จาก order_item + order + product
    const products = await this.entityManager
      .createQueryBuilder('order_item', 'pri')
      .select('p.name', 'name')
      .innerJoin('product', 'p', 'pri.productId = p.id')
      .innerJoin('order', 'pr', 'pri.orderId = pr.id')
      .where('pr.customerId = :customerId', { customerId })
      .getRawMany<{ name: string }>();

    // 2. Segment และรวม keyword
    const keywordCounts: Record<string, number> = {};
    products.forEach((p) => {
      const tokens = this.cleanProductName(p.name);
      tokens.forEach((t) => {
        keywordCounts[t] = (keywordCounts[t] || 0) + 1;
      });
    });

    // 3. จัดเรียงตาม usage count
    let sorted = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([keyword]) => ({ keyword }));

    sorted = this.filterTopKeywords(sorted).slice(0, 10);

    return sorted.flatMap((k) => k.keyword);
  }

}
