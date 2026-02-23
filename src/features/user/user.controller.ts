import {
    Controller,
    Get,
    UseGuards,
    Response,
    Query,
    Headers,
    Header,
    BadRequestException,
    UnauthorizedException,
    Post,
    Body,
  } from '@nestjs/common';
  import { RolesGuard } from '../auth/guards/role.guard';
  import { Role } from '../auth/auth.dto';
  import { RESTAPIRolesGuard } from '../auth/guards/restapi-auth.guard';
  import { UserService } from './user.service';
  
  @Controller('user')
  export class UserController {
    constructor(
      private userService: UserService,
    ) {}
  
  }
  