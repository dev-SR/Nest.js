import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import appConfig from 'src/config/app.config';
import { Role } from '@prisma/client';
import { AccessTokenPayload } from 'src/common/types/jwt-payload';
import { AuthService } from '../auth.service';

@Injectable() //must to inject Reflector
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext) {
    //* 1. Determine the Roles that are allowed to access the route.
    //   - get metadata from execution context
    /*
			@Roles(Role.USER, Role.ADMIN)
			@UseGuards(UserAuthGuard)
			@Get('/protected-test')
			protectedTest(@Req() req: Request) {
				console.log(req.cookies);
				return 'Protected Test';
			}
		*/
    const allowedRolesInRouted = this.reflector.getAllAndOverride<Role[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );
    // console.log(allowedRolesInRouted); //[ 'USER', 'ADMIN' ]

    //* 2. Get access_token from request header
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined =
      request.headers.authorization || request.headers.Authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return false;
    }

    //* 3. Verify access_token
    const access_token = authHeader.split(' ')[1];
    const decodedUser = await this.authService.verifyAccessToken(access_token);

    //* 4. Check if the user has the required role
    if (allowedRolesInRouted.includes(decodedUser.userInfo.role)) {
      return true;
    }
    return false;
  }
}
