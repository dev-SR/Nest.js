import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Logger,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetCurrentUser } from 'src/utils/decorator/get-current-user';

import { Users } from './models/users.entity';
import { UsersService } from './users.service';

@UseInterceptors(ClassSerializerInterceptor) //
@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private userService: UsersService) {}
  private readonly logger = new Logger(UsersController.name);

  @Get('/current')
  async Test(@GetCurrentUser() user: any): Promise<Users> {
    this.logger.log('Current User:', user);

    return await this.userService.findOne({ email: user.email });
  }
  @Get('/all')
  async all(): Promise<Users[]> {
    return await this.userService.all();
  }
}
