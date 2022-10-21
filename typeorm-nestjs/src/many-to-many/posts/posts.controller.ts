import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import CreatePostDto from './dto/createPost.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postService: PostsService) {}

  @Get()
  getAllPosts() {
    return this.postService.getAllPosts();
  }

  @Get(':id')
  getPostById(@Param() { id }: { id: string }) {
    return this.postService.getPostById(Number(id));
  }

  @Post()
  async createPost(
    @Body() post: CreatePostDto,
    @Query('user_id', ParseIntPipe) user_id: number,
  ) {
    return this.postService.createPost(post, user_id);
  }

  @Patch(':id')
  async updatePost(@Param() { id }: { id: string }, @Body() post: any) {
    return this.postService.updatePost(Number(id), post);
  }

  @Delete(':id')
  async deletePost(@Param() { id }: { id: string }) {
    return this.postService.deletePost(Number(id));
  }
}
