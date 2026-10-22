import { Controller, Post, UseGuards, Request, Res, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service.js';
import { User } from '../../users/entities/user.entity.js';
import type { Response } from 'express';

const REFRESH_COOKIE_NAME = 'refresh_token';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const ACCESS_COOKIE_NAME = 'access_token';
const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 1000;

interface RefreshRequest {
  cookies?: Record<string, string | undefined>;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req: { user: User }, @Res({ passthrough: true }) response: Response) {
    const user = req.user as User;
    const session = await this.authService.createSession(user.id);
    this.setRefreshCookie(response, session.refresh_token);
    this.setAccessCookie(response, session.access_token);
    return {
      user,
      permissions: session.permissions,
    };
  }

  @Post('refresh')
  async refresh(@Request() req: RefreshRequest, @Res({ passthrough: true }) response: Response) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token requerido');
    }

    const session = await this.authService.refreshSession(refreshToken);
    this.setRefreshCookie(response, session.refresh_token);
    this.setAccessCookie(response, session.access_token);

    return {
      user: session.user,          // <-- ¡Ahora sí existe y se envía al frontend!
      permissions: session.permissions,
    };
  }

  @Post('logout')
  async logout(@Request() req: RefreshRequest, @Res({ passthrough: true }) response: Response) {
    await this.authService.revokeRefreshToken(req.cookies?.[REFRESH_COOKIE_NAME]);
    response.clearCookie(REFRESH_COOKIE_NAME, this.getRefreshCookieOptions());
    response.clearCookie(ACCESS_COOKIE_NAME, this.getAccessCookieOptions());
    return { message: 'Sesión cerrada correctamente' };
  }

  private setAccessCookie(response: Response, accessToken: string): void {
    response.cookie(ACCESS_COOKIE_NAME, accessToken, {
      ...this.getAccessCookieOptions(),
      maxAge: ACCESS_COOKIE_MAX_AGE,
    });
  }

  private setRefreshCookie(response: Response, refreshToken: string): void {
    response.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      ...this.getRefreshCookieOptions(),
      maxAge: REFRESH_COOKIE_MAX_AGE,
    });
  }

  private getRefreshCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/auth',
    };
  }

  private getAccessCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };
  }
}
