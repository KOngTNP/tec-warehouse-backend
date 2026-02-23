import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import _ from 'lodash';

import {
  ProductDto,
} from './dto/product.dto';
import { ProductService } from './product.service';


@Injectable({ scope: Scope.TRANSIENT })
export class ProductByCategoryLoader
{
  constructor(private readonly productService: ProductService) {}

  generateDataLoader(): any {
    return new DataLoader<string, ProductDto[]>(
      async (keys) => {
        const products = await this.productService.findByCategoryIds(keys);
        const group = _.groupBy(products, 'categoryId');
        return keys.map((id) => group[id as string] ?? null);
      },
      { cache: false },
    );
  }
}

@Injectable({ scope: Scope.TRANSIENT })
export class ProductByBrandLoader
{
  constructor(private readonly productService: ProductService) {}

  generateDataLoader(): any {
    return new DataLoader<string, ProductDto[]>(
      async (keys) => {
        const products = await this.productService.findByBrandIds(keys);
        const group = _.groupBy(products, 'brandId');
        return keys.map((id) => group[id as string] ?? null);
      },
      { cache: false },
    );
  }
}


@Injectable({ scope: Scope.TRANSIENT })
export class ProductLoader {
  constructor(private readonly productService: ProductService) {}

  generateDataLoader(): any {
    return new DataLoader<string, ProductDto>(
      async (keys) => {
        const products = await this.productService.findByIds(keys);
        const group = _.keyBy(products, 'id');

        return keys.map((id) => group[id] ?? null);
      },
      { cache: false },
    );
  }
}
