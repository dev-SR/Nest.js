import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class SignUpDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@Matches(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/, {
		message: 'phone must be a valid phone number'
	})
	phone: string;
	// +8801799082929
	// 01799082929

	@IsEmail()
	email: string;

	@IsString()
	@MinLength(5)
	password: string;
}

export class SignInDto {
	@IsEmail()
	email: string;
	@IsString()
	@MinLength(5)
	password: string;
}
