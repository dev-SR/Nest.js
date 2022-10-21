# Prisma in Nest.js

- [Prisma in Nest.js](#prisma-in-nestjs)
  - [Installation](#installation)
  - [Setup Prisma CLient](#setup-prisma-client)
    - [Using Prisma Client](#using-prisma-client)

## Installation

- [https://docs.nestjs.com/recipes/prisma](https://docs.nestjs.com/recipes/prisma)


```bash
yarn add -D prisma
yarn add @prisma/client
npx prisma init
npx prisma db push
```

Database URL example:

```bash
DATABASE_URL="postgresql://postgres:pass@localhost:5432/newdb"
```

## Setup Prisma CLient

Create New Service for Prisma Client

```bash
nest g module prisma
nest g service prisma
```

Export Prisma Service so that we can import it in our Nest.js app.

`prisma/prisma.service.ts`:

```typescript
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect;
  }
  async onModuleDestroy() {
    await this.$disconnect;
  }
}
```

`prisma/prisma.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### Using Prisma Client

```bash
nest g module user
nest g controller auth user
nest g service auth user
npx prisma generate
```

Import Prisma Client in Module

`user/user.service.ts`:

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class UserModule {}
```

Use Prisma Service from another service

`user/auth/auth.service.ts`:

```typescript
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

```

> Note: Restart TS server to see the changes if Types from "@prisma/client" are not visible.
> "npx prisma generate" generates the types.

Controller to check if Prisma is working

`user/auth/auth.controller.ts`:

```typescript
import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Get('/users')
  getUsers() {
    return this.authService.getUsers();
  }
}
```

GET: [http://localhost:3000/auth/users](#)


