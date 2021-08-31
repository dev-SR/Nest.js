import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async createUser(user) {
    return this.userService.create(user);
  }

  async findUser(condition) {
    return await this.userService.findOne(condition);
  }

  async encryptPassword(pass: string) {
    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(pass, salt);
    return hashed;
  }

  async decryptPassword(pass: string, hashed: string) {
    const isValid = await bcrypt.compare(pass, hashed);
    return isValid;
  }

  async getToken(email, id) {
    return await this.jwtService.signAsync({ email, id });
  }

  async verifyToken(cookie) {
    return await this.jwtService.verifyAsync(cookie);
  }
}
