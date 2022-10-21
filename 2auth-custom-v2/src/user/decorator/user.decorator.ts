import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserInfo {
	id: string;
	email: string;
	iat: string;
	exp: string;
}

export const User = createParamDecorator((data: string, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest();
	return request.user;
});
