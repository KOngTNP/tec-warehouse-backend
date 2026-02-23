import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ApolloError } from 'apollo-server-express';
import { plainToClass } from 'class-transformer';
import dayjs from 'dayjs';
import { customAlphabet } from 'nanoid';
import { Between, IsNull, Like, Not, Repository, Transaction } from 'typeorm';
import {
  AuthUser,
  Role,
  SignUpInput,
  SignUpSocialInput,
} from '../auth/auth.dto';
import {
  FirebaseAdminSDK,
  FIREBASE_ADMIN_INJECT,
} from '../firebase-admin/firebase-admin.module';
import { UpdateUserInput } from './dto/update-user-input.dto';
import { UserDto } from './dto/user.dto';
import { User, UserStatus, UserType } from './models/user.entity';
import { EntityManager } from 'typeorm';
import { Client } from 'basic-ftp';
import { Readable } from 'typeorm/platform/PlatformTools';
import { v4 as uuidv4 } from 'uuid';
// import { EmailService } from '../email/email.service';
import path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as CryptoJS from 'crypto-js';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { GetUserArgs } from './dto/user.args';
import { In } from 'typeorm'; // ✅ ต้อง import ตัวนี้มาใช้

@Injectable()
export class UserService {
  private publicKeyDir: string;
  private privateKeyDir: string;
  private passPhaseEncryption: string;
  private lineAuthClientId: string;
  private lineAuthclientSecret: string;
  private baseUrl: string;
  private lineCustomTokenKey: string;
  private tokenEndpointUri: string;
  private verifyAccessTokenUri: string;
  private sessionTimeoutTime: number;
  constructor(
    @Inject(FIREBASE_ADMIN_INJECT) private firebaseAdmin: FirebaseAdminSDK,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    this.passPhaseEncryption = configService.get('payment.encryptionPassPhase');
    this.publicKeyDir = configService.get('payment.publicKeyDir');
    this.privateKeyDir = configService.get('payment.privateKeyDir');
    this.lineAuthClientId = configService.get('lineAuth.clientId');
    this.lineAuthclientSecret = configService.get('lineAuth.clientSecret');
    this.baseUrl = configService.get<string>('baseUrl');
    this.lineCustomTokenKey = configService.get<string>(
      'lineAuth.customTokenKey',
    );
    this.tokenEndpointUri = configService.get('lineAuth.tokenEndpointUri');
    this.verifyAccessTokenUri = configService.get(
      'lineAuth.verifyAccessTokenUri',
    );
    this.sessionTimeoutTime = configService.get('sessionTimeout.maxLoginHour');
  }

  // async changeEmailOnFirebase(): Promise<void> {
  //   const result = await this.firebaseAdmin.auth().updateUser('llrpm5VPRMVteCsr3ikb20vWpX62', {
  //     email: "chanchai.can@gmail.com"
  //   });
  //   console.log(result.email);
  // }


async findAll(userType?: UserType[]): Promise<User[]> {
  const where: any = {};
  
  // ✅ ตรวจสอบว่ามีข้อมูลใน Array ไหม
  if (userType && userType.length > 0) {
    // ใช้ In() เพื่อสร้าง SQL: WHERE userType IN ('Admin', 'Staff')
    where.userType = In(userType); 
  }

  return await this.userRepository.find({
    where,
    order: { firstName: 'ASC' }
  });
}

  async findOneById(id: string): Promise<UserDto | undefined> {
    const user = this.userRepository.findOne(id).then((u) => this.mapEntityToDto(u));
    if(user)
    return user
  else return null
  }

async findByQuotationIds(quotationIds: string[]): Promise<any[]> {
  return await this.userRepository.createQueryBuilder('user')
    .select('user') 
    .addSelect('user.quotationId') // ดึง ID มาเพื่อใช้ทำ Map Key
    .where('user.quotationId IN (:...ids)', { ids: quotationIds })
    .getMany();
}
  async checkSessionTimeout(
    id: string,
    waitingAuthLogin: boolean,
  ): Promise<boolean> {
    const now = dayjs();
    // if not production don't neet to login again
    if (process.env.CONFIG_NAME != 'production') return false;
    // if timeout return true
    if (id && !waitingAuthLogin) {
      const user = await this.userRepository.findOne(id);
      const limitLogin = dayjs(user.lastLogin).add(
        this.sessionTimeoutTime,
        'hour',
      );
      if (now.isAfter(limitLogin)) {
        return true;
      }
    } else {
      // if not login or not timeout return false
      return false;
    }
  }

