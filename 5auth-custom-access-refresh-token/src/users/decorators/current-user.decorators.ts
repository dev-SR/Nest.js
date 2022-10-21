import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: never, cxt: ExecutionContext) => {
    const req = cxt.switchToHttp().getRequest();
    console.log(req.currentUser);
    return req.currentUser;
  },
);
