/* eslint-disable @typescript-eslint/no-empty-function */
import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import {
  IsNumber,
  IsPositive,
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateUser {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  pass: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  age: number;
}

import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  id: string;
  name: string;
  pass: string;

  @Expose({ name: 'createdAt' })
  transformCratedAt() {
    return this.created_at;
  }
  @Exclude()
  update_at: Date;

  @Exclude()
  created_at: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}
  @Get('')
  api(): UserResponseDto {
    const user = {
      id: '1',
      name: 'jhon',
      pass: 'jhonx',
      update_at: new Date(),
      created_at: new Date(),
    };

    return new UserResponseDto(user);
  }
  @Get('/all')
  apiAll(): UserResponseDto[] {
    const users = [
      {
        id: '1',
        name: 'jhon',
        pass: 'jhonx',
        update_at: new Date(),
        created_at: new Date(),
      },
      {
        id: '2',
        name: 'jhon',
        pass: 'jhonx',
        update_at: new Date(),
        created_at: new Date(),
      },
    ];
    return users.map((user) => new UserResponseDto(user));
  }
}
