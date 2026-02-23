import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';

import { EndUserDto } from './dto/endUser.dto';
import { EndUserService } from './endUser.service';
import _ from 'lodash';

@Injectable({ scope: Scope.TRANSIENT })
export class EndUserLoader  {
  constructor(private readonly endUserService: EndUserService) {}

  generateDataLoader(): any {
    return new DataLoader<string, EndUserDto>(async (keys) => {
      const endUsers = await this.endUserService.findByIds([...keys]);
      const group = _.keyBy(endUsers, 'id');
      return keys.map((id) => group[id] ?? null);
    });
  }
}
