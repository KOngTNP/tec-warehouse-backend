import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';

import { PurchasingUserDto } from './dto/purchasingUser.dto';
import { PurchasingUserService } from './purchasingUser.service';
import _ from 'lodash';

@Injectable({ scope: Scope.TRANSIENT })
export class PurchasingUserLoader  {
  constructor(private readonly purchasingUserService: PurchasingUserService) {}

  generateDataLoader(): any {
    return new DataLoader<string, PurchasingUserDto>(async (keys) => {
      const purchasingUsers = await this.purchasingUserService.findByIds([...keys]);
      const group = _.keyBy(purchasingUsers, 'id');
      return keys.map((id) => group[id] ?? null);
    });
  }
}
