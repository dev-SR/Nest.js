import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './users.entity';

@Injectable()
export class UsersService {
  // repo: Repository<Users>
  // constructor( repo: Repository<Users> ) {
  // 	this.repo = repo;
  // }
  constructor(@InjectRepository(Users) private repo: Repository<Users>) {}
  createUser(email: string, password: string) {
    const user = this.repo.create({ email, password });
    return this.repo.save(user);
  }
  findAll() {
    return this.repo.find({});
  }
  find(email: string) {
    return this.repo.find({ email });
  }
  findByUserId(id: string) {
    return this.repo.findOne(id);
  }
}
