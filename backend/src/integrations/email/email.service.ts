import { Injectable, Logger } from '@nestjs/common';
import { EmailAdapter, PasswordResetEmailInput, TransactionalNotificationInput } from './email.interface';
import { FakeEmailAdapter } from './fake-email.adapter';
import { OutboxService } from '../../common/outbox/outbox.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly adapter: EmailAdapter;

  constructor(
    fakeAdapter: FakeEmailAdapter,
    private readonly outboxService: OutboxService,
  ) {
    this.adapter = fakeAdapter;
  }

  public async sendPasswordResetEmail(
    input: PasswordResetEmailInput,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    if (tx) {
      // Transactional outbox pattern: persist email intent atomically
      await this.outboxService.publishTransactional(tx, 'email.password_reset.v1', {
        to: input.to,
        name: input.name,
        // Notice: in outbox payload, we include minimal data for dispatcher
        resetUrl: input.resetUrl,
      });
    }

    // Dispatch via adapter
    await this.adapter.sendPasswordResetEmail(input);
  }

  public async sendTransactionalNotification(
    input: TransactionalNotificationInput,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    if (tx) {
      await this.outboxService.publishTransactional(tx, 'email.notification.v1', {
        to: input.to,
        recipientName: input.recipientName,
        notificationType: input.notificationType,
        title: input.title,
      });
    }

    await this.adapter.sendTransactionalNotification(input);
  }

  public getAdapter(): EmailAdapter {
    return this.adapter;
  }
}
