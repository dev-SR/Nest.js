import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Logger,
  NotFoundException,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { LoginDto } from 'src/users/dto/login.dto';
import { RegisterDto } from 'src/users/dto/register.dto';
import { AuthService } from './auth.service';

import { AuthGuard } from '@nestjs/passport';

@Controller()
/*
! intercept password field as defined in User Entity
import { Exclude } from 'class-transformer';
@Entity()
export class Users {
  @Exclude()
  password: string;
}
  */
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  private readonly logger = new Logger(AuthController.name);

  @Post('register')
  async register(@Body() body: RegisterDto) {
    this.logger.log('register', body);

    const hashed = await this.authService.encryptPassword(body.password);

    return this.authService.createUser({ email: body.email, password: hashed });
  }

  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.logger.log('login', body);

    const user = await this.authService.findUser({ email: body.email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (
      !(await this.authService.decryptPassword(body.password, user.password))
    ) {
      throw new BadRequestException('Invalid credentials');
    }
    const token = await this.authService.getToken(user.email, user.id);

    response.cookie('accessToken', token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });
    return user;
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
    return {
      message: 'Logout successful!',
    };
  }
}
