import { IsEmail, IsString } from 'class-validator';

export class CreateUser {
  @IsEmail()
  email: string;
  @IsString()
  password: string;
}
