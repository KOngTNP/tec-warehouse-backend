import { Injectable } from '@nestjs/common';
import { SignJWT } from 'jose';

@Injectable()
export class AuthJWTService {
  // generate JWT
  async jwtEncrypter(payload: any, secretKey: string) {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .sign(new TextEncoder().encode(secretKey));
    return token;
  }
}
