import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthService } from './auth/local/local.auth.service';
import { LocalAuthGuard } from './auth/local/local.guard';

@Controller()
export class AppController {
  constructor(private readonly authService: LocalAuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/public')
  async public() {
    return { message: 'public' };
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
