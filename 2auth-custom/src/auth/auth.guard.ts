import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const cookie = request.cookies['accessToken'];

    try {
      return this.jwtService.verify(cookie);
      //ERROR [ExceptionsHandler] jwt must be provided
    } catch (e) {
      return false;
    }
  }
}
