import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit/audit.service';
import { IdempotencyService } from './idempotency/idempotency.service';
import { IdempotencyInterceptor } from './idempotency/idempotency.interceptor';
import { OwnershipService } from './auth/ownership.service';
import { RolesGuard } from './guards/roles.guard';
import { StateMachinesModule } from './state-machines/state-machines.module';
import { OutboxModule } from './outbox/outbox.module';
import { RealtimeModule } from './realtime/realtime.module';

@Global()
@Module({
  imports: [StateMachinesModule, OutboxModule, RealtimeModule],
  providers: [
    AuditService,
    IdempotencyService,
    IdempotencyInterceptor,
    RolesGuard,
    OwnershipService,
  ],
  exports: [
    StateMachinesModule,
    OutboxModule,
    RealtimeModule,
    AuditService,
    IdempotencyService,
    IdempotencyInterceptor,
    RolesGuard,
    OwnershipService,
  ],
})
export class CommonModule {}
