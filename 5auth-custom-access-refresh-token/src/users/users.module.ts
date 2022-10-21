import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './users.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthService } from './auth.service';
import { Session } from './dto/session.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, Session]),
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '30d' },
    }),
  ],
  providers: [UsersService, AuthService],
  controllers: [UsersController],
})
export class UsersModule {}
