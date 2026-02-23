import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import _ from 'lodash';

import { CategoryService } from './category.service';
import { CategoryDto } from './dto/category.dto';

@Injectable({ scope: Scope.TRANSIENT })
export class CategoryLoader {
  constructor(private readonly categoryService: CategoryService) {}

  generateDataLoader(): any {
    return new DataLoader<string, CategoryDto>(async (keys) => {
      const cats = await this.categoryService.findByIds(keys);
      const group = _.keyBy(cats, 'id');
      return keys.map((id) => group[id] ?? null);
    });
  }
}

