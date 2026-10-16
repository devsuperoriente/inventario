import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Env } from '../../env.model.js';
import { Payload } from '../models/payload.js';

@Injectable() // <-- ¡Muy importante para que NestJS la reconozca!
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService<Env>) {
    const secret = configService.get('JWT_SECRET',{ infer: true });
    if(!secret){
      throw new Error('JWT_SECRET is not set')
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: Payload) {
    return payload;
  }
}
