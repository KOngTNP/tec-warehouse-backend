import { AdminResolver } from './admin.resolver';
import { AdminService } from './admin.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/models/user.entity';
import { ConfigModule } from '@nestjs/config';
import { UserAdminModule } from '../user-admin/user-admin.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigModule, UserAdminModule],
  providers: [AdminService, AdminResolver],
  // controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
