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

  async refreshToken(refresh_token: string) {
    const { id } = await this.verifyRefreshToken(refresh_token);
    console.log(id);

    const user = await this.userService.findUserById(id);
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    const token = await this.generateAccessToken(user);
    return token;
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

  // Public Methods:
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
