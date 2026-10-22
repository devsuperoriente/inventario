import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from '../services/auth.service.js';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    createSession: vi.fn().mockResolvedValue({
      access_token: 'jwt-token',
      refresh_token: 'refresh-token',
      permissions: ['*'],
    }),
    refreshSession: vi.fn().mockResolvedValue({
      access_token: 'new-jwt-token',
      refresh_token: 'new-refresh-token',
      permissions: ['*'],
    }),
    revokeRefreshToken: vi.fn().mockResolvedValue(undefined),
    getUserPermissions: vi.fn().mockResolvedValue(['*']),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns the JWT as a string in access_token', async () => {
    const cookie = vi.fn();
    const response = await controller.login({ user: { id: 1 } as any }, { cookie } as any);

    expect(response).not.toHaveProperty('access_token');
    expect(cookie).toHaveBeenCalledWith('access_token', 'jwt-token', expect.objectContaining({ httpOnly: true, path: '/' }));
    expect(cookie).toHaveBeenCalledWith('refresh_token', 'refresh-token', expect.objectContaining({ httpOnly: true, path: '/auth' }));
  });

  it('rotates both authentication cookies when refreshing', async () => {
    const cookie = vi.fn();
    const response = await controller.refresh({ cookies: { refresh_token: 'old-refresh-token' } }, { cookie } as any);

    expect(authService.refreshSession).toHaveBeenCalledWith('old-refresh-token');
    expect(cookie).toHaveBeenCalledWith('access_token', 'new-jwt-token', expect.objectContaining({ httpOnly: true, path: '/' }));
    expect(cookie).toHaveBeenCalledWith('refresh_token', 'new-refresh-token', expect.objectContaining({ httpOnly: true, path: '/auth' }));
    expect(response).not.toHaveProperty('access_token');
    expect(response).not.toHaveProperty('refresh_token');
  });

  it('rejects refresh when the cookie is missing', async () => {
    await expect(controller.refresh({}, { cookie: vi.fn() } as any)).rejects.toThrow('Refresh token requerido');
  });

  it('revokes the session and clears its refresh cookie on logout', async () => {
    const response = { clearCookie: vi.fn() };

    await controller.logout({ cookies: { refresh_token: 'refresh-token' } }, response as any);

    expect(authService.revokeRefreshToken).toHaveBeenCalledWith('refresh-token');
    expect(response.clearCookie).toHaveBeenCalledWith('refresh_token', expect.objectContaining({ path: '/auth' }));
    expect(response.clearCookie).toHaveBeenCalledWith('access_token', expect.objectContaining({ path: '/' }));
  });
});
