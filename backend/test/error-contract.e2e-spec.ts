import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  Controller,
  Module,
  Get,
  Post,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { IdempotencyInterceptor } from '../src/common/idempotency/idempotency.interceptor';
import { Idempotent } from '../src/common/idempotency/idempotent.decorator';
import { Public } from '../src/auth/public.decorator';
import { Prisma } from '@prisma/client';
import {
  TableCapacityChangedException,
  ConcurrentModificationException,
  BusinessInvariantViolationException,
  EventNotOperableException,
  RateLimitedException,
  ResourceNotFoundException,
} from '../src/common/errors';
import { InvalidStateTransitionException } from '../src/common/state-machines';
import { ErrorCode } from '../src/common/errors/error-codes';

@Public()
@Controller('test-error-contract')
class TestErrorContractController {
  @Get('unhandled-500')
  unhandled500() {
    throw new Error('FATAL: SELECT password_hash FROM "accounts" WHERE id="admin" at C:\\backend\\src\\db.ts:123');
  }

  @Get('prisma-p2002')
  prismaP2002() {
    throw new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed on the fields: (`email`) in table `accounts`',
      {
        code: 'P2002',
        clientVersion: '5.20.0',
        meta: { target: ['email'], table: 'accounts' },
      },
    );
  }

  @Get('prisma-p2025')
  prismaP2025() {
    throw new Prisma.PrismaClientKnownRequestError(
      'An operation failed because it depends on one or more records that were required but not found. Record to update not found.',
      {
        code: 'P2025',
        clientVersion: '5.20.0',
      },
    );
  }

  @Get('invalid-transition')
  invalidTransition() {
    throw new InvalidStateTransitionException('Event', 'COMPLETED', 'DRAFT');
  }

  @Get('table-capacity-changed')
  tableCapacity() {
    throw new TableCapacityChangedException(
      'La disponibilidad de la mesa cambió. Actualiza el croquis e intenta nuevamente.',
      {
        tableId: 'tbl-999',
        capacity: 10,
        requestedCount: 11,
      },
    );
  }

  @Get('concurrent-modification')
  concurrentMod() {
    throw new ConcurrentModificationException(
      'El recurso fue modificado concurrentemente por otra solicitud.',
    );
  }

  @Get('business-invariant')
  businessInvariant() {
    throw new BusinessInvariantViolationException(
      'No es posible registrar un pago sobre un contrato cancelado.',
    );
  }

  @Get('event-not-operable')
  eventNotOperable() {
    throw new EventNotOperableException(
      'El evento no se encuentra en un estado operable para esta acción.',
      {
        status: 'CANCELLED',
      },
    );
  }

  @Get('rate-limited')
  rateLimited() {
    throw new RateLimitedException();
  }

  @Get('idor-target')
  idorTarget() {
    throw new ResourceNotFoundException('Recurso no encontrado.');
  }

  @Post('idempotent-action')
  @UseInterceptors(IdempotencyInterceptor)
  @Idempotent(true)
  idempotentAction(@Body() body: any) {
    return { success: true, processedBody: body };
  }
}

@Module({
  imports: [AppModule],
  controllers: [TestErrorContractController],
})
class TestErrorContractModule {}

jest.setTimeout(60000);

