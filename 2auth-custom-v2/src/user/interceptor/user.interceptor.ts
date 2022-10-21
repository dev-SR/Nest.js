import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export class UserInterceptor implements NestInterceptor {
	async intercept(context: ExecutionContext, handler: CallHandler) {
		const request = context.switchToHttp().getRequest();
		// for tokens sent as cookies
		const cookies = request.cookies; //https://docs.nestjs.com/techniques/cookies#use-with-express-default
		console.log(cookies);
		// // for token sent as bearer token
		// const token = request?.headers?.authorization;
		// console.log(token);

		const user = await jwt.decode(cookies.cookieToken);
		// console.log(user);
		request.user = user;

		return handler.handle();
	}
}
