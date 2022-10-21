import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import CategoriesService from '../categories/categories.service';
import { Repository } from 'typeorm';
import Post from './post.entity';
import { User } from 'src/one-to-many/models/users.entity';
import CreatePostDto from './dto/createPost.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly categoriesService: CategoriesService,
  ) {}

  getAllPosts() {
    return this.postRepository.find({ relations: ['author', 'categories'] });
  }

  getPostById(id: number) {
    const post = this.postRepository.findOne(id, {
      relations: ['author', 'categories'],
    });
    if (post) {
      return post;
    }

    throw new NotFoundException();
  }

  async updatePost(id: number, post: Post) {
    await this.postRepository.update(id, post);
    const updatedPost = await this.postRepository.findOne(id, {
      relations: ['author', 'categories'],
    });
    if (updatedPost) {
      return updatedPost;
    }

    throw new NotFoundException();
  }

  async createPost(post: CreatePostDto, user_id: number) {
    const user = await this.userRepository.findOne({ id: user_id });

    console.log(user);

    const newPost = new Post();
    newPost.title = post.title;
    newPost.content = post.content;
    newPost.author = user;

    // !Save many to many Relation: Create Post With Category
    if (post.categories) {
      const categories = await this.categoriesService.getCategoriesByIds(
        post.categories,
      );
      newPost.categories = categories;
    }

    await this.postRepository.save(newPost);
    return newPost;
  }

  async deletePost(id: number) {
    const deleteResponse = await this.postRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new NotFoundException();
    }
    return { message: 'Deleted' };
  }
}
