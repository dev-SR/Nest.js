import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { UsersService } from 'src/users/users.service';
// import { AuthService } from './auth.service';
// import {  Logger } from '@nestjs/common';

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService, // private readonly authService: AuthService,
  ) {
    // 1. Validate Token
    super({
      jwtFromRequest: (req) => {
        if (!req || !req.cookies) return null;
        return req.cookies['accessToken'];
      },
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }
  // private readonly logger = new Logger(AuthStrategy.name);

  // 2. Return Validated User
  async validate(payload: any): Promise<any> {
    // this.logger.log(payload);
    return payload;
  }
  // 3. payload now can be access by req.user
}
