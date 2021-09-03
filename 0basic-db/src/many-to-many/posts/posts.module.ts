import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/one-to-many/models/users.entity';
import { CategoriesModule } from '../categories/categories.module';
import Post from './post.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [CategoriesModule, TypeOrmModule.forFeature([Post, User])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
