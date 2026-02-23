import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';

import { SaleUserDto } from './dto/saleUser.dto';
import { SaleUserService } from './saleUser.service';
import _ from 'lodash';

@Injectable({ scope: Scope.TRANSIENT })
export class SaleUserLoader  {
  constructor(private readonly saleUserService: SaleUserService) {}

  generateDataLoader(): any {
    return new DataLoader<string, SaleUserDto>(async (keys) => {
      const saleUsers = await this.saleUserService.findByIds([...keys]);
      const group = _.keyBy(saleUsers, 'id');
      return keys.map((id) => group[id] ?? null);
    });
  }
}
