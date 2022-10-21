# Custom Auth V2

- [Custom Auth V2](#custom-auth-v2)
	- [Installation](#installation)
	- [🔥Requisites Setups🔥](#requisites-setups)
	- [Authentication - SignUp](#authentication---signup)
		- [Check if the user already exists](#check-if-the-user-already-exists)
		- [Hash the password](#hash-the-password)
		- [Store the user in the database](#store-the-user-in-the-database)
		- [Return auth token](#return-auth-token)
			- [🍪🍪send as `cookie`🍪🍪](#send-as-cookie)
			- [🔥saving cookie/tokens as environment var in Postman🔥](#saving-cookietokens-as-environment-var-in-postman)
			- [🔥(OPTIONAL) how we will accessing request cookies/tokens](#optional-how-we-will-accessing-request-cookiestokens)
	- [Authentication - SignIn | SignOut](#authentication---signin--signout)
		- [`signout` by clearing cookies🍪🍪](#signout-by-clearing-cookies)
	- [Identifying the User](#identifying-the-user)
		- [Creating a User Interceptor](#creating-a-user-interceptor)
	- [💂‍♂️💂‍♂️Authorization - Guard💂‍♂️💂‍♂️](#️️authorization---guard️️)
		- [Prerequisite](#prerequisite)
			- [How Guards Work](#how-guards-work)
			- [How Roles Work](#how-roles-work)
		- [🚀Role-based Authentication Guard](#role-based-authentication-guard)
			- [🌟🌟Global Guards](#global-guards)

## Installation

```bash
yarn add @nestjs/config  @prisma/client class-validator class-transformer  bcryptjs jsonwebtoken cookie-parser
yarn add -D prisma @types/bcryptjs @types/jsonwebtoken @types/cookie-parser
npx prisma init
nest g module prisma
nest g service prisma
nest g module user
nest g controller auth user
nest g service auth user
npx prisma db push
```

`.env`

```bash
DATABASE_URL="postgresql://postgres:postgresx@localhost:5432/prismanest"
NODE_ENV=development
JWT_TOKEN="h9324yu9234u2398b2kj3h49823432sdffsdffs"
```

`.eslintrc.js`

```js
{
  //.....
  rules: {
    // .....
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
  },
}
```

## 🔥Requisites Setups🔥

- [https://docs.nestjs.com/recipes/prisma](https://docs.nestjs.com/recipes/prisma)

`prisma/prisma.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

`prisma/prisma.service.ts`

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

> Note: run 'npx prisma generate' to generate the schema; Restart `TS` Server to see the changes if `import { User } from '@prisma/client';` is not visible.

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

`user/user.module.ts`:

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

`app.module.ts`

```typescript
import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
@Module({
 imports: [ConfigModule.forRoot(), PrismaModule, UserModule],
 providers: [
  {
   provide: APP_INTERCEPTOR,
   useClass: ClassSerializerInterceptor
  }
 ]
})
export class AppModule {}

```

`main.ts`

```typescript
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
 const app = await NestFactory.create(AppModule);
 const logger = new Logger('App');
 app.use(cookieParser());
 app.setGlobalPrefix('api');
 app.useGlobalPipes(
  new ValidationPipe({
   whitelist: true,
   transform: true,
   transformOptions: {
    enableImplicitConversion: true
   }
  })
 );
 if (process.env.NODE_ENV === 'development')
  logger.log(`App started at http://localhost:3000/api/`);
 await app.listen(3000);
}
bootstrap();
```

GET: [http://localhost:3000/api/auth/users](#)

## Authentication - SignUp

Basic SignUp Logic:

1. validate the request body
2. check if the user already exists
3. hash the password
4. store the user in the database
5. return auth token

### Check if the user already exists

Define SignUp dto in `user/dto/auth.dto.ts`

```typescript
import {IsEmail, IsNotEmpty, IsString, Matches, MinLength,} from 'class-validator';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Matches(
    /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/,
    {
      message: 'phone must be a valid phone number',
    },
  )
  phone: string;
  // +8801799082929
  // 01799082929

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(5)
  password: string;
}
```

`user/auth/auth.controller.ts`

```typescript
@Controller('auth')
export class AuthController {
 constructor(private readonly authService: AuthService) {}
 //...

 @Post('/signup')
 signup(@Body() body: SignUpDto) {
  return this.authService.signup(body);
 }
}
```

`user/auth/auth.service.ts`

```typescript
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

interface SignUpParams {
 name: string;
 email: string;
 phone: string;
 password: string;
}
@Injectable()
export class AuthService {
 private readonly logger = new Logger(AuthService.name);

 constructor(private readonly prismaService: PrismaService) {}

 //...

 async signup({ email }: SignUpParams) {
  const userExits: User | null = await this.prismaService.user.findUnique({
   where: {
    email: email
   }
  });

  this.logger.log({ userExits });
  if (userExits) {
   throw new ConflictException();
  }
  return userExits;
 }
}
```

Test with an existing user at POST: `~/auth/signup`

### Hash the password

`user/auth/auth.service.ts`

```typescript
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
 private readonly logger = new Logger(AuthService.name);

 constructor(private readonly prismaService: PrismaService) {}

  //...

 async signup({ email, password }: SignUpParams) {
  // 2. Check User Exits?
  const userExits: User | null = await this.prismaService.user.findUnique({
   where: {
    email: email
   }
  });

  if (userExits) {
   throw new ConflictException();
  }

  // 3. Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);

  this.logger.log({ hashedPassword });

  return userExits;
 }
}
```

### Store the user in the database

`user/auth/auth.service.ts`

```typescript
import { User, UserType } from '@prisma/client';
//..
@Injectable()
export class AuthService {
 private readonly logger = new Logger(AuthService.name);

 constructor(private readonly prismaService: PrismaService) {}

 //...

 async signup({ email, password, phone, name }: SignUpParams) {
  // 2. Check User Exits?
  const userExits: User | null = await this.prismaService.user.findUnique({
   where: {
    email: email
   }
  });

  if (userExits) {
   throw new ConflictException();
  }

  // 3. Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Store user in db
  const user = await this.prismaService.user.create({
   data: {
    email,
    name,
    phone,
    password: hashedPassword,
    // user_type: 'BUYER'
    user_type: UserType.BUYER
   }
  });

  return user;
 }
}
```

### Return auth token

`user/auth/auth.service.ts`:

```typescript
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, UserType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

interface SignUpParams {
 name: string;
 email: string;
 phone: string;
 password: string;
}
@Injectable()
export class AuthService {
 private readonly logger = new Logger(AuthService.name);

 constructor(private readonly prismaService: PrismaService) {}

 async getUsers() {
  const users: User[] = await this.prismaService.user.findMany();
  this.logger.log({ users });
  return users;
 }

 async signup({ email, password, phone, name }: SignUpParams) {
  // 2. Check User Exits?
  const userExits: User | null = await this.prismaService.user.findUnique({
   where: {
    email: email
   }
  });

  if (userExits) {
   throw new ConflictException();
  }

  // 3. Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);

  this.logger.log({ hashedPassword });

  // 4. Store user in db
  const user = await this.prismaService.user.create({
   data: {
    email,
    name,
    phone,
    password: hashedPassword,
    // user_type: 'BUYER'
    user_type: UserType.BUYER
   }
  });

  // 5. return token
  // this.logger.log({ env: process.env.JWT_TOKEN });
  const token = await jwt.sign({ email, id: user.id }, process.env.JWT_TOKEN, {
   expiresIn: 3600000
  });

  return token;
 }
}
```

Slightly modified `user/auth/auth.controller.ts`

```typescript
@Controller('auth')
export class AuthController {
 constructor(private readonly authService: AuthService) {}

 @Post('/signup')
 async signup(@Body() body: SignUpDto) {
  const token = await this.authService.signup(body);
  return { token: token };
 }
}
```

#### 🍪🍪send as `cookie`🍪🍪

Make sure the [cookie-parser](https://docs.nestjs.com/techniques/cookies#use-with-express-default) middleware is set as global middleware in `main.ts` file.

```typescript
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
 const app = await NestFactory.create(AppModule);
 const logger = new Logger('App');
 app.use(cookieParser());
 //...
 await app.listen(3000);
}
bootstrap();
```

To attach a cookie to an outgoing `response`, use the `Response#cookie()` method:

```typescript
import { Response } from 'express';

@Controller('auth')
export class AuthController {
 constructor(private readonly authService: AuthService) {}
  //...
 @Post('/signup')
 async signup(@Body() body: SignUpDto, @Res({ passthrough: true }) response: Response) {
  const token = await this.authService.signup(body);
  response.cookie('cookieToken', token, {
   httpOnly: true,
   expires: new Date(Date.now() + 1000 * 60 * 60 * 24)
  });
  return { accessToken: token };
 }
}
```

#### 🔥saving cookie/tokens as environment var in Postman🔥

- [https://learning.postman.com/docs/sending-requests/variables/#using-variables-in-scripts](https://learning.postman.com/docs/sending-requests/variables/#using-variables-in-scripts)
- [https://learning.postman.com/docs/writing-scripts/script-references/postman-sandbox-api-reference/](https://learning.postman.com/docs/writing-scripts/script-references/postman-sandbox-api-reference/)

```javascript
var res = pm.response.json();
console.log(res.accessToken)
pm.environment.set('my_token', res.accessToken);

var cookie =  pm.cookies.get('cookieToken');
console.log(cookie)
pm.environment.set('my_cookie',cookie);
```

<div align="center">
<img src="img/pm.jpg" alt="pm.jpg" width="700px">
</div>

#### 🔥(OPTIONAL) how we will accessing request cookies/tokens

Here's how we will access cookies/bearerTokens in the interceptor:

```typescript
// src\user\interceptor\user.interceptor.ts
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';

export class UserInterceptor implements NestInterceptor {
 intercept(context: ExecutionContext, handler: CallHandler) {
  const request = context.switchToHttp().getRequest();
  // for tokens sent as cookies
  const cookies = request.cookies; //https://docs.nestjs.com/techniques/cookies#use-with-express-default
  console.log(cookies);
  // for token sent as bearer token
  const token = request?.headers?.authorization;
  console.log(token);

  return handler.handle();
 }
}

// src\app.module.ts
@Module({
 imports: [ConfigModule.forRoot(), PrismaModule, UserModule, HomeModule],
 providers: [
  {
   provide: APP_INTERCEPTOR,
   useClass: ClassSerializerInterceptor
  },
  {
   provide: APP_INTERCEPTOR,
   useClass: UserInterceptor
  }
 ]
})
export class AppModule {}

```

## Authentication - SignIn | SignOut

Basic SignUp Logic:

1. find the user by email
2. validate the hashed password
3. return a jwt

`user/dto/auth.dto.ts`

```typescript
export class SignInDto {
 @IsEmail()
 email: string;
 @IsString()
 @MinLength(5)
 password: string;
}
```

`src\user\auth\auth.controller.ts`

```typescript
@Controller('auth')
export class AuthController {
 constructor(private readonly authService: AuthService) {}
 //...
 @Post('/signin')
 async signin(@Body() body: SignInDto, @Res({ passthrough: true }) response: Response) {
  const token = await this.authService.signin(body);
  response.cookie('cookieToken', token, {
   httpOnly: true,
   expires: new Date(Date.now() + 1000 * 60 * 60 * 24)
  });
  return { accessToken: token };
 }
}
```

`src\user\auth\auth.service.ts`

```typescript
interface SignInParams {
 email: string;
 password: string;
}

@Injectable()
export class AuthService {
 private readonly logger = new Logger(AuthService.name);

 constructor(private readonly prismaService: PrismaService) {}

 //..

 async signin({ email, password }: SignInParams) {
  const user = await this.prismaService.user.findUnique({
   where: {
    email
   }
  });

  if (!user) {
   throw new HttpException('Invalid credentials', 400);
  }

  const hashedPassword = user.password;
  const isValidPassword = await bcrypt.compare(password, hashedPassword);

  if (!isValidPassword) {
   throw new HttpException('Invalid credentials', 400);
  }

  return this.generateJWT(email, user.id);
 }

 private generateJWT(email: string, id: string) {
  return jwt.sign({ email, id }, process.env.JWT_TOKEN, {
   expiresIn: 3600000
  });
 }
}
```

### `signout` by clearing cookies🍪🍪

`\src\user\auth\auth.controller.ts`

```typescript
 @Post('/signout')
 async logout(@Res({ passthrough: true }) res: Response) {
  res.clearCookie('cookieToken');
  return {
   message: 'Logout successful!'
  };
 }
```

## Identifying the User

Rest of the application depends on [Home](https://github.com/dev-SR/Nest.js/tree/main/2auth-custom-v2/src/home) module.

Building Custom Decorator:

`src/user/decorator/user.decorator.ts`:

```typescript
export const User = createParamDecorator((data: string, ctx: ExecutionContext) => {
 return {
  id: 1,
  email: 'admin@gmail.com'
 };
});
```

```typescript
 @Post()
 createHome(
  @Body() body: CreateHomeDto,
  @IdentifyUser() user: User
 )
 {
  console.log(user);
  return this.homeService.createHome(body);
 }
```

Now we have to make an interceptor for getting user info from request auth tokens

### Creating a User Interceptor

Here's how we will access cookies/bearerTokens in the interceptor:

`src\user\interceptor\user.interceptor.ts`:

```typescript
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export class UserInterceptor implements NestInterceptor {
 async intercept(context: ExecutionContext, handler: CallHandler) {
  const request = context.switchToHttp().getRequest();
  // for tokens sent as cookies
  const cookies = request.cookies; //https://docs.nestjs.com/techniques/cookies#use-with-express-default
  console.log(cookies);
  // // for token sent as bearer token
  // const token = request?.headers?.authorization;
  // console.log(token);

  const user = await jwt.decode(cookies.cookieToken);
  // console.log(user);
  request.user = user;

  return handler.handle();
 }
}

```

Registering the Interceptor:

`~\src\app.module.ts`:

```typescript
@Module({
 imports: [ConfigModule.forRoot(), PrismaModule, UserModule, HomeModule],
 providers: [
  {
   provide: APP_INTERCEPTOR,
   useClass: ClassSerializerInterceptor
  },
  {
   provide: APP_INTERCEPTOR,
   useClass: UserInterceptor
  },
 ]
})
export class AppModule {}
```

`src\user\decorator\user.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserInfo {
 id: string;
 email: string;
 iat: string;
 exp: string;
}

export const User = createParamDecorator((data: string, ctx: ExecutionContext) => {
 const request = ctx.switchToHttp().getRequest();
 return request.user;
});
```

`~src\home\home.controller.ts`

```typescript
 @Post()
 createHome(@Body() body: CreateHomeDto, @User() user: UserInfo) {
  return user;
  // return this.homeService.createHome(body);
 }
```

## 💂‍♂️💂‍♂️Authorization - Guard💂‍♂️💂‍♂️

- [https://docs.nestjs.com/guards#guards](https://docs.nestjs.com/guards#guards)

<div align="center">
<img src="img/ls.jpg" alt="ls.jpg" width="600px">
</div>

`Guards` have a single responsibility. **They determine whether a given request will be handled by the route handler or not, depending on certain conditions (like permissions, roles, ACLs, etc.) present at run-time**. This is often referred to as `authorization`. Authorization (and its cousin, authentication, with which it usually collaborates) has typically been handled by middleware in traditional Express applications. `Middleware` is a fine choice for authentication, since things like token validation and attaching properties to the request object are not strongly connected with a particular route context (and its metadata).

But `middleware`, by its nature, is dumb. It doesn't know which handler will be executed after calling the `next()` function. On the other hand, Guards have access to the `ExecutionContext` instance, and thus know exactly what's going to be executed next. They're designed, much like exception filters, pipes, and interceptors, to let you interpose processing logic at exactly the right point in the request/response cycle, and to do so declaratively. This helps keep your code DRY and declarative.

### Prerequisite

#### How Guards Work

Defining a Guard:

`~src\user\guard\auth.guard.ts`:

```typescript
export class AuthGuard implements CanActivate {
 canActivate() {
  return false;
 }
}
```

Protecting Routes:

`~src\home\home.controller.ts`:

```typescript
 @UseGuards(AuthGuard)
 @Post()
 createHome(@Body() body: CreateHomeDto, @User() user: UserInfo) {
  return user;
  // return this.homeService.createHome(body);
 }
```

`POST: {{DOMAIN}}/api/home`

```json
{
    "statusCode": 403,
    "message": "Forbidden resource",
    "error": "Forbidden"
}
```

#### How Roles Work

- [https://docs.nestjs.com/fundamentals/execution-context#reflection-and-metadata](https://docs.nestjs.com/fundamentals/execution-context#reflection-and-metadata)

🚀 Create a custom decorator for roles:

`~src\user\decorator\roles.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';
import { UserType } from '@prisma/client';

export const Roles = (...roles: UserType[]) => SetMetadata('roles', roles);

```

Use Role decorator with route:

```typescript
 @Roles(UserType.ADMIN, UserType.REALTOR)
 @UseGuards(AuthGuard)
 @Post()
 createHome(@Body() body: CreateHomeDto, @User() user: UserInfo) {
  return user;
  // return this.homeService.createHome(body);
 }
```

```typescript
@Injectable() //must to inject Reflector
export class AuthGuard implements CanActivate {
 constructor(private readonly reflector: Reflector) {}

 canActivate(context: ExecutionContext) {
  // get metadata from execution context
  const roles = this.reflector.getAllAndOverride<UserType[]>('roles', [
   context.getHandler(),
   context.getClass()
  ]);
  console.log(roles);//[ 'ADMIN', 'REALTOR' ]

  return true;
 }
}
```

### 🚀Role-based Authentication Guard

Required Steps:

1. Determine the UserTypes that are allowed to access the route.
2. Grab JWT from the request header and verify it.
3. Database lookup to get by the JWT's userId.
4. Determine if the user is allowed to access the route.

`~src\home\home.controller.ts`:

```typescript
 @Roles(UserType.ADMIN, UserType.REALTOR)
 @UseGuards(AuthGuard)
 @Post()
 createHome(@Body() body: CreateHomeDto, @User() user: UserInfo) {
  // return user;
  return this.homeService.createHome(body);
 }
```

`~src\user\guard\auth.guard.ts`:

```typescript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfo } from '../decorator/user.decorator';
@Injectable() //must to inject Reflector
export class AuthGuard implements CanActivate {
 constructor(
  private readonly reflector: Reflector,
  private readonly prismaService: PrismaService
 ) {}
 async canActivate(context: ExecutionContext) {
  // 1. Determine the UserTypes that are allowed to access the route.
  //   - get metadata from execution context
  const roles = this.reflector.getAllAndOverride<UserType[]>('roles', [
   context.getHandler(),
   context.getClass()
  ]);
  // console.log(roles);

  if (roles?.length) {
   // 2. Grab JWT from the request header and verify it.

   const request = context.switchToHttp().getRequest();
   const token = request.cookies.cookieToken;
   try {
    const payload = (await jwt.verify(token, process.env.JWT_TOKEN)) as jwt.JwtPayload;
    // 3. Database lookup to get by the JWT's userId.
    const user = await this.prismaService.user.findUnique({
     where: {
      id: payload.id
     }
    });

    if (!user) return false;
    // 4. Determine if the user is allowed to access the route.
    if (roles.includes(user.user_type)) return true;

    return false;
   } catch (error) {
    // console.log(error);
    return false;
   }
  }
 }
}
```

#### 🌟🌟Global Guards

We can modify above guard implementation to run guards globally.

```typescript
export class AuthGuard implements CanActivate {
 // .....
 async canActivate(context: ExecutionContext) {

  if (roles?.length) {
   //...
  }

  return true; //🚀 if no rules, always return true
 }
}
```

`return true` will allow the request to continue to the next middleware, if no roles are defined.

Registering Guards for global use:

app.module.ts`

```typescript
@Module({
 imports: [ConfigModule.forRoot(), PrismaModule, UserModule, HomeModule],
 providers: [
  {
   provide: APP_INTERCEPTOR,
   useClass: ClassSerializerInterceptor
  },
  {
   provide: APP_INTERCEPTOR,
   useClass: UserInterceptor
  },
  {
   provide: APP_GUARD,
   useClass: AuthGuard
  }
 ]
})
export class AppModule {}
```

Now we can remove `@UseGuards` decorator from the routes; only `@Roles` is enough

```typescript
 @Roles(UserType.ADMIN, UserType.REALTOR)
 @Post()
 createHome(@Body() body: CreateHomeDto, @User() user: UserInfo) {
  // return user;
  return this.homeService.createHome(body);
 }
```
