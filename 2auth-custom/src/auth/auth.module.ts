import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CommonModule } from 'src/common/common.module';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: 'abcbcjdskss',
      signOptions: { expiresIn: '15d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthModule],
})
export class AuthModule {}
