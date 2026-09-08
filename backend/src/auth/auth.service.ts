import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import {
  ResolveEventAccessDto,
  RegisterGraduateDto,
  LoginDto,
  RefreshTokenDto,
  PasswordResetRequestDto,
  PasswordResetConfirmDto,
} from './dto/auth.dto';
import {
  AccountRole,
  AccountStatus,
  EventStatus,
  GraduateMembershipStatus,
  ContractStatus,
  PaymentPlanStatus,
  EventAccessCodeStatus,
  Prisma,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async validateUser(userId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        email_normalized: true,
        full_name: true,
        phone_e164: true,
        role: true,
        status: true,
      },
    });

    if (!account || account.status !== AccountStatus.ACTIVE) {
      return null;
    }

    return account;
  }

  async resolveEventAccess(dto: ResolveEventAccessDto) {
    const trimmedCode = dto.code.trim();

    const codes = await this.prisma.eventAccessCode.findMany({
      where: {
        status: EventAccessCodeStatus.ACTIVE,
        OR: [
          { expires_at: null },
          { expires_at: { gte: new Date() } },
        ],
      },
      include: {
        event: {
          include: {
            settings: true,
            products: {
              where: { is_active: true },
              orderBy: { display_order: 'asc' },
            },
          },
        },
      },
    });

    let matchedCode: (typeof codes)[0] | null = null;

    for (const codeRecord of codes) {
      const isMatch = await bcrypt.compare(trimmedCode, codeRecord.code_hash);
      if (isMatch) {
        matchedCode = codeRecord;
        break;
      }
    }

    if (!matchedCode) {
      throw new NotFoundException({
        code: 'INVALID_ACCESS_CODE',
        message: 'El código de acceso proporcionado no es válido o ha expirado.',
      });
    }

    const event = matchedCode.event;
    if (event.status !== EventStatus.OPEN && event.status !== EventStatus.DRAFT) {
      throw new BadRequestException({
        code: 'EVENT_NOT_OPEN',
        message: 'El evento no se encuentra abierto para registros.',
      });
    }

    const access_token = this.jwtService.sign(
      {
        sub: matchedCode.id,
        event_id: event.id,
        scope: 'event_access',
      },
      { expiresIn: '2h' },
    );

    return {
      event: {
        id: event.id,
        name: event.name,
        date: event.date,
        venue: event.venue,
        status: event.status,
        capacity: event.capacity,
        timezone: event.timezone,
        settings: event.settings,
        products: event.products,
      },
      access_token,
    };
  }

  async registerGraduate(dto: RegisterGraduateDto) {
    const emailNormalized = dto.email.trim().toLowerCase();

    const event = await this.prisma.event.findUnique({
      where: { id: dto.event_id },
      include: { settings: true },
    });

    if (!event) {
      throw new NotFoundException({
        code: 'EVENT_NOT_FOUND',
        message: 'El evento solicitado no existe.',
      });
    }

    if (event.status !== EventStatus.OPEN && event.status !== EventStatus.DRAFT) {
      throw new BadRequestException({
        code: 'EVENT_NOT_OPEN',
        message: 'El evento no se encuentra disponible para registros.',
      });
    }

    let account = await this.prisma.account.findUnique({
      where: { email_normalized: emailNormalized },
    });

    if (account) {
      const isPasswordValid = await bcrypt.compare(dto.password, account.password_hash);
      if (!isPasswordValid) {
        throw new ConflictException({
          code: 'ACCOUNT_EXISTS_DIFFERENT_PASSWORD',
          message: 'Ya existe una cuenta con este correo pero la contraseña no coincide.',
        });
      }

      const existingMembership = await this.prisma.graduateMembership.findUnique({
        where: {
          event_id_account_id: {
            event_id: dto.event_id,
            account_id: account.id,
          },
        },
      });

      if (existingMembership) {
        throw new ConflictException({
          code: 'MEMBERSHIP_ALREADY_EXISTS',
          message: 'El usuario ya se encuentra registrado como graduado en este evento.',
        });
      }
    } else {
      const passwordHash = await bcrypt.hash(dto.password, 12);
      account = await this.prisma.account.create({
        data: {
          email: dto.email.trim(),
          email_normalized: emailNormalized,
          password_hash: passwordHash,
          full_name: dto.full_name.trim(),
          phone_e164: dto.phone.trim(),
          role: AccountRole.GRADUATE,
          status: AccountStatus.ACTIVE,
        },
      });
    }

    const folio = `CTR-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const { membership, contract, plan } = await this.prisma.$transaction(async (tx) => {
      const newMembership = await tx.graduateMembership.create({
        data: {
          event_id: dto.event_id,
          account_id: account.id,
          status: GraduateMembershipStatus.ACTIVE,
          active_places: 1,
        },
      });

      await tx.groupMember.create({
        data: {
          membership_id: newMembership.id,
          full_name: dto.full_name.trim(),
          is_primary: true,
          is_active: true,
        },
      });

      const newContract = await tx.graduateContract.create({
        data: {
          membership_id: newMembership.id,
          folio,
          terms_version: '1.0',
          terms_snapshot_hash: this.hashToken(event.name + event.date.toISOString()),
          status: ContractStatus.PENDING_ACCEPTANCE,
        },
      });

      const newPlan = await tx.paymentPlan.create({
        data: {
          event_id: dto.event_id,
          membership_id: newMembership.id,
          contracted_total: new Prisma.Decimal(0.00),
          status: PaymentPlanStatus.ACTIVE,
        },
      });

      await tx.outboxEvent.create({
        data: {
          event_type: 'membership.created',
          payload: {
            accountId: account.id,
            eventId: dto.event_id,
            membershipId: newMembership.id,
            email: account.email,
          },
        },
      });

      return { membership: newMembership, contract: newContract, plan: newPlan };
    });

    await this.auditService.log({
      eventId: dto.event_id,
      actorAccountId: account.id,
      actorName: account.full_name,
      action: 'membership.created',
      resourceType: 'GraduateMembership',
      resourceId: membership.id,
    });

    const tokens = await this.generateAuthSession(account, membership.id, dto.event_id);

    return {
      ...tokens,
      user: {
        id: account.id,
        email: account.email,
        full_name: account.full_name,
        phone: account.phone_e164,
        role: account.role,
        status: account.status,
      },
      membership: {
        id: membership.id,
        event_id: membership.event_id,
        status: membership.status,
        active_places: membership.active_places,
        contractId: contract.id,
        contractFolio: contract.folio,
        planId: plan.id,
      },
    };
  }

  async login(dto: LoginDto) {
    const emailNormalized = dto.email.trim().toLowerCase();

    const account = await this.prisma.account.findUnique({
      where: { email_normalized: emailNormalized },
      include: {
        memberships: {
          where: { status: GraduateMembershipStatus.ACTIVE },
          include: { event: true },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!account || account.status !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Correo electrónico o contraseña incorrectos.',
      });
    }

    const isPasswordValid = await bcrypt.compare(dto.password, account.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Correo electrónico o contraseña incorrectos.',
      });
    }

    const primaryMembership = account.memberships[0] || null;
    const eventId = primaryMembership?.event_id;
    const membershipId = primaryMembership?.id;

    const tokens = await this.generateAuthSession(account, membershipId, eventId);

    return {
      ...tokens,
      user: {
        id: account.id,
        email: account.email,
        full_name: account.full_name,
        phone: account.phone_e164,
        role: account.role,
        status: account.status,
      },
      activeMembership: primaryMembership
        ? {
            id: primaryMembership.id,
            event_id: primaryMembership.event_id,
            eventName: primaryMembership.event.name,
            status: primaryMembership.status,
            active_places: primaryMembership.active_places,
          }
        : null,
      allMemberships: account.memberships.map((m) => ({
        id: m.id,
        event_id: m.event_id,
        eventName: m.event.name,
        status: m.status,
      })),
    };
  }

  async refreshSession(dto: RefreshTokenDto) {
    let payload: any;
    try {
      payload = this.jwtService.verify(dto.refreshToken);
    } catch {
      throw new UnauthorizedException({
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Token de actualización inválido o expirado.',
      });
    }

    if (payload.scope !== 'refresh') {
      throw new UnauthorizedException({
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Tipo de token no válido para actualización.',
      });
    }

    const tokenHash = this.hashToken(dto.refreshToken);

    const session = await this.prisma.authSession.findFirst({
      where: {
        account_id: payload.sub,
        refresh_token_hash: tokenHash,
        revoked_at: null,
        expires_at: { gte: new Date() },
      },
      include: { account: true },
    });

    if (!session || session.account.status !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException({
        code: 'SESSION_REVOKED_OR_EXPIRED',
        message: 'La sesión no es válida o ha sido revocada.',
      });
    }

    await this.prisma.authSession.update({
      where: { id: session.id },
      data: { revoked_at: new Date() },
    });

    const tokens = await this.generateAuthSession(session.account);

    return {
      ...tokens,
      user: {
        id: session.account.id,
        email: session.account.email,
        full_name: session.account.full_name,
        role: session.account.role,
      },
    };
  }

  async logout(accountId: string, refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await this.prisma.authSession.updateMany({
        where: {
          account_id: accountId,
          refresh_token_hash: tokenHash,
          revoked_at: null,
        },
        data: { revoked_at: new Date() },
      });
    } else {
      await this.prisma.authSession.updateMany({
        where: {
          account_id: accountId,
          revoked_at: null,
        },
        data: { revoked_at: new Date() },
      });
    }

    return { success: true };
  }

  async requestPasswordReset(dto: PasswordResetRequestDto) {
    const emailNormalized = dto.email.trim().toLowerCase();
    const account = await this.prisma.account.findUnique({
      where: { email_normalized: emailNormalized },
    });

    if (account && account.status === AccountStatus.ACTIVE) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = this.hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 3600 * 1000);

      await this.prisma.passwordResetToken.create({
        data: {
          account_id: account.id,
          token_hash: tokenHash,
          expires_at: expiresAt,
        },
      });

      await this.prisma.outboxEvent.create({
        data: {
          event_type: 'password_reset.requested',
          payload: {
            accountId: account.id,
            email: account.email,
            token: rawToken,
          },
        },
      });
    }

    return {
      success: true,
      message: 'Si el correo electrónico está registrado, recibirás un enlace de restablecimiento.',
    };
  }

  async confirmPasswordReset(dto: PasswordResetConfirmDto) {
    const tokenHash = this.hashToken(dto.token);

    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        token_hash: tokenHash,
        used_at: null,
        expires_at: { gte: new Date() },
      },
    });

    if (!resetToken) {
      throw new BadRequestException({
        code: 'INVALID_RESET_TOKEN',
        message: 'El enlace de restablecimiento es inválido o ha expirado.',
      });
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.account.update({
        where: { id: resetToken.account_id },
        data: { password_hash: newPasswordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used_at: new Date() },
      }),
      this.prisma.authSession.updateMany({
        where: { account_id: resetToken.account_id, revoked_at: null },
        data: { revoked_at: new Date() },
      }),
    ]);

    return {
      success: true,
      message: 'Contraseña actualizada con éxito. Por favor inicia sesión.',
    };
  }

  private async generateAuthSession(account: any, membershipId?: string, eventId?: string) {
    const jwtPayload = {
      sub: account.id,
      email: account.email,
      role: account.role,
      membership_id: membershipId,
      event_id: eventId,
    };

    const accessToken = this.jwtService.sign(jwtPayload, { expiresIn: '1h' });

    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const refreshToken = this.jwtService.sign(
      { sub: account.id, scope: 'refresh', token: rawRefreshToken },
      { expiresIn: '30d' },
    );

    const refreshTokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000);

    await this.prisma.authSession.create({
      data: {
        account_id: account.id,
        refresh_token_hash: refreshTokenHash,
        expires_at: expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
