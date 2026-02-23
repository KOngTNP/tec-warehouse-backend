import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';

import { VenderDto } from './dto/vender.dto';
import { VenderService } from './vender.service';
import _ from 'lodash';

@Injectable({ scope: Scope.TRANSIENT })
export class VenderLoader  {
  constructor(private readonly venderService: VenderService) {}

  generateDataLoader(): any {
    return new DataLoader<string, VenderDto>(async (keys) => {
      const venders = await this.venderService.findByIds([...keys]);
      const group = _.keyBy(venders, 'id');
      return keys.map((id) => group[id] ?? null);
    });
  }
}
