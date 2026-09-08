import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit/audit.service';
import { IdempotencyService } from './idempotency/idempotency.service';
import { IdempotencyInterceptor } from './idempotency/idempotency.interceptor';
import { OwnershipService } from './auth/ownership.service';
import { RolesGuard } from './guards/roles.guard';

@Global()
@Module({
  providers: [
    AuditService,
    IdempotencyService,
    IdempotencyInterceptor,
    RolesGuard,
    OwnershipService,
  ],
  exports: [
    AuditService,
    IdempotencyService,
    IdempotencyInterceptor,
    RolesGuard,
    OwnershipService,
  ],
})
export class CommonModule {}
