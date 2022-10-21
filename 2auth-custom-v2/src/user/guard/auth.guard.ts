import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfo } from '../decorator/user.decorator';
@Injectable() //must to inject Reflector
export class AuthGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly prismaService: PrismaService
	) {}
	async canActivate(context: ExecutionContext) {
		// 1. Determine the UserTypes that are allowed to access the route.
		// 		- get metadata from execution context
		const roles = this.reflector.getAllAndOverride<UserType[]>('roles', [
			context.getHandler(),
			context.getClass()
		]);
		// console.log(roles);

		if (roles?.length) {
			// 2. Grab JWT from the request header and verify it.

			const request = context.switchToHttp().getRequest();
			const token = request.cookies.cookieToken;
			try {
				const payload = (await jwt.verify(token, process.env.JWT_TOKEN)) as jwt.JwtPayload;
				// 3. Database lookup to get by the JWT's userId.
				const user = await this.prismaService.user.findUnique({
					where: {
						id: payload.id
					}
				});

				if (!user) return false;
				// 4. Determine if the user is allowed to access the route.
				if (roles.includes(user.user_type)) return true;

				return false;
			} catch (error) {
				// console.log(error);
				return false;
			}
		}

		return true;
	}
}
