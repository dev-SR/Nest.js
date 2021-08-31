import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}
  async canActivate(cxt: ExecutionContext) {
    const req = cxt.switchToHttp().getRequest();
    const res = cxt.switchToHttp().getResponse();
    const user = await this.authService.getUserFromCookies(req, res);
    if (user) {
      req.currentUser = user;
      return true;
    }
    return false;
  }
}
