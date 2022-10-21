import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { LocalAuthService } from './local/local.auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategyService } from './local/local.strategy.service';
import { SessionSerializer } from './local/session.serializer';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

// @Module({
//   imports: [UsersModule, PassportModule.register({ session: true })],
//   providers: [LocalAuthService, LocalStrategyService, SessionSerializer],
// })
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [LocalAuthService, LocalStrategyService, JwtStrategy],
  exports: [LocalAuthService],
})
export class AuthModule {}
