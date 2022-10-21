import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './chat.entity';
import { UserTest } from './user.entity';

@Module({ imports: [TypeOrmModule.forFeature([UserTest, Chat])] })
export class FancyTablesModule {}
