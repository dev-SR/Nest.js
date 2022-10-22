import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { SignUpParams } from '../common/types/param';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findOne(email: string): Promise<User | undefined> {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }
  async createNewUser(user: SignUpParams): Promise<User | undefined> {
    return this.prismaService.user.create({
      data: user,
    });
  }
  async findUserById(id: string): Promise<User | undefined> {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }
}
