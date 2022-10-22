import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { SignInDto, SignUpDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import appConfig from 'src/config/app.config';
import { AuthGuard } from './guard/auth.guard';
import { Role } from '@prisma/client';
import { Roles } from './decorator/roles.decorator';
import { User } from './dto/user-info.decorator';
import { GetUserInfo } from 'src/common/types/getUserInfo';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  signup(@Body() body: SignUpDto) {
    // console.log(body);
    return this.authService.signup(body);
  }

  @Post('/signin')
  async signin(
    @Body() body: SignInDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    /*
    !!{ passthrough: true } response will be sent manually
		*/
  ) {
    // console.log(body);
    const tokens = await this.authService.signin(body);
    console.log(tokens);
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true, //accessible only by the web server
      secure: appConfig().environment == 'production', //true: only transmit cookie over https
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
    res.json({ access_token: tokens.access_token });
  }

  @Get('/refresh_token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!req.cookies || !req.cookies.refresh_token) {
      return new UnauthorizedException('Please login first');
    }
    const refresh_token = req.cookies.refresh_token;
    const new_access_token = await this.authService.refreshToken(refresh_token);
    res.json({ access_token: new_access_token });
  }

  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(AuthGuard)
  @Get('/protected-test-all')
  protectedUserOrAdmin(@Req() req: Request, @User() user: GetUserInfo) {
    // console.log(user);
    return {
      message: 'Only verified User and Admin can access this route',
    };
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Get('/protected-test-admin')
  protectedOnlyAdmin(@Req() req: Request) {
    // console.log(req.cookies);
    return {
      message: 'Only verified Admin can access this route',
    };
  }

  @Post('/signout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(
      'refresh_token',
      //  {
      //   httpOnly: true, //accessible only by the web server
      //   secure: appConfig().environment == 'production', //true: only transmit cookie over https
      //   sameSite: 'none',
      // }
    );
    return {
      message: 'Logout successfully',
    };
  }
}
