import { Injectable, Logger } from '@nestjs/common';
import {
  EmailAdapter,
  SendEmailInput,
  SendEmailResult,
  PasswordResetEmailInput,
  TransactionalNotificationInput,
} from './email.interface';

export interface SentEmailRecord {
  to: string;
  subject: string;
  html: string;
  text?: string;
  sentAt: Date;
  messageId: string;
}

@Injectable()
export class FakeEmailAdapter implements EmailAdapter {
  private readonly logger = new Logger(FakeEmailAdapter.name);
  private sentEmails: SentEmailRecord[] = [];

  public async sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
    await Promise.resolve();
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const record: SentEmailRecord = {
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      sentAt: new Date(),
      messageId,
    };

    this.sentEmails.push(record);
    this.logger.log(`[FakeEmailAdapter] Email dispatched to ${input.to} | Subject: "${input.subject}" | MessageId: ${messageId}`);

    return {
      messageId,
      accepted: true,
      sentAt: record.sentAt,
    };
  }

  public async sendPasswordResetEmail(input: PasswordResetEmailInput): Promise<SendEmailResult> {
    const subject = 'Plataforma GR — Restablecimiento de contraseña';
    const html = `
      <p>Hola ${input.name},</p>
      <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
      <p><a href="${input.resetUrl}">Restablecer Contraseña</a></p>
      <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
    `;

    // CRITICAL SECURITY REQUIREMENT: NEVER log the cleartext reset token!
    // Explicitly mask token in any log output
    const maskedLogToken = '***MASKED***';
    this.logger.log(
      `[FakeEmailAdapter] Password reset dispatched to ${input.to} | Token: ${maskedLogToken}`,
    );

    return this.sendEmail({
      to: input.to,
      subject,
      html,
      text: `Hola ${input.name}. Restablece tu contraseña en: ${input.resetUrl}`,
      metadata: {
        type: 'PASSWORD_RESET',
      },
    });
  }

  public async sendTransactionalNotification(
    input: TransactionalNotificationInput,
  ): Promise<SendEmailResult> {
    const subject = `Plataforma GR — ${input.title}`;
    const html = `
      <p>Estimado/a ${input.recipientName},</p>
      <h3>${input.title}</h3>
      <p>${input.body}</p>
      ${input.actionUrl ? `<p><a href="${input.actionUrl}">Ver detalles</a></p>` : ''}
    `;

    this.logger.log(`[FakeEmailAdapter] Transactional notification [${input.notificationType}] sent to ${input.to}`);

    return this.sendEmail({
      to: input.to,
      subject,
      html,
      text: `${input.title}\n\n${input.body}`,
      metadata: {
        type: input.notificationType,
      },
    });
  }

  public getSentEmails(): SentEmailRecord[] {
    return [...this.sentEmails];
  }

  public clear(): void {
    this.sentEmails = [];
  }
}
