# Nestjs + Reactjs Project

- [Nestjs + Reactjs Project](#nestjs--reactjs-project)
  - [Initial Dependencies](#initial-dependencies)
  - [Setup Database](#setup-database)
  - [SignUP with JWT](#signup-with-jwt)
  - [Intro to Refresh Token + Access Token combo](#intro-to-refresh-token--access-token-combo)
  - [Login](#login)
  - [💂‍♂️💂‍♂️Authorization - using Guard💂‍♂️💂‍♂️](#️️authorization---using-guard️️)
    - [📝Create Role-Based Auth Guard](#create-role-based-auth-guard)
  - [(Optional) Creating a User Interceptor](#optional-creating-a-user-interceptor)
  - [Renew Access Token with Refresh Token logic](#renew-access-token-with-refresh-token-logic)
  - [Logout route](#logout-route)

## Initial Dependencies

```bash
yarn add @nestjs/config class-validator class-transformer @prisma/client
yarn add bcryptjs jsonwebtoken cookie-parser
yarn add -D prisma @types/bcryptjs @types/cookie-parser @types/jsonwebtoken
npx prisma init

```

`src/.env`

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecom"
JWT_ACCESS_TOKEN_SECRET="h9324yu9d34u2398b2kj3h49823432sdffsdffssfsdf"
JWT_ACCESS_TOKEN_EXPIRATION_TIME="1h"
JWT_REFRESH_TOKEN_SECRET="yu9dd234u2398b2kjdsf3h49823432sdffsdffsdfdsd"
JWT_REFRESH_TOKEN_EXPIRATION_TIME="7d"
PORT=3000
NODE_ENV="development"
```

`src/config/app.config.ts`

```typescript
export default () => ({
  jwtAccessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
  jwtAccessTokenExpirationTime: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
  jwRefreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
  jwtRefreshTokenExpirationTime: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
  port: process.env.PORT,
  environment: process.env.NODE_ENV,
});

```

`src\main.ts`

```typescript
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import appConfig from './config/app.config';
async function bootstrap() {
 const app = await NestFactory.create(AppModule);
 const port = appConfig().port;
 const logger = new Logger('App');
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
 logger.log(`App started at http://localhost:${port}/api/`);

 await app.listen(port);
}
bootstrap();
```

How nestjs cli works?

```bash
nest generate controller <controller_name> <module_name>
nest generate controller <controller_name> <module_name> [--flat]
```

- `--flat`option, if you don't want a new folder generated for your controller

## Setup Database

```typescript
nest g module prisma
nest g service prisma --no-spec
```

Initialize prisma service in `src\prisma\prisma.service.ts`

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

Now, Export prisma service from prisma module `src\prisma\prisma.service.ts`


```typescript
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

`prisma/prisma.schema`

```prisma
model User {
  id         String   @id @default(uuid())
  name       String
  phone      String?
  email      String   @unique
  password   String
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  role       Role     @default(USER)
}

enum Role {
  USER
  ADMIN
}
```

Command for `prisma`:

```bash
# Generate artifacts (e.g. Prisma Client types) for your Prisma schema
npx prisma generate
# Push the Prisma schema state to the database
npx prisma db push
# Start the Prisma Studio GUI
npx prisma studio
```

`psql` client:

```bash
>>psql -U postgres
# default password = postgres
>>create database ecom;
# list all databases
>>\l
# connect to database
>>\c ecom
# list tables
>>\dt
```

## SignUP with JWT

Steps involves in SignUp with JWT:

- validate the request body
- check if the user already exists
- hash the password with bcrypt
- store the user in the database
- return success response


```typescript
nest g mo users
nest g mo auth
nest g s users
nest g s auth
nest g co users
nest g co auth
```

Import prisma service and export user service from `src\users\users.service.ts`

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [PrismaModule],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
```

Import users module in `auth.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [UsersModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
```

`src\common\types\param.ts`

```typescript
export interface SignUpParams {
  name: string;
  email: string;
  phone?: string;
  password: string;
}
export interface SignInParams {
  email: string;
  password: string;
}

```

`src\users\users.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { SignUpParams } from 'src/auth/types/user';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
 constructor(private readonly prismaService: PrismaService) {}

 async findOne(email: string): Promise<User | undefined> {
  return this.prismaService.user.findUnique({
   where: { email }
  });
 }
 async createNewUser(user: SignUpParams): Promise<User | undefined> {
  return this.prismaService.user.create({
   data: user
  });
 }
}
```

`auth.service.ts`

```typescript
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { SignUpParams } from 'src/common/types/param';
import { UsersService } from 'src/users/users.service';
// import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private readonly userService: UsersService) {}

  async signup({ email, password, phone, name }: SignUpParams) {
    // 1. Check User Exits?
    const userExits: User | null = await this.userService.findOne(email);

    if (userExits) {
      throw new ConflictException();
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Store user in db
    await this.userService.createNewUser({
      email,
      name,
      phone,
      password: hashedPassword,
    });

    // 4. Return success message
    return {
      message: 'User created successfully',
    };
  }
}

```

`src\auth\dto\auth.dto.ts`

```typescript
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class SignUpDto {
 @IsString()
 @IsNotEmpty()
 name: string;

 @IsOptional()
 @Matches(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/, {
  message: 'phone must be a valid phone number'
 })
 phone: string;
 // +8801799082929
 // 01799082929

 @IsEmail()
 @IsNotEmpty()
 email: string;

 @IsString()
 @MinLength(5)
 @IsNotEmpty()
 password: string;
}
```

`src\auth\auth.controller.ts`

```typescript
import { Body, Controller, Get, Post } from '@nestjs/common';
import { SignUpDto } from './dto/auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
   constructor(private readonly authService: AuthService) {}

   @Post('/signup')
   signup(@Body() body: SignUpDto) {
      // console.log(body);
      return this.authService.signup(body);
   }
}
```

Now we can test `localhost:3000/auth/signup` route using Postman

- Sending request to  with wrong credentials or missing fields:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"email":"emailx"}' http://localhost:3000/api/auth/signup
```

<div align="center">
<img src="img/bad-req.jpg" alt="bad-req.jpg" width="700px">
</div>

- If user already exists:

<div align="center">
<img src="img/alreadyexits.jpg" alt="alreadyexits.jpg" width="700px">
</div>

- If everything is ok:

<div align="center">
<img src="img/signupok.jpg" alt="signupok.jpg" width="700px">
</div>

## Intro to Refresh Token + Access Token combo

- Access Token:
  - Intro:
    - issued when user logs in
    - client uses it to access protected resources until it expires
    - lifetime is short
    - new access token is issued at refresh request
  - Handling:
    - sent as json response to client
    - client stores in app state: redux-store, state-management, etc
    - Do not store in local storage or cookies
    - client sends access token in Authorization header
    - server verifies access token
    - server sends 401 if access token is invalid

- Refresh Token:
  - Intro:
    - issued when user logs in
    - verified with separate endpoint:`/refresh`
    - used to get new access token
    - Must be allowed to expire or logout user
    - lifetime is long
  - Handling:
    - sent as http-only cookie
    - Not accessible via javascript
    - client sends refresh token in cookie
    - server verifies refresh token
    - server sends 401 if refresh token is invalid

<div align="center">
<img src="img/ref-accs-token.jpg" alt="ref-accs-token.jpg" width="1000px">
</div>


## Login

Steps to implement login:

- find the user by email
- validate the hashed password
- return access token and refresh token
  - access token is send in response body
  - refresh token is send as http-only cookie


`src\auth\dto\auth.dto.ts`

```typescript
export class SignInDto {
 @IsNotEmpty()
 @IsEmail()
 email: string;
 @IsString()
 @MinLength(5)
 @IsNotEmpty()
 password: string;
}
```

`src\common\jwt-payload.ts`

```typescript
import { Role } from '@prisma/client';

export type AccessTokenPayload = {
  userInfo: {
    id: string;
    email: string;
    role: Role;
  };
};

export type RefreshTokenPayload = {
  id: string;
};
```

`src\auth\auth.service.ts`

```typescript
import {
  ConflictException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { SignInParams, SignUpParams } from 'src/common/types/param';
import { UsersService } from 'src/users/users.service';
import * as jwt from 'jsonwebtoken';
import appConfig from 'src/config/app.config';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from 'src/common/types/jwt-payload';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private readonly userService: UsersService) {}

  async signup({ email, password, phone, name }: SignUpParams) {
    // 1. Check User Exits?
    const userExits: User | null = await this.userService.findOne(email);

    if (userExits) {
      throw new ConflictException();
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Store user in db
    await this.userService.createNewUser({
      email,
      name,
      phone,
      password: hashedPassword,
    });
    // 4. Return success message
    return {
      message: 'User created successfully',
    };
  }
  async signin({ email, password }: SignInParams) {
    // check if user exists
    const user = await this.userService.findOne(email);

    if (!user) {
      throw new HttpException('Invalid credentials', 400);
    }

    // check if password is correct
    const hashedPassword = user.password;
    const isValidPassword = await bcrypt.compare(password, hashedPassword);

    if (!isValidPassword) {
      throw new HttpException('Invalid credentials', 400);
    }
    // Generate tokens and return it
    const tokens = await this.getTokens(user);
    return tokens;
  }

  // Private Methods:
  private async getTokens(user: User) {
    const tokens = await Promise.all([
      await this.generateAccessToken(user),
      await this.generateRefreshToken(user),
    ]);
    return {
      access_token: tokens[0],
      refresh_token: tokens[1],
    };
  }
  private async generateAccessToken(user: User) {
    const payload: AccessTokenPayload = {
      userInfo: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };

    return await jwt.sign(payload, appConfig().jwtAccessTokenSecret, {
      expiresIn: appConfig().jwtAccessTokenExpirationTime,
    });
  }
  private async generateRefreshToken(user: User) {
    const payload: RefreshTokenPayload = {
      id: user.id,
    };
    return await jwt.sign(payload, appConfig().jwRefreshTokenSecret, {
      expiresIn: appConfig().jwtRefreshTokenExpirationTime,
    });
  }
}

```

`src\auth\auth.controller.ts`

```typescript
import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { SignInDto, SignUpDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  signup(@Body() body: SignUpDto) {
    return this.authService.signup(body);
  }

  @Post('/signin')
  async signin(
    @Body() body: SignInDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    /*
    !!{ passthrough: true } response will be sent manually
		*/
  ) {
    // console.log(body);
    const tokens = await this.authService.signin(body);
    console.log(tokens);
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true, //accessible only by the web server
      secure: appConfig().environment == 'production', //true: only transmit cookie over https
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
    res.json({ access_token: tokens.access_token });
  }
}
```

Now we can test our login api `/auth/signin`.

## 💂‍♂️💂‍♂️Authorization - using Guard💂‍♂️💂‍♂️

<div align="center">
<img src="img/ls.jpg" alt="ls.jpg" width="800px">
</div>

Guards have a single responsibility. They determine whether a given request will be handled by the route handler or not, depending on certain conditions (like permissions, roles, ACLs, etc.) present at run-time. This is often referred to as authorization. Authorization (and its cousin, authentication, with which it usually collaborates) has typically been handled by middleware in traditional Express applications. Middleware is a fine choice for authentication, since things like token validation and attaching properties to the request object are not strongly connected with a particular route context (and its metadata).

But middleware, by its nature, is dumb. It doesn't know which handler will be executed after calling the next() function. On the other hand, Guards have access to the ExecutionContext instance, and thus know exactly what's going to be executed next. They're designed, much like exception filters, pipes, and interceptors, to let you interpose processing logic at exactly the right point in the request/response cycle, and to do so declaratively. This helps keep your code DRY and declarative.

### 📝Create Role-Based Auth Guard

We can use a custom decorator call `@Roles()` to check if the user has the required role to access the route. This `@Roles()` decorator takes an array of roles as an argument and sets allowed roles in the metadata of the route handler.

`src\auth\decorator\roles.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

// 1. Create a custom decorator to set `roles` metadata for the route.
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
```

`src\auth\auth.controller.ts`

```typescript
import {AuthGuard } from './guard/auth.guard';
import { Role } from '@prisma/client';
import { Roles } from './decorator/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ......

  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(AuthGuard)
  @Get('/protected-test-all')
  protectedUserOrAdmin(@Req() req: Request) {
    return {
      message: 'Only verified User and Admin can access this route',
    };
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard)
  @Get('/protected-test-admin')
  protectedOnlyAdmin(@Req() req: Request) {
    // console.log(req.cookies);
    return {
      message: 'Only verified Admin can access this route',
    };
  }
}
```

Now `protectedUserOrAdmin` and `protectedOnlyAdmin` routes are protected. We can only access these routes if we have the required role.


Define a `AuthGuard` class that implements the `CanActivate` interface. The `CanActivate` interface has a single method, `canActivate`, which returns a boolean value indicating whether or not the request should be handled by the route handler.

Steps:

1. access the `roles` metadata from the route handler.
2. Check if request headers contain the `access_token` token.
   1. if not, return `false`.
3. Verify `access_token`
   1. if invalid return `false`
   2. if valid check if the user has the required `role` to access the route.
      1. if `role` defined in the metadata is not present in the user's `role` return `false`
      2. if `role` defined in the metadata is present in the user's `role` return `true`

Define jwt verify logic in `src\auth\auth.service.ts`

```typescript
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private readonly userService: UsersService) {}
  async verifyAccessToken(access_token: string): Promise<AccessTokenPayload> {
    try {
      const payload = await jwt.verify(
        access_token,
        appConfig().jwtAccessTokenSecret,
      );
      return payload as AccessTokenPayload;
    } catch (error) {
      throw new HttpException('Invalid access token', 400);
    }
  }
}
```





`src/auth/guard/auth.guard.ts`

```typescript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import appConfig from 'src/config/app.config';
import { Role } from '@prisma/client';
import { AccessTokenPayload } from 'src/common/types/jwt-payload';
import { AuthService } from '../auth.service';

@Injectable() //must to inject Reflector
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext) {
    //* 1. Determine the Roles that are allowed to access the route.
    //   - get metadata from execution context
    /*
			@Roles(Role.USER, Role.ADMIN)
			@UseGuards(UserAuthGuard)
			@Get('/protected-test')
			protectedTest(@Req() req: Request) {
				console.log(req.cookies);
				return 'Protected Test';
			}
		*/
    const allowedRolesInRouted = this.reflector.getAllAndOverride<Role[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );
    // console.log(allowedRolesInRouted); //[ 'USER', 'ADMIN' ]

    //* 2. Get access_token from request header
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined =
      request.headers.authorization || request.headers.Authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return false;
    }

    //* 3. Verify access_token
    const access_token = authHeader.split(' ')[1];
    const decodedUser = await this.authService.verifyAccessToken(access_token);

    //* 4. Check if the user has the required role
    if (allowedRolesInRouted.includes(decodedUser.userInfo.role)) {
      return true;
    }
    return false;
  }
}

```

<div align="center">
<img src="img/protect-test.jpg" alt="protect-test.jpg" width="700px">
</div>

Provide the JWT in the `Authorization` header of the request:

**before that; saving the token in  Postman environment variable when we login or signup**. Set the following code in `Test` section of Postman:

```typescript
var res = pm.response.json();
console.log(res.access_token)
pm.environment.set('access_token', res.access_token);

var cookie =  pm.cookies.get('cookieToken');
console.log(cookie)
pm.environment.set('my_cookie',cookie);
```

<div align="center">
<img src="img/protect-test-result.jpg" alt="protect-test-result" width="700px">
</div>

## (Optional) Creating a User Interceptor

In nestjs `Interceptor` comes after `Guard` and before `Controller`. So, we can access the `request` object in the interceptor. If request passes the `Guard`, meaning we have a valid `access_token` and the user has the required role, we can access the user's information in the interceptor.

Expected user type:

`src\common\types\getUserInfo.ts`

```typescript
import { Role } from '@prisma/client';

export type GetUserInfo = {
  userInfo: {
    id: string;
    email: string;
    role: Role;
  };
  iat: number;
  exp: number;
};
```

<div align="center">
<img src="img/ls.jpg" alt="ls.jpg" width="700px">
</div>


`src/auth/interceptor/user.interceptor.ts`

```typescript
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { GetUserInfo } from 'src/common/types/getUserInfo';

export class UserInterceptorFromAccessToken implements NestInterceptor {
  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request = context.switchToHttp().getRequest();
    // for tokens sent as cookies
    // const cookies = request.cookies;
    // console.log(cookies);
    // // for token sent as bearer token
    const token = request?.headers?.authorization;
    const access_token = token?.split(' ')[1];

    const user = (await jwt.decode(access_token)) as GetUserInfo;
    // console.log(user);
    request.user = user;

    return handler.handle();
  }
}
```

Register the interceptor in `app.module.ts`

```typescript
import { UserInterceptorFromAccessToken } from './auth/interceptor/user.interceptor';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_INTERCEPTOR',
      useClass: UserInterceptorFromAccessToken,
    },
  ],
})
export class AppModule {}
```

Now we can access the `user` object in the controller:

`src\auth\auth.controller.ts`

```typescript
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  //...
  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(AuthGuard)
  @Get('/protected-test-all')
  protectedUserOrAdmin(@Req() req: Request, @User() user: GetUserInfo) {
    console.log(user);
    return {
      message: 'Only verified User and Admin can access this route',
    };
  }

}
```

## Renew Access Token with Refresh Token logic

Steps:

- Check if `refresh_token` cookie is present in the request. If not, return `401 Unauthorized`.
- Extract the `refresh_token` from the cookie.
- Verify the `refresh_token` and get the `userId` from it.
- Check if the `userId` exists in the database. If not, return `401 Unauthorized`.
- Generate a new `access_token` and send them back to the client.

`src\auth\auth.controller.ts`

```typescript
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ...
  @Get('/refresh_token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!req.cookies || !req.cookies.refresh_token) {
      return new UnauthorizedException('Please login first');
    }
    const refresh_token = req.cookies.refresh_token;
    const new_access_token = await this.authService.refreshToken(refresh_token);
    res.json({ access_token: new_access_token });
  }
}
```

`src\auth\auth.service.ts`

```typescript
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private readonly userService: UsersService) {}

  // ...

  async refreshToken(refresh_token: string) {
    const { id } = await this.verifyRefreshToken(refresh_token);
    // console.log(id);

    const user = await this.userService.findUserById(id);
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    const token = await this.generateAccessToken(user);
    return token;
  }

  // ..........
  private async generateAccessToken(user: User) {
    const payload: AccessTokenPayload = {
      userInfo: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };

    return await jwt.sign(payload, appConfig().jwtAccessTokenSecret, {
      expiresIn: appConfig().jwtAccessTokenExpirationTime,
    });
  }
  private async verifyRefreshToken(
    refresh_token: string,
  ): Promise<RefreshTokenPayload> {
    try {
      const payload = await jwt.verify(
        refresh_token,
        appConfig().jwRefreshTokenSecret,
      );
      return payload as RefreshTokenPayload;
    } catch (error) {
      throw new HttpException('Invalid refresh token', 400);
    }
  }

  async verifyAccessToken(access_token: string): Promise<AccessTokenPayload> {
    try {
      const payload = await jwt.verify(
        access_token,
        appConfig().jwtAccessTokenSecret,
      );
      return payload as AccessTokenPayload;
    } catch (error) {
      throw new HttpException('Invalid access token', 400);
    }
  }
}
```

## Logout route


```typescript
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // ....
  @Post('/signout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(
      'refresh_token',
      //  {
      //   httpOnly: true, //accessible only by the web server
      //   secure: appConfig().environment == 'production', //true: only transmit cookie over https
      //   sameSite: 'none',
      // }
    );
    return {
      message: 'Logout successfully',
    };
  }
}
```

