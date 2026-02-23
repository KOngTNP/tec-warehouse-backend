import { AuthService } from './auth.service';
import { BearerStrategy } from './strategies/bearer.strategy';
import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JWTStrategy } from './strategies/jwt.strategy';
import { AuthJWTService } from './auth-jwt.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PassportModule, UserModule],
  providers: [AuthService, AuthJWTService, BearerStrategy, JWTStrategy],
  exports: [AuthService, AuthJWTService],
})
export class AuthModule {}
