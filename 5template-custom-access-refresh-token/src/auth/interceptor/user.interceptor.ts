import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { GetUserInfo } from 'src/common/types/getUserInfo';

export class UserInterceptorFromAccessToken implements NestInterceptor {
  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request = context.switchToHttp().getRequest();
    // for tokens sent as cookies
    // const cookies = request.cookies;
    // console.log(cookies);
    // // for token sent as bearer token
    const token = request?.headers?.authorization;
    const access_token = token?.split(' ')[1];

    const user = (await jwt.decode(access_token)) as GetUserInfo;
    // console.log(user);
    request.user = user;

    return handler.handle();
  }
}
