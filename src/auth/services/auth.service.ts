import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service.js';
import { JwtService } from '@nestjs/jwt';
import { Payload } from '../models/payload.js';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findUserByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }
    const isMacth = await this.usersService.checkPassword(pass, user.password);
    if (isMacth) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async generateToken(user: any) {
    const payload : Payload = { sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
