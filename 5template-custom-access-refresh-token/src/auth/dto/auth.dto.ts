import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
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
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(5)
  @IsNotEmpty()
  password: string;
}
export class SignInDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(5)
  @IsNotEmpty()
  password: string;
}
