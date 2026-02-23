import { Role } from '../auth.dto';
import { SetMetadata } from '@nestjs/common';

export const RolesGuard = (...roles: Role[]) => SetMetadata('roles', roles);
