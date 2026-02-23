import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '../auth/auth.dto';
import {
  FirebaseAdminSDK,
  FIREBASE_ADMIN_INJECT,
} from '../firebase-admin/firebase-admin.module';
import { GrantAdminInput } from './dto/grant-admin-input.dto';
import { User } from '../user/models/user.entity';
import { UserDto } from '../user/dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { ConfigService } from '@nestjs/config';
import { UserAdminService } from '../user-admin/user-admin.service';

@Injectable()
export class AdminService {
  constructor(
    @Inject(FIREBASE_ADMIN_INJECT) private firebaseAdmin: FirebaseAdminSDK,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
    private userAdminService: UserAdminService,
  ) {}

  async grantAdmin(grantAdmin: GrantAdminInput): Promise<void> {
    if (grantAdmin.key !== 'FM_IS_SO_GOD') {
      throw new BadRequestException();
    }
    await this.firebaseAdmin
      .auth()
      .setCustomUserClaims(grantAdmin.userId, { role: grantAdmin.role });
  }

  async revokeAdmin(grantAdmin: GrantAdminInput): Promise<void> {
    if (grantAdmin.key !== 'FM_IS_SO_GOD') {
      throw new BadRequestException();
    }
    await this.firebaseAdmin
      .auth()
      .setCustomUserClaims(grantAdmin.userId, { role: '' });
  }

  async grantAdminByEmail(email: string, role: string): Promise<UserDto> {
    const user = await this.userRepository.findOne({ email });
    if (!user) throw Error('user not found');
    await this.grantAdmin({ key: 'FM_IS_SO_GOD', userId: user.id, role: role });
    await this.userAdminService.createAdmin(user.id, role);
    return plainToClass(UserDto, user);
  }

  async revokeAdminByEmail(email: string): Promise<UserDto> {
    const user = await this.userRepository.findOne({ email });
    if (!user) throw Error('user not found');
    await this.revokeAdmin({ key: 'FM_IS_SO_GOD', userId: user.id });
    await this.userAdminService.deleteAdmin(user.id);
    return plainToClass(UserDto, user);
  }

  async SendNotiToUser() {
    let unseenMsgCount = [];
    await this.firebaseAdmin
      .database()
      .ref('unseenMsgCount/')
      .once('value', (resp) => {
        unseenMsgCount = this.snapshotToArray(resp);
      });
    unseenMsgCount.map((msg) => {
      for (const [key, value] of Object.entries(msg)) {
        if (key !== 'key') {
          console.log(`${key}: ${value}`);
          // send mail to these emails
        }
      }
    });
    return true;
  }

  validateLineMessagingApi(basicAuth: string): boolean {
    if (!basicAuth) {
      return false;
    }
    const basicAuthID = this.configService.get<string>(
      'apiLineAuth.firstcredential',
    );
    const basicAuthPass = this.configService.get<string>(
      'apiLineAuth.secondcredential',
    );
    const b64 = Buffer.from(
      basicAuthID + ':' + basicAuthPass,
      'utf-8',
    ).toString('base64');
    const compare = basicAuth?.replace('Basic ', '');
    if (compare != b64) {
      return false;
      // throw new UnauthorizedException();
    }
    return true;
  }

  validateGoogleScheduler(basicAuth: string): boolean {
    if (!basicAuth) {
      return false;
    }
    const basicAuthID = this.configService.get<string>(
      'apiAuth.firstcredential',
    );
    const basicAuthPass = this.configService.get<string>(
      'apiAuth.secondcredential',
    );
    const b64 = Buffer.from(
      basicAuthID + ':' + basicAuthPass,
      'utf-8',
    ).toString('base64');
    const compare = basicAuth?.replace('Basic ', '');
    if (compare !== b64) {
      return false;
      // throw new UnauthorizedException();
    }
    return true;
  }

  validateKerryCallBack(basicAuth: string): boolean {
    const basicAuthID = this.configService.get<string>(
      'apiDeliveryAuth.firstcredential',
    );
    const basicAuthPass = this.configService.get<string>(
      'apiDeliveryAuth.secondcredential',
    );
    const b64 = Buffer.from(
      basicAuthID + ':' + basicAuthPass,
      'utf-8',
    ).toString('base64');
    if (basicAuth !== 'Basic ' + b64) {
      return false;
    }
    return true;
  }

  snapshotToArray = (snapshot) => {
    const returnArr = [];

    snapshot.forEach((childSnapshot) => {
      const item = childSnapshot.val();
      item.key = childSnapshot.key;
      returnArr.push(item);
    });

    return returnArr;
  };
}
