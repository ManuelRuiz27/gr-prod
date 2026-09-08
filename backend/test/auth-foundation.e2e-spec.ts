import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import {
  AccountRole,
  AccountStatus,
  EventStatus,
  GraduateMembershipStatus,
  EventAccessCodeStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

jest.setTimeout(60000);

describe('Auth Foundation & Authorization Matrix (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;

  const canonicalEventId = 'e0000000-0000-0000-0000-000000000001';
  const testRunId = Date.now().toString().slice(-6);

  // Accounts created during tests to clean up
  const cleanupAccountIds: string[] = [];
  const cleanupEventIds: string[] = [];

  const hashSha256 = (token: string): string =>
    crypto.createHash('sha256').update(token).digest('hex');

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api/v1');
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwt = moduleFixture.get<JwtService>(JwtService);
  }, 60000);

  afterAll(async () => {
    // Teardown created test data
    if (cleanupAccountIds.length > 0) {
      try {
        await prisma.passwordResetToken.deleteMany({
          where: { account_id: { in: cleanupAccountIds } },
        });
        await prisma.authSession.deleteMany({
          where: { account_id: { in: cleanupAccountIds } },
        });
        await prisma.groupMember.deleteMany({
          where: { membership: { account_id: { in: cleanupAccountIds } } },
        });
        await prisma.graduateContract.deleteMany({
          where: { membership: { account_id: { in: cleanupAccountIds } } },
        });
        await prisma.paymentPlan.deleteMany({
          where: { membership: { account_id: { in: cleanupAccountIds } } },
        });
        await prisma.graduateMembership.deleteMany({
          where: { account_id: { in: cleanupAccountIds } },
        });
        // Note: accounts with audit logs cannot be deleted due to append-only audit_logs trigger
      } catch {
        // Ignore teardown FK conflicts
      }
    }

    if (cleanupEventIds.length > 0) {
      await prisma.eventAccessCode.deleteMany({
        where: { event_id: { in: cleanupEventIds } },
      });
      await prisma.eventSettings.deleteMany({
        where: { event_id: { in: cleanupEventIds } },
      });
      await prisma.event.deleteMany({
        where: { id: { in: cleanupEventIds } },
      });
    }

    if (app) {
      await app.close();
    }
  }, 30000);

  // =========================================================================
  // 1. Valid Login
  // =========================================================================
  describe('1. Valid Login (authLogin)', () => {
    it('authenticates active user and returns accessToken, refreshToken and memberships', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@plataformagr.com',
          password: 'AdminPass123!',
        })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user).toMatchObject({
        email: 'admin@plataformagr.com',
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      const decoded = jwt.decode(res.body.accessToken) as { sub: string; role: string };
      expect(decoded.sub).toBe(res.body.user.id);
      expect(decoded.role).toBe('ADMIN');
    });
  });

  // =========================================================================
  // 2. Invalid Login
  // =========================================================================
  describe('2. Invalid Login (authLogin)', () => {
    it('rejects wrong password with 401 INVALID_CREDENTIALS', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@plataformagr.com',
          password: 'WrongPassword999!',
        })
        .expect(401);

      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('rejects non-existent email with 401 INVALID_CREDENTIALS', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: `nonexistent_${testRunId}@test.com`,
          password: 'Password123!',
        })
        .expect(401);

      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  // =========================================================================
  // 3. Disabled Account
  // =========================================================================
  describe('3. Disabled Account Enforcement', () => {
    let disabledUserEmail: string;
    let disabledUserId: string;
    let disabledUserToken: string;
    let disabledUserRefresh: string;

    beforeAll(async () => {
      disabledUserEmail = `disabled_${testRunId}@test.com`;
      const pwdHash = await bcrypt.hash('Secret123!', 10);
      const user = await prisma.account.create({
        data: {
          email: disabledUserEmail,
          email_normalized: disabledUserEmail.toLowerCase(),
          password_hash: pwdHash,
          full_name: 'Disabled User',
          phone_e164: '+525500009999',
          role: AccountRole.GRADUATE,
          status: AccountStatus.DISABLED,
        },
      });
      disabledUserId = user.id;
      cleanupAccountIds.push(disabledUserId);

      // Create dummy active user to generate token, then disable it
      const activeThenDisabledEmail = `temp_disabled_${testRunId}@test.com`;
      const tempUser = await prisma.account.create({
        data: {
          email: activeThenDisabledEmail,
          email_normalized: activeThenDisabledEmail.toLowerCase(),
          password_hash: pwdHash,
          full_name: 'Temp Disabled',
          role: AccountRole.GRADUATE,
          status: AccountStatus.ACTIVE,
        },
      });
      cleanupAccountIds.push(tempUser.id);

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: activeThenDisabledEmail,
          password: 'Secret123!',
        });
      disabledUserToken = loginRes.body.accessToken;
      disabledUserRefresh = loginRes.body.refreshToken;

      // Now disable the account
      await prisma.account.update({
        where: { id: tempUser.id },
        data: { status: AccountStatus.DISABLED },
      });
    }, 60000);

    it('rejects login for DISABLED account with 401 ACCOUNT_DISABLED', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: disabledUserEmail,
          password: 'Secret123!',
        })
        .expect(401);

      expect(res.body.error.code).toBe('ACCOUNT_DISABLED');
    });

    it('rejects refresh for subsequently DISABLED account with 401 ACCOUNT_DISABLED', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: disabledUserRefresh })
        .expect(401);

      expect(res.body.error.code).toBe('ACCOUNT_DISABLED');
    });

    it('rejects protected endpoint access for subsequently DISABLED account with 401 ACCOUNT_DISABLED', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/me/profile')
        .set('Authorization', `Bearer ${disabledUserToken}`)
        .expect(401);

      expect(res.body.error.code).toBe('ACCOUNT_DISABLED');
    });
  });

  // =========================================================================
  // 4 & 5. Refresh Token Rotation & Reuse Detection
  // =========================================================================
  describe('4 & 5. Refresh Token Rotation & Reuse Detection', () => {
    let testUserEmail: string;
    let testUserId: string;
    let initialRefreshToken: string;
    let rotatedRefreshToken: string;

    beforeAll(async () => {
      testUserEmail = `rotation_${testRunId}@test.com`;
      const pwdHash = await bcrypt.hash('RotationPass123!', 10);
      const user = await prisma.account.create({
        data: {
          email: testUserEmail,
          email_normalized: testUserEmail.toLowerCase(),
          password_hash: pwdHash,
          full_name: 'Rotation User',
          role: AccountRole.GRADUATE,
          status: AccountStatus.ACTIVE,
        },
      });
      testUserId = user.id;
      cleanupAccountIds.push(testUserId);

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUserEmail,
          password: 'RotationPass123!',
        })
        .expect(200);

      initialRefreshToken = loginRes.body.refreshToken;
    }, 60000);

    it('4. rotates refresh token: revokes old session and creates new session', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: initialRefreshToken })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.refreshToken).not.toBe(initialRefreshToken);

      rotatedRefreshToken = res.body.refreshToken;

      // Verify old session in DB is revoked
      const oldHash = hashSha256(initialRefreshToken);
      const oldSession = await prisma.authSession.findUnique({
        where: { refresh_token_hash: oldHash },
      });
      expect(oldSession).not.toBeNull();
      expect(oldSession?.revoked_at).not.toBeNull();

      // Verify new session is active
      const newHash = hashSha256(rotatedRefreshToken);
      const newSession = await prisma.authSession.findUnique({
        where: { refresh_token_hash: newHash },
      });
      expect(newSession).not.toBeNull();
      expect(newSession?.revoked_at).toBeNull();
    });

    it('5. reuse detection: reusing old/revoked token triggers immediate revocation of all sessions', async () => {
      // Re-submit the initial (already rotated) token
      const reuseRes = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: initialRefreshToken })
        .expect(401);

      expect(reuseRes.body.error.code).toBe('TOKEN_REUSE_DETECTED');

      // Verify that ALL sessions for this user were revoked
      const activeSessions = await prisma.authSession.findMany({
        where: { account_id: testUserId, revoked_at: null },
      });
      expect(activeSessions).toHaveLength(0);

      // Even the newly rotated token should now fail
      const failedRes = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: rotatedRefreshToken })
        .expect(401);

      expect(failedRes.body.error.code).toBe('TOKEN_REUSE_DETECTED');
    });
  });

  // =========================================================================
  // 6. Logout Revocation
  // =========================================================================
  describe('6. Logout Session Revocation (authLogout)', () => {
    it('revokes session on logout and rejects subsequent refresh', async () => {
      const email = `logout_${testRunId}@test.com`;
      const pwdHash = await bcrypt.hash('LogoutPass123!', 10);
      const user = await prisma.account.create({
        data: {
          email,
          email_normalized: email.toLowerCase(),
          password_hash: pwdHash,
          full_name: 'Logout User',
          role: AccountRole.GRADUATE,
          status: AccountStatus.ACTIVE,
        },
      });
      cleanupAccountIds.push(user.id);

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password: 'LogoutPass123!' })
        .expect(200);

      const { accessToken, refreshToken } = loginRes.body;

      // Logout with token
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      // Subsequent refresh must fail
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });
  });

  // =========================================================================
  // 7 & 8. Password Reset: One-Time Token & Active Session Revocation
  // =========================================================================
  describe('7 & 8. Password Reset: One-Time Token & Active Session Revocation', () => {
    let userEmail: string;
    let userId: string;
    let oldRefreshToken: string;
    let resetRawToken: string;

    beforeAll(async () => {
      userEmail = `pwreset_${testRunId}@test.com`;
      const pwdHash = await bcrypt.hash('OldPassword123!', 10);
      const user = await prisma.account.create({
        data: {
          email: userEmail,
          email_normalized: userEmail.toLowerCase(),
          password_hash: pwdHash,
          full_name: 'Password Reset User',
          role: AccountRole.GRADUATE,
          status: AccountStatus.ACTIVE,
        },
      });
      userId = user.id;
      cleanupAccountIds.push(userId);

      // Login to get an active session
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: userEmail, password: 'OldPassword123!' })
        .expect(200);
      oldRefreshToken = loginRes.body.refreshToken;

      // Insert reset token
      resetRawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashSha256(resetRawToken);
      await prisma.passwordResetToken.create({
        data: {
          account_id: userId,
          token_hash: tokenHash,
          expires_at: new Date(Date.now() + 3600000),
        },
      });
    }, 60000);

    it('7. confirms password reset, updates password, and consumes token (one-time use)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/password-reset/confirm')
        .send({
          token: resetRawToken,
          newPassword: 'BrandNewPassword123!',
        })
        .expect(200);

      expect(res.body.success).toBe(true);

      // Verify second attempt with the SAME token fails (one-time use)
      const repeatRes = await request(app.getHttpServer())
        .post('/api/v1/auth/password-reset/confirm')
        .send({
          token: resetRawToken,
          newPassword: 'EvenNewerPassword123!',
        })
        .expect(400);

      expect(repeatRes.body.error.code).toBe('INVALID_RESET_TOKEN');

      // Verify login with new password works
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: userEmail, password: 'BrandNewPassword123!' })
        .expect(200);
    });

    it('8. revokes all previously active sessions after password reset', async () => {
      // Trying to refresh with the session that existed before reset must fail
      const refreshRes = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: oldRefreshToken })
        .expect(401);

      expect(refreshRes.body.error.code).toBe('TOKEN_REUSE_DETECTED');
    });
  });

  // =========================================================================
  // 9. EventAccessCode Resolution & Validation
  // =========================================================================
  describe('9. EventAccessCode Resolution & Validation', () => {
    it('resolves active valid code and returns event data with signed access_token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/event-access/resolve')
        .send({ code: 'DER2027' })
        .expect(200);

      expect(res.body).toHaveProperty('access_token');
      expect(res.body.event).toMatchObject({
        id: canonicalEventId,
        status: 'OPEN',
      });

      const decoded = jwt.decode(res.body.access_token) as { scope: string; event_id: string };
      expect(decoded.scope).toBe('event_access');
      expect(decoded.event_id).toBe(canonicalEventId);
    });

    it('rejects invalid access code with 404 INVALID_ACCESS_CODE', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/event-access/resolve')
        .send({ code: 'INVALID-CODE-XYZ' })
        .expect(404);

      expect(res.body.error.code).toBe('INVALID_ACCESS_CODE');
    });

    it('rejects expired access code with 404 INVALID_ACCESS_CODE', async () => {
      // Create a separate test event to avoid breaking the 1-active-code constraint on canonicalEventId
      const testEvent = await prisma.event.create({
        data: {
          name: 'Evento Código Expirado ' + testRunId,
          date: new Date('2028-01-01'),
          venue: 'Test Venue',
          capacity: 50,
          status: EventStatus.OPEN,
        },
      });
      cleanupEventIds.push(testEvent.id);

      const expiredHash = await bcrypt.hash('EXPIRED123', 10);
      await prisma.eventAccessCode.create({
        data: {
          event_id: testEvent.id,
          code_hash: expiredHash,
          status: EventAccessCodeStatus.ACTIVE,
          expires_at: new Date(Date.now() - 60000), // in the past
        },
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/event-access/resolve')
        .send({ code: 'EXPIRED123' })
        .expect(404);

      expect(res.body.error.code).toBe('INVALID_ACCESS_CODE');
    });
  });

  // =========================================================================
  // 10. Account Takeover Prevention on Registration
  // =========================================================================
  describe('10. Account Takeover Prevention on Registration', () => {
    let validAccessToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/event-access/resolve')
        .send({ code: 'DER2027' })
        .expect(200);
      validAccessToken = res.body.access_token;
    }, 60000);

    it('blocks account takeover with 409 ACCOUNT_ALREADY_EXISTS if email is already registered', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/graduate/register')
        .set('Idempotency-Key', crypto.randomUUID())
        .send({
          event_id: canonicalEventId,
          full_name: 'Andrea Martinez Impersonator',
          email: 'andrea.martinez@ejemplo.com', // Already seeded account
          phone: '+525511223344',
          career: 'Derecho',
          generation: '2023-2027',
          password: 'NewPassword123!',
          access_token: validAccessToken,
        })
        .expect(409);

      expect(res.body.error.code).toBe('ACCOUNT_ALREADY_EXISTS');
    });

    it('rejects registration if access_token is missing with 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/graduate/register')
        .set('Idempotency-Key', crypto.randomUUID())
        .send({
          event_id: canonicalEventId,
          full_name: 'New Graduate',
          email: `unique_${testRunId}@test.com`,
          phone: '+525511223344',
          career: 'Derecho',
          generation: '2023-2027',
          password: 'Password123!',
        })
        .expect(400);
    });

    it('rejects registration if access_token has invalid signature with 401', async () => {
      const forgedToken = jwt.sign(
        { sub: '00000000-0000-0000-0000-000000000000', event_id: canonicalEventId, scope: 'event_access' },
        { secret: 'wrong-secret-key-123' },
      );

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/graduate/register')
        .set('Idempotency-Key', crypto.randomUUID())
        .send({
          event_id: canonicalEventId,
          full_name: 'New Graduate',
          email: `unique_${testRunId}@test.com`,
          phone: '+525511223344',
          career: 'Derecho',
          generation: '2023-2027',
          password: 'Password123!',
          access_token: forgedToken,
        })
        .expect(401);

      expect(res.body.error.code).toBe('INVALID_EVENT_ACCESS_TOKEN');
    });

    it('successfully registers new graduate with valid signed access_token', async () => {
      const newEmail = `fresh_graduate_${testRunId}@test.com`;
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/graduate/register')
        .set('Idempotency-Key', crypto.randomUUID())
        .send({
          event_id: canonicalEventId,
          full_name: 'Fresh Graduate',
          email: newEmail,
          phone: '+525511223344',
          career: 'Derecho',
          generation: '2023-2027',
          password: 'Password123!',
          access_token: validAccessToken,
        })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('membership');
      expect(res.body.user.email).toBe(newEmail);
      expect(res.body.membership.event_id).toBe(canonicalEventId);

      cleanupAccountIds.push(res.body.user.id);
    });
  });

  // =========================================================================
  // 11. Role Enforcement (RolesGuard)
  // =========================================================================
  describe('11. Role Enforcement (RolesGuard)', () => {
    let graduateToken: string;
    let adminToken: string;

    beforeAll(async () => {
      const gradRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'andrea.martinez@ejemplo.com',
          password: 'GraduatePass123!',
        })
        .expect(200);
      graduateToken = gradRes.body.accessToken;

      const adminRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@plataformagr.com',
          password: 'AdminPass123!',
        })
        .expect(200);
      adminToken = adminRes.body.accessToken;
    }, 60000);

    it('denies GRADUATE role access to Admin endpoints with 403 FORBIDDEN_ROLE', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/events')
        .set('Authorization', `Bearer ${graduateToken}`)
        .expect(403);

      expect(res.body.error.code).toBe('FORBIDDEN_ROLE');
    });

    it('allows ADMIN role access to Admin endpoints with 200 OK', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  // =========================================================================
  // 12. IDOR / Ownership Enforcement
  // =========================================================================
  describe('12. IDOR / Ownership Enforcement', () => {
    let graduateAToken: string;
    let foreignEventId: string;
    let foreignMemberId: string;

    beforeAll(async () => {
      // Graduate A
      const gradARes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'andrea.martinez@ejemplo.com',
          password: 'GraduatePass123!',
        })
        .expect(200);
      graduateAToken = gradARes.body.accessToken;

      // Foreign Event (Graduate A is NOT a member of this event)
      const foreignEvent = await prisma.event.create({
        data: {
          name: 'Evento Ajeno ' + testRunId,
          date: new Date('2028-01-01'),
          venue: 'Hotel Ajeno',
          capacity: 100,
          status: EventStatus.OPEN,
        },
      });
      foreignEventId = foreignEvent.id;
      cleanupEventIds.push(foreignEventId);

      // Graduate B in foreign event
      const gradBEmail = `graduate_b_${testRunId}@test.com`;
      const pwdHash = await bcrypt.hash('Pass123!', 10);
      const userB = await prisma.account.create({
        data: {
          email: gradBEmail,
          email_normalized: gradBEmail.toLowerCase(),
          password_hash: pwdHash,
          full_name: 'Graduate B',
          role: AccountRole.GRADUATE,
          status: AccountStatus.ACTIVE,
        },
      });
      cleanupAccountIds.push(userB.id);

      const membershipB = await prisma.graduateMembership.create({
        data: {
          event_id: foreignEventId,
          account_id: userB.id,
          status: GraduateMembershipStatus.ACTIVE,
          active_places: 1,
        },
      });

      const memberB = await prisma.groupMember.create({
        data: {
          membership_id: membershipB.id,
          full_name: 'Invitado de Graduate B',
          is_primary: true,
          is_active: true,
        },
      });
      foreignMemberId = memberB.id;
    }, 60000);

    it('denies Graduate A access to foreign event with 403 NOT_MEMBER_OF_EVENT', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/me/events/${foreignEventId}/summary`)
        .set('Authorization', `Bearer ${graduateAToken}`)
        .expect(403);

      expect(res.body.error.code).toBe('NOT_MEMBER_OF_EVENT');
    });

    it('denies Graduate A updating Graduate B group member with 403 OWNERSHIP_MISMATCH', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/me/events/${canonicalEventId}/group-members/${foreignMemberId}`)
        .set('Authorization', `Bearer ${graduateAToken}`)
        .send({ full_name: 'Hacked Name' })
        .expect(403);

      expect(res.body.error.code).toBe('OWNERSHIP_MISMATCH');
    });
  });

  // =========================================================================
  // 13. Anonymous Access Rejected
  // =========================================================================
  describe('13. Anonymous Access Rejected', () => {
    it('rejects unauthenticated request to /me/profile with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/me/profile')
        .expect(401);
    });

    it('rejects unauthenticated request to /admin/events with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/events')
        .expect(401);
    });
  });
});
