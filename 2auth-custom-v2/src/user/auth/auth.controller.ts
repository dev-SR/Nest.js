import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { SignInDto, SignUpDto } from '../dto/auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}
	@Get('/users')
	getUsers() {
		return this.authService.getUsers();
	}

	@Post('/signup')
	async signup(@Body() body: SignUpDto, @Res({ passthrough: true }) response: Response) {
		const token = await this.authService.signup(body);
		response.cookie('cookieToken', token, {
			httpOnly: true,
			expires: new Date(Date.now() + 1000 * 60 * 60 * 24)
		});
		return { accessToken: token };
	}

	@Post('/signin')
	async signin(@Body() body: SignInDto, @Res({ passthrough: true }) response: Response) {
		const token = await this.authService.signin(body);
		response.cookie('cookieToken', token, {
			httpOnly: true,
			expires: new Date(Date.now() + 1000 * 60 * 60 * 24)
		});
		return { accessToken: token };
	}

	@Post('/signout')
	async logout(@Res({ passthrough: true }) res: Response) {
		res.clearCookie('cookieToken');
		return {
			message: 'Logout successful!'
		};
	}
}
