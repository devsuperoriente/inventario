import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service.js';
import { JwtService } from '@nestjs/jwt';
import { Payload } from '../models/payload.js';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, MoreThan, Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity.js';
import { User } from '../../users/entities/user.entity.js';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokensRepository: Repository<RefreshToken>,
    private readonly dataSource: DataSource,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findUserByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }
    const isMacth = await this.usersService.checkPassword(pass, user.password);
    if (isMacth) {
      const { password: _password, ...result } = user;
      return result;
    }
    return null;
  }

  async generateToken(user: { id: number }, sessionId: string) {
    const payload: Payload = { sub: user.id, sid: sessionId };
    return this.jwtService.signAsync(payload);
  }

  async createSession(userId: number) {
    const refreshToken = this.createRefreshToken();
    const sessionId = randomUUID();
    const refreshTokenEntity = this.refreshTokensRepository.create({
      tokenHash: this.hashRefreshToken(refreshToken),
      sessionId,
      user: { id: userId },
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    const [accessToken, permissions] = await Promise.all([this.generateToken({ id: userId }, sessionId), this.getUserPermissions(userId), this.refreshTokensRepository.save(refreshTokenEntity)]);

    return { access_token: accessToken, refresh_token: refreshToken, permissions };
  }

  async refreshSession(refreshToken: string) {
    const tokenHash = this.hashRefreshToken(refreshToken);
    const nextRefreshToken = this.createRefreshToken();

    const { accessToken, permissions, user } = await this.dataSource.transaction(async (manager) => {
      const result = await manager
        .createQueryBuilder()
        .update(RefreshToken)
        .set({ revokedAt: () => 'CURRENT_TIMESTAMP' })
        .where('"token_hash" = :tokenHash', { tokenHash })
        .andWhere('"revoked_at" IS NULL')
        .andWhere('"expires_at" > CURRENT_TIMESTAMP')
        .returning('"user_id", "session_id"')
        .execute();

      const userId = Number(result.raw[0]?.user_id);
      const sessionId = result.raw[0]?.session_id as string | undefined;
      if (!userId || !sessionId) {
        throw new UnauthorizedException('Refresh token inválido o expirado');
      }

      // Buscamos permisos, generamos el access token y obtenemos el usuario en paralelo
      const [permissions, access, userEntity] = await Promise.all([this.getUserPermissions(userId), this.generateToken({ id: userId }, sessionId), manager.getRepository(User).findOne({ where: { id: userId } })]);

      if (!userEntity) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Excluimos la contraseña del objeto de usuario
      const { password: _password, ...userWithoutPassword } = userEntity;

      await manager.getRepository(RefreshToken).save({
        tokenHash: this.hashRefreshToken(nextRefreshToken),
        sessionId,
        user: { id: userId },
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      });

      return { accessToken: access, permissions, user: userWithoutPassword };
    });

    return {
      user,
      access_token: accessToken,
      refresh_token: nextRefreshToken,
      permissions,
    };
  }

  async revokeRefreshToken(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    await this.dataSource.transaction(async (manager) => {
      const token = await manager.getRepository(RefreshToken).findOne({
        where: { tokenHash: this.hashRefreshToken(refreshToken) },
        select: { id: true, sessionId: true },
      });
      if (!token) {
        return;
      }

      await manager.getRepository(RefreshToken).update({ sessionId: token.sessionId, revokedAt: IsNull() }, { revokedAt: new Date() });
    });
  }

  async isSessionActive(userId: number, sessionId: string): Promise<boolean> {
    if (!sessionId) {
      return false;
    }

    const token = await this.refreshTokensRepository.findOne({
      where: {
        user: { id: userId },
        sessionId,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      select: { id: true },
    });
    return token !== null;
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    return this.usersService.getPermissionsForUser(userId);
  }

  private createRefreshToken(): string {
    return randomBytes(32).toString('base64url');
  }

  private hashRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex');
  }
}
