import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto'; //Node.js Native pkg
import { promisify } from 'util'; //native pkg
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from './dto/session.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

const scrypt = promisify(_scrypt);
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(Session) private sessionRepo: Repository<Session>,
    private jwtService: JwtService,
  ) {}
  async signup(email: string, password: string) {
    //
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('email in use');
    }
    //   Hashing pass
    //   Generate a salt
    const salt = randomBytes(8).toString('hex');
    //  Hash the salt and password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    //   Join the hashed result and the salt together
    //   So that we can decode with the same salt when signin
    const hashedPassword = salt + '.' + hash.toString('hex');
    /* "1baf26e39239e8e1.842edd5e186090ea21a74821112cf2a70d35ade2c1efce9cf4912b323a7d8b0b" */

    // Create new User
    const user = await this.usersService.createUser(email, hashedPassword);
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const [salt, storedHash] = user.password.split('.');
    const newHash = (await scrypt(password, salt, 32)) as Buffer;
    if (storedHash !== newHash.toString('hex')) {
      throw new BadRequestException('email or password is wrong');
    }
    return user;
  }

  createSession(req: Request, userId: string) {
    const connInfo = {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };
    // generate a session token
    const sessionToken = randomBytes(43).toString('hex');

    // insert into database
    const s = this.sessionRepo.create({
      sessionToken,
      userId: userId,
      valid: true,
      ip: connInfo.ip,
      userAgent: connInfo.userAgent,
      // updated_at:new Date()
    });
    this.sessionRepo.save(s);
    // return token
    return sessionToken;
  }

  async getUserFromCookies(req: Request, res: Response) {
    // Get the access and refresh tokens
    const accessToken = req.cookies['accessToken'];
    const refreshToken = req.cookies['refreshToken'];
    // If Access token then decode access token
    if (accessToken) {
      const decodedAccessToken = await this.decodeAccessToken(accessToken);
      // Return User
      const currentUser = this.usersService.findByUserId(
        decodedAccessToken.userId,
      );
      return currentUser;
    }
    // If there is no access token generate new Access token
    // Decode Refresh Token
    if (refreshToken) {
      const { sessionToken } = await this.decodeRefreshToken(refreshToken);

      // Look up session
      const currentSession = await this.currentSession(sessionToken);
      // Confirm if session is valid
      // if Session is valid
      if (currentSession.valid) {
        // Look up current user
        const currentUser = await this.usersService.findByUserId(
          currentSession.userId,
        );
        // generate new Refresh and Access Tokens
        const newTokens = await this.createTokens(
          sessionToken,
          String(currentUser.id),
        );
        // Get date, 30 days in the future
        const ExpiryDate: Date = new Date();
        ExpiryDate.setDate(ExpiryDate.getDate() + 30);

        res
          .cookie('refreshToken', newTokens.refreshToken, {
            httpOnly: true,
            expires: ExpiryDate,
          })
          .cookie('accessToken', newTokens.accessToken, { httpOnly: true });
        return currentUser;
      }
    }
    return null;
  }

  async createTokens(
    sessionToken: string,
    userId: string,
  ): Promise<{ refreshToken: string; accessToken: string }> {
    // Create Refresh Token from Session ID
    const refreshToken = await this.jwtService.signAsync({ sessionToken });
    // Create Access Token form Session ID, User ID
    const accessToken = await this.jwtService.signAsync({
      sessionToken,
      userId,
    });
    return {
      refreshToken,
      accessToken,
    };
  }

  async decodeAccessToken(accessToken: string): Promise<{
    sessionToken: string;
    userId: string;
  }> {
    return (await this.jwtService.verifyAsync(accessToken)) as {
      sessionToken: string;
      userId: string;
    };
  }

  async decodeRefreshToken(refreshToken: string): Promise<{
    sessionToken: string;
    userId: string;
  }> {
    // return (await this.jwtService.verifyAsync(efreshToken)) as {
    //   sessionToken: string;
    //   userId: string;
    // };
    return await this.jwtService.verifyAsync(refreshToken);
  }

  currentSession(sessionToken: string) {
    return this.sessionRepo.findOne({ sessionToken });
  }

  async logout(email: string, req: Request, res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    // if (!refreshToken) {
    // throw new BadRequestException('Unauthorized');
    // }
    const { sessionToken } = await this.decodeAccessToken(refreshToken);
    await this.sessionRepo.delete({ sessionToken });
    // res.cookie('refreshToken', null).cookie('accessToken', null);
    res.clearCookie('refreshToken').clearCookie('accessToken');
    return { status: 'Logout!!' };
  }
}
