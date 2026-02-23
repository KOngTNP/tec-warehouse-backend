import { ExecutionContext, Injectable } from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';

@Injectable()
export class GqlAuthStoreGuard extends AuthGuard('bearer') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isActivated = await super.canActivate(context);
    if (!isActivated) return false;
    const stores = this.reflector.get('storeRoles', context.getHandler());
    // storeRoles undefined means StoreRolesGuard not decorate above resolver
    // must have store roles defined to allow store user to access that function
    if (!stores) {
      return false;
    }
    const request = this.getRequest(context);
    return stores.includes(request.user.userStore.role);
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
