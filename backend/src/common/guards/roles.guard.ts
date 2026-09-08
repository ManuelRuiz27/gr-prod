import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccountRole } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AccountRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: { role: AccountRole; status?: string } }>();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException({
        code: 'AUTH_FORBIDDEN',
        message: 'Acceso denegado: Usuario no autenticado.',
      });
    }

    if (user.status && user.status !== 'ACTIVE') {
      throw new ForbiddenException({
        code: 'ACCOUNT_DISABLED',
        message: 'Acceso denegado: La cuenta se encuentra desactivada.',
      });
    }

    const hasRole = user.role && requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException({
        code: 'FORBIDDEN_ROLE',
        message: `Acceso denegado: Rol requerido (${requiredRoles.join(', ')}).`,
      });
    }

    return true;
  }
}
