import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    /*
      try {
            if (request.session.passport.user) {
                return true;
            }
        } catch (e) {
            throw new UnauthorizedException();
        }

      or simply:
    */
    return request.isAuthenticated();
  }
}
