export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
  metadata?: Record<string, unknown>;
}

export interface SendEmailResult {
  messageId: string;
  accepted: boolean;
  sentAt: Date;
}

export interface PasswordResetEmailInput {
  to: string;
  name: string;
  resetToken: string;
  resetUrl: string;
}

export interface TransactionalNotificationInput {
  to: string;
  recipientName: string;
  notificationType: string;
  title: string;
  body: string;
  actionUrl?: string;
}

export interface EmailAdapter {
  sendEmail(input: SendEmailInput): Promise<SendEmailResult>;
  sendPasswordResetEmail(input: PasswordResetEmailInput): Promise<SendEmailResult>;
  sendTransactionalNotification(input: TransactionalNotificationInput): Promise<SendEmailResult>;
}
