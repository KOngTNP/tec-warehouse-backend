import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAdmin } from './models/user-admin.entity';
import { UserAdminController } from './user-admin.controller';
import { UserAdminResolver } from './user-admin.resolver';
import { UserAdminService } from './user-admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserAdmin])],
  controllers: [UserAdminController],
  providers: [UserAdminService, UserAdminResolver],
  exports: [UserAdminService],
})
export class UserAdminModule {}
