import { Module } from '@nestjs/common';
// import { CommonModule } from 'src/common/common.module';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthStrategy } from './auth.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `10d`,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthStrategy],
  // exports: [AuthModule],
  exports: [AuthService],
})
export class AuthModule {}
