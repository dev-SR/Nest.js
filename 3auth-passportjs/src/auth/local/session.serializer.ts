import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(user: any, done: (err: Error, user: any) => void): any {
    console.log('serializeUser', user);
    done(null, { id: user.id });
    // or done(null, user);
  }
  deserializeUser(
    payload: any,
    done: (err: Error, payload: string) => void,
  ): any {
    console.log('deserializeUser', payload);

    done(null, payload);
    // or done(null, { id: payload });
  }
}
