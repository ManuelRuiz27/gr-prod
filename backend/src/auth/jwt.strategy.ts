import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { ActorContext } from '../common/auth/actor-context.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'gr-secret-key-change-in-prod-2026',
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException({
        code: 'AUTH_UNAUTHORIZED',
        message: 'Sesión inválida o expirada.',
      });
    }

    const actor: ActorContext = {
      actorType: user.role === 'ADMIN' ? 'ADMIN' : 'GRADUATE',
      accountId: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      membershipId: payload.membership_id,
      eventId: payload.event_id,
      requestId: req?.headers?.['x-request-id'] as string | undefined,
    };

    req.actor = actor;

    return {
      ...user,
      membership_id: payload.membership_id,
      event_id: payload.event_id,
      actor,
    };
  }
}
