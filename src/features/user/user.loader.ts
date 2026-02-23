import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';

import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';
import _ from 'lodash';

@Injectable({ scope: Scope.TRANSIENT })
export class UserLoader  {
  constructor(private readonly userService: UserService) {}

  generateDataLoader(): any {
    return new DataLoader<string, UserDto>(async (keys) => {
      const users = await this.userService.findByIds([...keys]);
      const group = _.keyBy(users, 'id');
      return keys.map((id) => group[id] ?? null);
    });
  }
}


@Injectable({ scope: Scope.TRANSIENT })
export class UserLoaderByQuotationIdLoader {
  constructor(private readonly userService: UserService) {}

  generateDataLoader(): any {
    return new DataLoader<string, UserDto>(async (keys) => {
      // keys คือ array ของ quotationId
      const users = await this.userService.findByQuotationIds([...keys]);
      
      // ✅ ต้องมั่นใจว่า findByQuotationIds คืนค่า user ที่มีฟิลด์ quotationId ติดมาด้วย
      const group = _.keyBy(users, 'quotationId'); 
      
      return keys.map((id) => group[id] || null);
    });
  }
}
