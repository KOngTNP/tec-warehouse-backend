import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { Role } from '../auth/auth.dto';
import {
  FIREBASE_ADMIN_INJECT,
  FirebaseAdminSDK,
} from '../firebase-admin/firebase-admin.module';
import { UserAdminDto } from './dto/user-admin.dto';
import { UserAdmin } from './models/user-admin.entity';

@Injectable()
export class UserAdminService {
  constructor(
    @Inject(FIREBASE_ADMIN_INJECT) private firebaseAdmin: FirebaseAdminSDK,
    @InjectRepository(UserAdmin)
    private userAdminRepository: Repository<UserAdmin>,
  ) {}

  async getAdminPortalUsers({
    limit,
    offset,
  }: {
    limit?: number;
    offset?: number;
  }): Promise<[UserAdminDto[], number]> {
    const queryBuilder = this.userAdminRepository.createQueryBuilder(
      'userAdmin',
    );
    if (offset != null) queryBuilder.offset(offset);
    if (limit != null) queryBuilder.limit(limit);
    return queryBuilder.getManyAndCount().then(([arr, count]) => {
      return [arr.map((o) => this.mapEntityToDto(o)), count];
    });
  }

  async createAdmin(userId: string, role: string): Promise<boolean> {
    const old = await this.userAdminRepository.findOne({ userId: userId });
    if (old) {
      return await this.updateRoleAdmin(userId, role);
    }
    const result = await this.userAdminRepository.save({
      userId: userId,
      role: role,
    });
    return result.id ? true : false;
  }

  async deleteAdmin(userId: string): Promise<boolean> {
    const old = await this.userAdminRepository.findOne({ userId: userId });
    if (old) {
      const result = await this.userAdminRepository.delete({
        userId: old.userId,
      });
      return result.affected > 0;
    }
    return false;
  }

  async updateRoleAdmin(userId: string, role: string): Promise<boolean> {
    const old = await this.userAdminRepository.findOne({ userId: userId });
    if (old) {
      const result = await this.userAdminRepository.update(
        { userId: old.userId },
        { role: role },
      );
      return result.affected > 0;
    }
    return false;
  }

  // async createAdminUserFromFirebase() {
  //   const listAllUsers = async (nextPageToken?: string) => {
  //     // List batch of users, 1000 at a time.
  //     this.firebaseAdmin.auth().listUsers(1000, nextPageToken)
  //       .then(function (listUsersResult) {
  //         listUsersResult.users.forEach(function (userRecord) {
  //           if (userRecord.customClaims?.['role'] === Role.admin) {
  //             this.userAdminRepository.save({
  //               userId: userRecord.uid,
  //               role: userRecord.customClaims['role']
  //             })
  //           }
  //         });
  //         if (listUsersResult.pageToken) {
  //           // List next batch of users.
  //           listAllUsers(listUsersResult.pageToken)
  //         }
  //       })
  //       .catch(function (error) {
  //         console.log("Error listing users:", error);
  //       });
  //   };
  //   // Start listing users from the beginning, 1000 at a time.
  //   listAllUsers();
  // }

  private mapEntityToDto(userAdmin: UserAdmin): UserAdminDto {
    return plainToClass(UserAdminDto, userAdmin);
  }
}
