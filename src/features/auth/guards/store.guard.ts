import { SetMetadata } from '@nestjs/common';
import { StoreRole } from '../auth.dto';

export const StoreRolesGuard = (...storeRoles: StoreRole[]) =>
  SetMetadata('storeRoles', storeRoles);
