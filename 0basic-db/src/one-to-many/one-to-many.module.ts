import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Photo } from './models/photo.entity';
import { User } from './models/users.entity';
import { OneToManyController } from './one-to-many.controller';
import { OneToManyService } from './one-to-many.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Photo])],
  controllers: [OneToManyController],
  providers: [OneToManyService],
})
export class OneToManyModule {}
