import { Module, Global } from '@nestjs/common';
import { DomainStateGuardService } from './domain-state-guard.service';

@Global()
@Module({
  providers: [DomainStateGuardService],
  exports: [DomainStateGuardService],
})
export class StateMachinesModule {}
