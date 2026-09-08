export interface MercadoPagoConfig {
  accessToken: string;
  webhookSecret: string;
  isSandbox: boolean;
}

export interface OpenPayConfig {
  merchantId: string;
  privateKey: string;
  webhookSecret: string;
  isSandbox: boolean;
}

export interface StorageConfig {
  driver: 'local' | 'r2' | 's3';
  localDir: string;
  signedUrlSecret: string;
  defaultExpirationSeconds: number;
}

export interface MailConfig {
  driver: 'fake' | 'smtp';
  fromAddress: string;
  fromName: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
}

export interface IntegrationsConfig {
  mercadoPago: MercadoPagoConfig;
  openPay: OpenPayConfig;
  storage: StorageConfig;
  mail: MailConfig;
}

export function loadIntegrationsConfig(): IntegrationsConfig {
  const isMpSandbox = process.env.PAYMENTS_MP_SANDBOX !== 'false';
  const isOpenPaySandbox = process.env.PAYMENTS_OPENPAY_SANDBOX !== 'false';

  return {
    mercadoPago: {
      accessToken: process.env.PAYMENTS_MP_ACCESS_TOKEN || (isMpSandbox ? 'TEST-default-mp-token' : ''),
      webhookSecret: process.env.PAYMENTS_MP_WEBHOOK_SECRET || 'default-mp-webhook-secret-min32chars',
      isSandbox: isMpSandbox,
    },
    openPay: {
      merchantId: process.env.PAYMENTS_OPENPAY_MERCHANT_ID || (isOpenPaySandbox ? 'm-sandbox-default' : ''),
      privateKey: process.env.PAYMENTS_OPENPAY_PRIVATE_KEY || (isOpenPaySandbox ? 'sk-sandbox-default' : ''),
      webhookSecret: process.env.PAYMENTS_OPENPAY_WEBHOOK_SECRET || 'default-openpay-webhook-secret',
      isSandbox: isOpenPaySandbox,
    },
    storage: {
      driver: (process.env.STORAGE_DRIVER as 'local' | 'r2' | 's3') || 'local',
      localDir: process.env.STORAGE_LOCAL_DIR || './storage/uploads',
      signedUrlSecret:
        process.env.STORAGE_SIGNED_URL_SECRET ||
        'gr-default-signed-url-secret-minimum-32-characters-required',
      defaultExpirationSeconds: parseInt(
        process.env.STORAGE_DEFAULT_EXPIRATION_SECONDS || '900',
        10,
      ),
    },
    mail: {
      driver: (process.env.MAIL_DRIVER as 'fake' | 'smtp') || 'fake',
      fromAddress: process.env.MAIL_FROM_ADDRESS || 'no-reply@plataformagr.com',
      fromName: process.env.MAIL_FROM_NAME || 'Plataforma GR',
      smtpHost: process.env.MAIL_SMTP_HOST,
      smtpPort: process.env.MAIL_SMTP_PORT ? parseInt(process.env.MAIL_SMTP_PORT, 10) : undefined,
      smtpUser: process.env.MAIL_SMTP_USER,
      smtpPass: process.env.MAIL_SMTP_PASS,
    },
  };
}
