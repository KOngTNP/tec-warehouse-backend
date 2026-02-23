import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import _ from 'lodash';

import { BrandService } from './brand.service';
import { BrandDto } from './dto/brand.dto';

@Injectable({ scope: Scope.TRANSIENT })
export class BrandLoader {
  constructor(private readonly brandService: BrandService) {}

  generateDataLoader(): any {
    return new DataLoader<string, BrandDto>(async (keys) => {
      const cats = await this.brandService.findByIds(keys);
      const group = _.keyBy(cats, 'id');
      return keys.map((id) => group[id] ?? null);
    });
  }
}

