import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class RESTAPISellerJWTGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return (await super.canActivate(context)) as boolean;
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    // when apply token user will have data
    if (err || !user) {
      if (info instanceof TokenExpiredError)
        throw new UnauthorizedException('token has been expired.');
      throw err || new UnauthorizedException(info.message);
    }
    return user;
  }
}
