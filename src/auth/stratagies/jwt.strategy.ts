import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { Env } from '../../env.model.js';
import { Payload } from '../models/payload.js';
import { AuthService } from '../services/auth.service.js';
import { UnauthorizedException } from '@nestjs/common';

function extractTokenFromCookie(req: Request): string | null {
  return req?.cookies?.access_token ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService<Env>,
    private readonly authService: AuthService,
  ) {
    const secret = configService.get('JWT_SECRET', { infer: true });

    if (!secret) {
      throw new Error('JWT_SECRET is not set');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractTokenFromCookie, ExtractJwt.fromAuthHeaderAsBearerToken()]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: Payload) {
    if (!(await this.authService.isSessionActive(payload.sub, payload.sid))) {
      throw new UnauthorizedException('Sesión inválida o cerrada');
    }
    const permissions = await this.authService.getUserPermissions(payload.sub);
    return { ...payload, permissions };
  }
}
