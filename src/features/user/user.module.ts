import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user.entity';
import { AuthService } from '../auth/auth.service';
import { UserController } from './user.controller';
import { UserLoader } from './user.loader';
import { AdminModule } from '../admin/admin.module';
import { UserResolver } from './user.resolver';

@Module({
    imports: [
      TypeOrmModule.forFeature([User]),
      AdminModule,
    ],
    controllers: [UserController],
    providers: [UserService, UserResolver, UserLoader],
    exports: [UserService],
  })
  export class UserModule {}
  
