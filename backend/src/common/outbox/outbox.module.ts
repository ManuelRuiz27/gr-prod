import { Module, Global } from '@nestjs/common';
import { OutboxService } from './outbox.service';
import { RealtimeModule } from '../realtime/realtime.module';

@Global()
@Module({
  imports: [RealtimeModule],
  providers: [OutboxService],
  exports: [OutboxService],
})
export class OutboxModule {}
