import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRED_PERMISSIONS } from '../decorators/require-permissions.decorator.js';
import { RolesGuard } from './roles.guard.js';

describe('RolesGuard', () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  function makeContext(permissions: string[]): ExecutionContext {
    const handler = () => undefined;
    const controller = class {};
    Reflect.defineMetadata(REQUIRED_PERMISSIONS, ['orders:create'], handler);

    return {
      getHandler: () => handler,
      getClass: () => controller,
      switchToHttp: () => ({
        getRequest: () => ({ user: { permissions } }),
      }),
    } as ExecutionContext;
  }

  it('allows a matching permission', () => {
    expect(guard.canActivate(makeContext(['orders:create']))).toBe(true);
  });

  it('allows the wildcard permission', () => {
    expect(guard.canActivate(makeContext(['*']))).toBe(true);
  });

  it('rejects missing permissions', () => {
    expect(() => guard.canActivate(makeContext(['batches:manage']))).toThrow('No tienes permisos');
  });
});
