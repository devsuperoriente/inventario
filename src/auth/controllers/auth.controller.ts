import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service.js';
import { User } from '../../users/entities/user.entity.js';
import { use } from 'passport';
import { access } from 'fs';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req: any) {
    const user = req.user as User;
    const access_token = await this.authService.generateToken(user);
    return {
      user,
      ...access_token
    };
  }
}
