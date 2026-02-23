import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RESTAPIRolesGuard extends AuthGuard('bearer') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isActivated = await super.canActivate(context);
    if (!isActivated) return false;
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (roles === undefined) {
      throw new UnauthorizedException();
    }
    const request = context.switchToHttp().getRequest();
    return roles.includes(request.user.role);
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
