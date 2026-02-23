import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthSellerJWT } from '../auth.dto';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('seller.secretKey'),
    });
  }

  async validate(payload: any): Promise<AuthSellerJWT> {
    if (this.isTokenExpired(payload.exp)) {
      throw new UnauthorizedException('Token has been expired');
    }
    return { storeId: payload.storeId, name: payload.storeName };
  }

  isTokenExpired(expirationTime: number): boolean {
    return Date.now() >= expirationTime * 1000;
  }
}
