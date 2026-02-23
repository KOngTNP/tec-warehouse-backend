import { Controller, Get } from '@nestjs/common';
import { UserAdminService } from './user-admin.service';

@Controller('user-admin')
export class UserAdminController {
  constructor(private userAdminService: UserAdminService) {}

  // @Get('test_admin_users')
  // async testListUsers() {
  //   this.userAdminService.createAdminUserFromFirebase()
  // }
}