  async findByIds(ids: string[]): Promise<UserDto[]> {
    const users = await this.userRepository.findByIds(ids);
    return users.map((u) => this.mapEntityToDto(u));
  }

  async findByMobileNo(mobile: string): Promise<UserDto> {
    return this.userRepository
      .findOne({ where: { mobileNo: this.formatMobileNo(mobile) } })
      .then((u) => this.mapEntityToDto(u));
  }

  async findByEmail(email: string): Promise<UserDto> {
    return this.userRepository
      .findOne({ where: { email: email } })
      .then((u) => this.mapEntityToDto(u));
  }

  async signIn(id: string): Promise<boolean> {
    const result = await this.userRepository.update(id, {
      lastLogin: dayjs().toDate(),
      loginAttempt: 0,
      attemptLifeTime: null,
    });
    return result.affected > 0;
  }

  async signupCheck(email: string, mobile: string): Promise<boolean> {
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { mobileNo: this.formatMobileNo(mobile) }],
    });
    if (existingUser) return false;
    return true;
  }

  async sentMailResetPassword(email: string) {
    const user = await this.findByEmail(email);
    const id = user.id;
    // genarate uuid
    const resetPasswordCode = uuidv4();
    // Encrypted uuid
    const secretKey = this.configService.get('resetPasswordKey');
    const encryptedCode = CryptoJS.AES.encrypt(resetPasswordCode, secretKey)
      .toString()
      .replace(/\+/g, 'p1L2u3S')
      .replace(/\//g, 's1L2a3S4h')
      .replace(/=/g, 'e1Q2u3A4l');

    await this.userRepository.update(id, {
      resetPasswordCode: resetPasswordCode,
    });

    const referenceCode = `?mode=resetPassword&userid=${user.id}&referenceKey=${encryptedCode}`;

    // send notification reset user password to user's email
  
    return true;
  }

  async veriflyResetPassword(
    id: string,
    getReferenceKey: string,
  ): Promise<boolean> {
    const referenceKey = getReferenceKey
      .replace(/p1L2u3S/g, '+')
      .replace(/s1L2a3S4h/g, '/')
      .replace(/e1Q2u3A4l/g, '=');
    try {
      const findUser = await this.findOneById(id);

      const secretKey = this.configService.get('resetPasswordKey');
      const bytes = CryptoJS.AES.decrypt(referenceKey, secretKey);
      const decryptedreferenceKey = await bytes.toString(CryptoJS.enc.Utf8);
      if (findUser.resetPasswordCode == decryptedreferenceKey) {
        return true;
      } else return false;
    } catch (e) {
      throw new ApolloError(e.message);
    }
  }

  async resetpassword(
    id: string,
    referenceKey: string,
    newPassword: string,
  ): Promise<boolean> {
    const checkReferenceKey = await this.veriflyResetPassword(id, referenceKey);
    if (checkReferenceKey) {
      const decryptedPassword = this.decryptStringWithRsaPrivateKey(
        newPassword,
        this.privateKeyDir,
      );
      try {
        // update user password on google firebase
        const result = await this.firebaseAdmin.auth().updateUser(id, {
          password: decryptedPassword,
        });

        // update user on database and set liginAttemp and lifeTime to 0, null
        const updateUser = await this.userRepository.update(id, {
          loginAttempt: 0,
          attemptLifeTime: null,
          resetPasswordCode: null,
        });
        return true;
      } catch (e) {
        throw new ApolloError(e.message);
      }
    } else {
      throw new ApolloError('ลิงก์กำหนดรหัสผ่านใหม่นี้หมดอายุแล้ว');
    }
  }

  async signinCheck(email: string) {
    try {
      const findExistingUser = await this.findByEmail(email);
      if (!findExistingUser) {
        throw new ApolloError('ไม่พบผู้ใช้นี้ในระบบ');
      }
      let error: string = null;
      if (
        findExistingUser.loginAttempt >= 3 &&
        dayjs(findExistingUser.attemptLifeTime).isAfter(dayjs().toDate())
      ) {
        error =
          'บัญชีของคุณถูกล็อกชั่วคราวเป็นเวลา 10 นาที เนื่องจากคุณพยายามเข้่าสู่ระบบเกินจำนวนครั้งที่กำหนด โปรดลองใหม่อีกครั้งภายหลัง';
      }
      if (
        findExistingUser.loginAttempt != 0 &&
        dayjs(findExistingUser.attemptLifeTime).isBefore(dayjs().toDate())
      ) {
        await this.resetSigninAttempt(email);
      }
      return error;
    } catch (e) {
      console.log(e);
      throw new ApolloError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  }

  async addSigninAttempt(email: string) {
    const findExistingUser = await this.findByEmail(email);
    let error: string;
    try {
      await this.userRepository.update(findExistingUser.id, {
        loginAttempt: findExistingUser.loginAttempt + 1,
        attemptLifeTime: dayjs().add(10, 'minute').toDate(),
      });
      if (3 - (Number(findExistingUser.loginAttempt) + 1) <= 0) {
        error =
          'บัญชีของคุณถูกล็อกชั่วคราวเป็นเวลา 10 นาที เนื่องจากคุณพยายามเข้่าสู่ระบบเกินจำนวนครั้งที่กำหนด โปรดลองใหม่อีกครั้งภายหลัง';
      } else {
        error = `อีเมลหรือรหัสผ่านไม่ถูกต้อง คุณสามารถลองเข้าสู่ระบบได้อีก ${
          3 - (Number(findExistingUser.loginAttempt) + 1)
        } ครั้ง`;
      }
      return error;
    } catch (e) {
      console.log(e);
      throw new ApolloError(e.message);
    }
  }

  async resetSigninAttempt(email: string) {
    const findExistingUser = await this.findByEmail(email);
    try {
      await this.userRepository.update(findExistingUser.id, {
        loginAttempt: 0,
        attemptLifeTime: null,
        lastLogin: dayjs().toDate(),
      });
      console.warn(findExistingUser.lastLogin, `${new Date()}`);
      return true;
    } catch (e) {
      console.log(e);
      throw new ApolloError(e.message);
    }
  }

  async deleteFirebaseAccount(id: string): Promise<boolean> {
   const firebaseResult = await this.firebaseAdmin
        .auth()
        .deleteUser(id);
    return true
  }
  async registerWithEmail({
    firstName,
    lastName,
    email,
    // mobileOtp,
    password,
    userType,
  }: SignUpInput) {
    try {
      const existingEmailUser = await this.userRepository.findOne({ email });
      if (existingEmailUser) throw Error('อีเมลนี้อยู่ในระบบอยู่แล้ว หรือมีผู้ใช้งานอื่นได้ลงทะเบียนด้วยข้อมูลเดียวกันแล้ว โปรดระบุบอีเมลอื่นเพื่อทำการสมัครชมาชิก');
      // const isOtpValid = await this.verifyOtp(mobileNo, mobileOtp);
      // if (!isOtpValid) throw Error('OTP is not valid or has expired');
      const firebaseResult = await this.firebaseAdmin
        .auth()
        .createUser({ email, password });

      const user = await this.userRepository.save({
        id: firebaseResult.uid,
        firstName,
        lastName,
        email,
        status: UserStatus.ACTIVE,
        userType,
      });

  

      // TODO send mail referal discount code

      return user;
    } catch (e) {
      console.log(e);
      throw new ApolloError(e.message);
    }
  }

  
  async registerWithSocial({
    id,
    firstName,
    lastName,
    email,
    mobileNo,
    // mobileOtp,
    lineId,
    avatarUrl,
    news,
    consent,
    opinionConsent,
    serviceConsent,
    pdpaConsent,
    tecConsent,
    userType,
    referrerCode,
    sellerSharingConsent,
    installerSharingConsent,
    deliverySharingConsent,
  }: SignUpSocialInput) {
    try {
      const existingEmailUser = await this.userRepository.findOne({ email });
      if (existingEmailUser) throw Error('อีเมลนี้อยู่ในระบบอยู่แล้ว หรือมีผู้ใช้งานอื่นได้ลงทะเบียนด้วยข้อมูลเดียวกันแล้ว โปรดระบุบอีเมลอื่นเพื่อทำการสมัครชมาชิก');
      const existingUser = await this.findByMobileNo(mobileNo);
      if (existingUser) throw Error('เบอร์โทรศัพท์นี้อยู่ในระบบอยู่แล้ว หรือมีผู้ใช้งานอื่นได้ลงทะเบียนด้วยข้อมูลเดียวกันแล้ว โปรดระบุบเบอร์โทรศัพท์อื่นเพื่อทำการสมัครชมาชิก');
      // const isOtpValid = await this.verifyOtp(mobileNo, mobileOtp);
      // if (!isOtpValid) throw Error('OTP is not valid or has expired');
      let newsDate = null;
      let opinionConsentDate = null;
      if (news) {
        newsDate = dayjs().toDate();
      }
      if (opinionConsent) {
        opinionConsentDate = dayjs().toDate();
      }

      //save consent
      const allConsent = {
        consent: consent,
        pdpaConsent: pdpaConsent,
        tecConsent: tecConsent,
        serviceConsent: serviceConsent,
        sellerSharingConsent: sellerSharingConsent,
        installerSharingConsent: installerSharingConsent,
        deliverySharingConsent: deliverySharingConsent,
        news: news,
        opinionConsent: opinionConsent,
      };

      const user = await this.userRepository.save({
        id,
        firstName,
        lastName,
        email,
        mobileNo: this.formatMobileNo(mobileNo),
        avatarUrl: avatarUrl == ''? null :avatarUrl,
        status: UserStatus.ACTIVE,
        userType,
      });

    
      return user;
    } catch (e) {
      console.log(e);
      throw new ApolloError(e.message);
    }
  }

  async updateUser(id: string, userData: UpdateUserInput): Promise<UserDto> {
    const existUser = await this.userRepository.findOne(id);
    if (!existUser) {
      throw new ApolloError('user does not exist');
    }
    const updateUserData: any = { ...userData };
    delete updateUserData['mobileOtp'];
    await this.userRepository.update(id, { ...updateUserData });
    return this.userRepository.findOne(id).then((o) => this.mapEntityToDto(o));
  }





  async requestSignupOtp(to: string): Promise<string> {
    const existingUser = await this.findByMobileNo(to);
    if (existingUser) throw Error('this mobile number is already registered');
    // if (
    //   process.env.CONFIG_NAME === 'local' ||
    //   process.env.CONFIG_NAME === 'development' ||
    //   process.env.CONFIG_NAME === 'staging'
    // ) {
    //   return 'refcode';
    // }
    // const info = await this.smsService.sendOtp(this.formatMobileNo(to));
    // return info.referenceCode;
    return 'refcode';
  }


  private async verifyOtp(number: string, mobileOtp: string): Promise<boolean> {
    const mobileNumber = this.formatMobileNo(number);
    const isOtpValid =
      // process.env.CONFIG_NAME === 'local' ||
      // process.env.CONFIG_NAME === 'development' ||
      // process.env.CONFIG_NAME === 'staging'
      //   ? mobileOtp === '111111'
      //   :
      true
    return isOtpValid;
  }

  genReferralCode() {
    const prefixNanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 4);
    const nanoid = customAlphabet('1234567890', 6);
    return `${prefixNanoid()}${nanoid()}`;
  }

  private formatMobileNo(mobile: string): string {
    return mobile.split('-').join('');
  }



  async createLineAuthCustomToken(
    userId: string,
    customTokenKey: string,
  ): Promise<string> {
    if (customTokenKey != this.lineCustomTokenKey) {
      throw new Error('Line key mismatched');
    }
    const customToken = await this.firebaseAdmin
      .auth()
      .createCustomToken(userId);
    return customToken;
  }

  async getLineIdToken(
    code: string,
    redirectPage: string,
  ): Promise<string | { [key: string]: any }> {
    const lineTokenEndpoint = this.tokenEndpointUri;
    const requestBody = {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: `${this.baseUrl}${redirectPage}`,
      client_id: this.lineAuthClientId,
      client_secret: this.lineAuthclientSecret,
    };
    try {
      const response = await axios.post(
        lineTokenEndpoint,
        new URLSearchParams(requestBody).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', // Set the Content-Type header
          },
        },
      );
      // Check if the response contains an id_token
      if (response?.data && response?.data.id_token) {
        const verifyTokenUri = this.verifyAccessTokenUri.replace(
          ':accessTokenId',
          response.data.access_token,
        );
        const verifyAccessToken = await axios.get(verifyTokenUri);
        if (this.lineAuthClientId !== verifyAccessToken.data['client_id']) {
          throw new Error('Line client ID mismatched');
        }

        const idToken = response.data.id_token;
        const decodedToken = jwt.decode(idToken);
        return decodedToken;
      } else {
        throw new Error('No id_token found in the response');
      }
    } catch (error) {
      // Handle any errors
      throw new Error(`Error obtaining LINE id_token: ${error.message}`);
    }
  }



  async existingUserByLineId(lineId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { lineId: lineId },
    });
    if (!user) return false;
    return true;
  }

  // async userProfileByLineId(lineId: string): Promise<any> {
  //   const user = await this.userRepository.findOne({
  //     where: { lineId: lineId },
  //   });
  //   if (!user) return 'LINE_AUTHENTICATE_FAILED';
  //   const name = `${user.firstName} ${user.lastName ?? ''}`;
  //   const wallet = await this.walletService.findByUserId(user.id);
  //   const walletBalance = await this.walletService.getBalanceByWallet(
  //     wallet?.[0]?.id,
  //   );
  //   //  for phase 2 line_social_commerce : point_expired and date_poin_expired
  //   const pointExpired: WalletPointExpiredSummary[] = await this.walletService.getMonthExpiredByWallet(
  //     wallet?.[0]?.id,
  //   );
  //   return {
  //     avatarUrl: user.avatarUrl,
  //     name: name,
  //     mobileNo: user.mobileNo,
  //     email: user.email,
  //     point: walletBalance?.[0]?.amount ?? 0,

  //     pointExpired: pointExpired?.[0]?.pointExpiredTotal ?? 0,
  //     datePointExpired:
  //       pointExpired?.[0]?.pointExpiredTotal != 0
  //         ? pointExpired?.[0]?.monthPointExpired
  //         : null,
  //   };
  // }
  async findAllUserWithLine(args?: {
    limit?: number;
    offset?: number;
  }): Promise<[UserDto[], number]> {
    return await this.userRepository
      .findAndCount({
        where: [
          { lineId: Not(IsNull()) && Not(''), status: UserStatus.ACTIVE },
        ],
        skip: args?.offset ?? 0,
        take: args?.limit ?? 0,
      })
      .then(([arr, count]) => {
        return [arr.map((o) => this.mapEntityToDto(o)), count];
      });
    }

  private mapEntityToDto(user: User): UserDto {
    return plainToClass(UserDto, user);
  }

  async findOneByUserId(id: string): Promise<UserDto> {
    return this.userRepository.findOne(id).then((o) => this.mapEntityToDto(o));
  }

  // async findAll(args: GetUserArgs): Promise<[UserDto[], number]> {
  //   const where = {};
  //   if (args.firstName && args.firstName != '') {
  //     where['firstName'] = Like(`%${args.firstName}%`);
  //   }
  //   if (args.lastName && args.lastName != '') {
  //     where['lastName'] = Like(`%${args.lastName}%`);
  //   }
  //   if (args.email && args.email != '') {
  //     where['email'] = Like(`%${args.email}%`);
  //   }
  //   if (args.status) {
  //     where['status'] = args.status;
  //   }
  //   if (args.userType) {
  //     where['userType'] = args.userType;
  //   }
  //   if (args.lastLoginfromDate && args.lastLogintoDate) {
  //     where['lastLogin'] = Between(
  //       args.lastLoginfromDate,
  //       args.lastLogintoDate,
  //     );
  //   }
  //   if (args.createdAtfromDate && args.createdAttoDate) {
  //     where['createdAt'] = Between(
  //       args.createdAtfromDate,
  //       args.createdAttoDate,
  //     );
  //   }
  //   return this.userRepository
  //     .findAndCount({
  //       where: where,
  //       skip: args.offset ?? 0,
  //       take: args.limit ?? 0,
  //       order: {
  //         lastLogin: 'DESC',
  //       },
  //     })
  //     .then(([arr, count]) => {
  //       return [arr.map((o) => this.mapEntityToDto(o)), count];
  //     });
  // }

  async loadPublicKey(): Promise<string> {
    const loadFile = path.resolve(this.publicKeyDir);
    const pubKey = await fs.readFileSync(loadFile, 'utf-8');
    return pubKey;
  }

  private decryptStringWithRsaPrivateKey(
    toDecrypt: string,
    relativeOrAbsolutePathtoPrivateKey: string,
  ): string {
    const absolutePath = path.resolve(relativeOrAbsolutePathtoPrivateKey);
    const privateKey = fs.readFileSync(absolutePath, 'utf8');
    const buffer = Buffer.from(toDecrypt, 'hex');
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey.toString(),
        passphrase: this.passPhaseEncryption,
      },
      new Uint8Array(buffer),
    );
    return decrypted.toString('utf8');
  }
}
