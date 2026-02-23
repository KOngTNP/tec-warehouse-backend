import { ExecutionContext, Injectable } from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';

@Injectable()
export class GqlAuthGuard extends AuthGuard('bearer') {
  constructor(private reflector: Reflector) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // console.log('innnnnnnnn1')
    const isActivated = await super.canActivate(context);
    if (!isActivated) return false;
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = this.getRequest(context);
    // console.log('request: ',request)
    return roles.includes(request.user.role);
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const authHeader = req.headers?.authorization;
    const token = authHeader?.split(' ')[1];
    // console.log('Token:', token); // log raw JWT token
    return ctx.getContext().req;
  }
}
