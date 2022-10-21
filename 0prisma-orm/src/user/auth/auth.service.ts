import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async getUsers() {
    const users: User[] = await this.prismaService.user.findMany();
    this.logger.log({ users });
    return users;
  }
}
