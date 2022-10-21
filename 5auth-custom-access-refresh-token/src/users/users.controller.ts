import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  Session,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Serialize } from 'src/interceptors/serialize.interceptors';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorators';
import { CreateUser } from './dto/create-user.dto';
import { UserDto } from './dto/users.dto';
import { AuthGuard } from './guard/auth.guard';
import { UsersService } from './users.service';

@Controller('auth')
// @UseInterceptors(CurrentUserInterceptor)
export class UsersController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  @Post('/signup')
  @Serialize(UserDto)
  createUser(@Body() body: CreateUser) {
    return this.authService.signup(body.email, body.password);
  }

  @Post('/signin')
  @Serialize(UserDto)
  async signinUser(
    @Body() body: CreateUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    /*
    !!{ passthrough: true } response will be sent manually within the route
    !! handler through return keyword not by res.send()
    */
  ) {
    const authorizedUser = await this.authService.signin(
      body.email,
      body.password,
    );

    // Create Session
    const sessionToken = await this.authService.createSession(
      req,
      String(authorizedUser.id),
    );

    // Set Cookie
    const { accessToken, refreshToken } = await this.authService.createTokens(
      sessionToken,
      String(authorizedUser.id),
    );

    // Get date, 30 days in the future
    const ExpiryDate: Date = new Date();
    ExpiryDate.setDate(ExpiryDate.getDate() + 30);

    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        expires: ExpiryDate,
      })
      .cookie('accessToken', accessToken, { httpOnly: true });

    return authorizedUser;
  }

  @Get('/protected')
  @Serialize(UserDto)
  @UseGuards(AuthGuard)
  async authenticatedUser(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: any,
  ) {
    // const user = await this.authService.getUserFromCookies(req, res);
    // if (!user) {
    // throw new BadRequestException('unauthorized');
    // }

    return user;
  }
  @Post('/logout')
  @UseGuards(AuthGuard)
  async logout(
    @Body() body: { email: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(body.email, req, res);
  }
}
