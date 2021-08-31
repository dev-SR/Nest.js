import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginDto } from 'src/users/models/login.dto';
import { RegisterDto } from 'src/users/models/register.dto';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
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
    const token = await this.authService.getToken(user.email);
    // Get date, 15 days in the future
    const ExpiryDate: Date = new Date();
    ExpiryDate.setDate(ExpiryDate.getDate() + 15);
    response.cookie('accessToken', token, {
      httpOnly: true,
      expires: ExpiryDate,
    });
    return user;
  }

  @Get('auth')
  @UseGuards(AuthGuard)
  async user(@Req() request: Request) {
    const cookie = request.cookies['accessToken'];
    const data = await this.authService.verifyToken(cookie);
    this.logger.log('token', data);
    return await this.authService.findUser({ email: data.email });
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
    return {
      message: 'Logged Out Successfully!',
    };
  }
}
