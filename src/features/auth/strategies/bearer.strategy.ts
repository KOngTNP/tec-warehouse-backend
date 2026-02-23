import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService } from '../auth.service';
import { AuthUser } from '../auth.dto';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(idToken: string): Promise<AuthUser> {
    const user = await this.authService.validateUser(idToken);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
