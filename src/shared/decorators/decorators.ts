import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Response } from 'express';
import { AuthSellerJWT, AuthUser } from 'src/features/auth/auth.dto';

export const ResGql = createParamDecorator(
  (data: unknown, context: ExecutionContext): Response =>
    GqlExecutionContext.create(context).getContext().res,
);

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): AuthUser => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);

/**
 * for seller REST API with JWT token.
 */
export const CurrentSeller = createParamDecorator(
  (data: unknown, context: ExecutionContext): AuthSellerJWT => {
    const ctx = context.switchToHttp().getRequest();
    return ctx.user;
  },
);
