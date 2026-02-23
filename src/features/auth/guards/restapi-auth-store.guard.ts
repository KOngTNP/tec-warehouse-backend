import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RESTAPIStoreRolesGuard extends AuthGuard('bearer') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isActivated = await super.canActivate(context);
    if (!isActivated) return false;
    const stores = this.reflector.get('storeRoles', context.getHandler());
    if (stores === undefined) {
      throw new UnauthorizedException();
    }
    const request = context.switchToHttp().getRequest();
    return stores.includes(request.user.userStore.role);
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    // when apply token user will have data
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
