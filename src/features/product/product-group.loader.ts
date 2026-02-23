import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import _ from 'lodash';
import { ProductGroupDto } from './dto/product-group.dto';
import { ProductGroupService } from './product-group.service';

@Injectable({ scope: Scope.TRANSIENT })
export class ProductGroupByParentLoader {
  constructor(
    private readonly productGroupService: ProductGroupService,
  ) {}

  generateDataLoader(): any {
    return new DataLoader<string, ProductGroupDto[]>(async (keys) => {
      const groups = await this.productGroupService.findByChildProductIds(keys);
      const grouped = _.groupBy(groups, (g) => g.childProductId);
      return keys.map((id) => grouped[id as string] || []);
    });
  }
}



@Injectable({ scope: Scope.TRANSIENT })
export class ProductGroupByChildLoader {
  constructor(
    private readonly productGroupService: ProductGroupService,
  ) {}

  generateDataLoader(): any {
    return new DataLoader<string, ProductGroupDto[]>(async (keys) => {
      const groups = await this.productGroupService.findByParentProductIds(keys);
      const grouped = _.groupBy(groups, (g) => g.parentProductId);
      return keys.map((id) => grouped[id as string] || []);
    });
  }
}


