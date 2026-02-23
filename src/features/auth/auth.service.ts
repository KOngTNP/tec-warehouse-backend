import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';
import { EntityManager } from 'typeorm';
import {
  FirebaseAdminSDK,
  FIREBASE_ADMIN_INJECT,
} from '../firebase-admin/firebase-admin.module';
import { User } from '../user/models/user.entity';
import { UserService } from '../user/user.service';
import { AuthUser } from './auth.dto';

@Injectable()
export class AuthService {


  constructor(
    @Inject(FIREBASE_ADMIN_INJECT) private firebaseAdmin: FirebaseAdminSDK,
    private entityManager: EntityManager,
    private configService: ConfigService,
    private UserService: UserService,
  ) {

  }

  async validateUser(idToken: string): Promise<AuthUser> {
    try {
      const user = await this.firebaseAdmin.auth().verifyIdToken(idToken);
      if (!user) {
        throw new UnauthorizedException();
      }
      const userDetail = await this.UserService.findOneById(
        user.uid,
      );

      // update lastlogin without waiting
      this.checkBeforeUpdateLastLogin(user.uid);
      return { id: user.uid, email: user.email, role: user.role, firstName: userDetail?.firstName, lastName: userDetail?.lastName  };
    } catch (err) {
      // console.log('AuthService validateUser', err.message);
      throw new UnauthorizedException();
    }
  }

  // ******* Because of import module is struggling with import loop so user entity manager ******//
  // check before update last login (last active at)
  // to reduce input update to database because we will set thie update at validate user token
  async checkBeforeUpdateLastLogin(id: string): Promise<boolean> {
    const user = await this.entityManager
      .createQueryBuilder(User, 'user')
      .where('user.id = :id', {
        id: id,
      })
      .getOne();
    if (!user?.lastLogin) {
      return await this.updateLastLogin(id);
    }
    const now = dayjs();
    const diffInHr = dayjs(now).diff(user.lastLogin, 'hour');
    // if (diffInHr >= this.lastLoginDiff) {
    //   return await this.updateLastLogin(id);
    // }
    // await this.entityManager.update(
    //   User,
    //   { id: id },
    //   { loginAttempt: 0, attemptLifeTime: null },
    // );
    return false;
  }

  async updateLastLogin(id: string): Promise<boolean> {
    const updateResult = await this.entityManager.update(
      User,
      { id: id },
      { lastLogin: dayjs().toDate() },
    );
    if (updateResult.affected === 0) {
      return false;
    }
    return true;
  }
  // ******* ******* ******//
}