describe('Error Contract & Zero-Leakage Sanitization (e2e)', () => {
  let app: INestApplication;
  let _prisma: PrismaService;

  let _adminToken: string;
  let graduateToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestErrorContractModule],
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

    _prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Login admin
    const adminLoginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@plataformagr.com',
        password: 'AdminPass123!',
      });
    _adminToken = adminLoginRes.body?.accessToken;

    // Login graduate
    const gradLoginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'andrea.martinez@ejemplo.com',
        password: 'GraduatePass123!',
      });
    graduateToken = gradLoginRes.body?.accessToken;
  }, 60000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  // Helper to verify canonical envelope integrity
  const assertCanonicalEnvelope = (
    res: request.Response,
    expectedStatus: number,
    expectedCode: string,
  ) => {
    expect(res.status).toBe(expectedStatus);

    // X-Request-Id header must be present
    const headerRequestId = res.headers['x-request-id'];
    expect(typeof headerRequestId).toBe('string');
    expect(headerRequestId.length).toBeGreaterThan(0);

    // Body structure must strictly adhere to { error: { code, message, request_id, details } }
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', expectedCode);
    expect(typeof res.body.error.message).toBe('string');
    expect(res.body.error.message.length).toBeGreaterThan(0);
    expect(res.body.error.request_id).toBe(headerRequestId);
    expect(res.body.error).toHaveProperty('details');

    // Disallow top-level leakage / duplicate fields
    expect(res.body).not.toHaveProperty('code');
    expect(res.body).not.toHaveProperty('message');
    expect(res.body).not.toHaveProperty('statusCode');
    expect(res.body).not.toHaveProperty('request_id');
  };

  // =========================================================================
  // 1. 401 UNAUTHENTICATED
  // =========================================================================
  describe('1. 401 UNAUTHENTICATED', () => {
    it('returns canonical 401 UNAUTHENTICATED on missing bearer token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/me/profile')
        .expect(401);

      assertCanonicalEnvelope(res, 401, ErrorCode.UNAUTHENTICATED);
      expect(res.body.error.message).toBe('Autenticación requerida para acceder al recurso.');
    });

    it('returns canonical 401 UNAUTHENTICATED on malformed bearer token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/me/profile')
        .set('Authorization', 'Bearer invalid.token.value')
        .expect(401);

      assertCanonicalEnvelope(res, 401, ErrorCode.UNAUTHENTICATED);
    });
  });

  // =========================================================================
  // 2. 403 FORBIDDEN
  // =========================================================================
  describe('2. 403 FORBIDDEN', () => {
    it('returns canonical 403 FORBIDDEN when GRADUATE calls admin endpoints', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/events')
        .set('Authorization', `Bearer ${graduateToken}`)
        .expect(403);

      assertCanonicalEnvelope(res, 403, 'FORBIDDEN_ROLE');
      expect(res.body.error.message).toContain('Acceso denegado');
    });
  });

  // =========================================================================
  // 3. 404 IDOR-Safe RESOURCE_NOT_FOUND
  // =========================================================================
  describe('3. 404 IDOR-Safe RESOURCE_NOT_FOUND', () => {
    it('returns uniform 404 without disclosing whether the resource exists or belongs to another entity', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/test-error-contract/idor-target')
        .expect(404);

      assertCanonicalEnvelope(res, 404, ErrorCode.RESOURCE_NOT_FOUND);
      expect(res.body.error.message).toBe('Recurso no encontrado.');

      // Assure no sensitive internal ID or table hint is returned in details
      expect(res.body.error.details).toEqual({});
    });

    it('sanitizes Prisma P2025 record not found to canonical 404', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/test-error-contract/prisma-p2025')
        .expect(404);

      assertCanonicalEnvelope(res, 404, ErrorCode.RESOURCE_NOT_FOUND);
      expect(res.body.error.message).toBe('El recurso solicitado no fue encontrado.');
    });
  });

  // =========================================================================
  // 4. 409 INVALID_STATE_TRANSITION & Domain Guards
  // =========================================================================
  describe('4. 409 INVALID_STATE_TRANSITION & Domain Guard Errors', () => {
    it('returns canonical 409 INVALID_STATE_TRANSITION with machine details', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/test-error-contract/invalid-transition')
        .expect(409);

      assertCanonicalEnvelope(res, 409, ErrorCode.INVALID_STATE_TRANSITION);
      expect(res.body.error.details).toMatchObject({
        entity: 'Event',
        fromState: 'COMPLETED',
        toState: 'DRAFT',
      });
    });

    it('returns canonical 409 TABLE_CAPACITY_CHANGED on seat race condition', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/test-error-contract/table-capacity-changed')
        .expect(409);

      assertCanonicalEnvelope(res, 409, ErrorCode.TABLE_CAPACITY_CHANGED);
      expect(res.body.error.details).toMatchObject({
        tableId: 'tbl-999',
        capacity: 10,
        requestedCount: 11,
      });
    });

    it('returns canonical 409 CONCURRENT_MODIFICATION on transactional conflicts', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/test-error-contract/concurrent-modification')
        .expect(409);

      assertCanonicalEnvelope(res, 409, ErrorCode.CONCURRENT_MODIFICATION);
    });

    it('sanitizes Prisma P2002 unique constraint to canonical 409 CONFLICT without leaking DB internals', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/test-error-contract/prisma-p2002')
        .expect(409);

      assertCanonicalEnvelope(res, 409, ErrorCode.CONFLICT);
      expect(res.body.error.message).toBe(
        'El recurso ya existe o entra en conflicto con un registro existente.',
      );

      // Verify zero DB schema leakage: table names, column names, prisma syntax must NOT leak
      const rawString = JSON.stringify(res.body);
      expect(rawString).not.toContain('accounts');
      expect(rawString).not.toContain('P2002');
      expect(rawString).not.toContain('prisma');
    });
  });

  // =========================================================================
  // 5. 409 IDEMPOTENCY_KEY_REUSED & 400 IDEMPOTENCY_KEY_REQUIRED
  // =========================================================================
  describe('5. Idempotency Conflicts (IDEMPOTENCY_KEY_REUSED)', () => {
    const uniqueKey = `e2e-idem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    it('requires Idempotency-Key header when configured with required: true', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/test-error-contract/idempotent-action')
        .send({ payload: 'initial' })
        .expect(400);

      assertCanonicalEnvelope(res, 400, ErrorCode.IDEMPOTENCY_KEY_REQUIRED);
    });

    it('executes initially with a fresh idempotency key and returns 201/200', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/test-error-contract/idempotent-action')
        .set('Idempotency-Key', uniqueKey)
        .send({ amount: 1500, concept: 'graduation_fee' })
        .expect(201);

      expect(res.body).toEqual({
        success: true,
        processedBody: { amount: 1500, concept: 'graduation_fee' },
      });
    });

    it('returns cached response when replayed with EXACT same payload', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/test-error-contract/idempotent-action')
        .set('Idempotency-Key', uniqueKey)
        .send({ amount: 1500, concept: 'graduation_fee' })
        .expect(201);

      expect(res.body).toEqual({
        success: true,
        processedBody: { amount: 1500, concept: 'graduation_fee' },
      });
    });

    it('rejects with 409 IDEMPOTENCY_KEY_REUSED when replayed with DIFFERENT payload', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/test-error-contract/idempotent-action')
        .set('Idempotency-Key', uniqueKey)
        .send({ amount: 9999, concept: 'different_tampered_payload' })
        .expect(409);

      assertCanonicalEnvelope(res, 409, ErrorCode.IDEMPOTENCY_KEY_REUSED);
      expect(res.body.error.message).toContain('clave de idempotencia');
    });
  });

  // =========================================================================
  // 6. 422 BUSINESS_INVARIANT_VIOLATION & Domain Invariants
  // =========================================================================
  describe('6. 422 Unprocessable Invariants', () => {
    it('returns canonical 422 BUSINESS_INVARIANT_VIOLATION', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/test-error-contract/business-invariant')
        .expect(422);

      assertCanonicalEnvelope(res, 422, ErrorCode.BUSINESS_INVARIANT_VIOLATION);
      expect(res.body.error.message).toBe('No es posible registrar un pago sobre un contrato cancelado.');
    });

    it('returns canonical 422 EVENT_NOT_OPERABLE when event lifecycle forbids operations', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/test-error-contract/event-not-operable')
        .expect(422);

      assertCanonicalEnvelope(res, 422, ErrorCode.EVENT_NOT_OPERABLE);
      expect(res.body.error.details).toMatchObject({
        status: 'CANCELLED',
      });
    });
  });

  // =========================================================================
  // 7. 429 RATE_LIMITED
  // =========================================================================
  describe('7. 429 RATE_LIMITED', () => {
    it('returns canonical 429 RATE_LIMITED with safe throttle message', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/test-error-contract/rate-limited')
        .expect(429);

      assertCanonicalEnvelope(res, 429, ErrorCode.RATE_LIMITED);
      expect(res.body.error.message).toContain('Límite');
    });
  });

  // =========================================================================
  // 8. 400 VALIDATION_ERROR (class-validator)
  // =========================================================================
  describe('8. 400 VALIDATION_ERROR', () => {
    it('transforms class-validator errors into canonical VALIDATION_ERROR format without internal details', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'not-an-email-address',
          // password missing
        })
        .expect(400);

      assertCanonicalEnvelope(res, 400, ErrorCode.VALIDATION_ERROR);
      expect(typeof res.body.error.details).toBe('object');
      expect(Array.isArray(res.body.error.details.validation_errors)).toBe(true);
      expect(res.body.error.details.validation_errors.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 9. 500 Zero-Leakage Sanitization Guarantee
  // =========================================================================
  describe('9. 500 INTERNAL_ERROR Zero-Leakage Sanitization', () => {
    it('completely strips SQL syntax, table names, file paths and stack traces', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/test-error-contract/unhandled-500')
        .expect(500);

      assertCanonicalEnvelope(res, 500, ErrorCode.INTERNAL_ERROR);
      expect(res.body.error.message).toBe('Ha ocurrido un error interno en el servidor.');
      expect(res.body.error.details).toEqual({});

      // Strict zero leakage assertion across the whole JSON payload
      const serialized = JSON.stringify(res.body);
      expect(serialized).not.toContain('password_hash');
      expect(serialized).not.toContain('accounts');
      expect(serialized).not.toContain('SELECT');
      expect(serialized).not.toContain('WHERE');
      expect(serialized).not.toContain('db.ts');
      expect(serialized).not.toContain('stack');
      expect(serialized).not.toContain('FATAL');
    });
  });
});
