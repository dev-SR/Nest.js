import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { Users } from './models/users.entity';
import { UsersService } from './users.service';

@UseInterceptors(ClassSerializerInterceptor) //
@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private userService: UsersService) {}
  @Get('/')
  async all(): Promise<Users[]> {
    return await this.userService.all();
  }
}
