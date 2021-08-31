import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './models/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private readonly userRepository: Repository<Users>,
  ) {}

  async all(): Promise<Users[]> {
    return await this.userRepository.find();
  }

  async create(data): Promise<Users> {
    return this.userRepository.save(data);
  }

  async findOne(condition): Promise<Users> {
    return this.userRepository.findOne(condition);
  }
}
