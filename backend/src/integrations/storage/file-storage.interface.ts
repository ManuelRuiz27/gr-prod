import { FilePurpose } from '@prisma/client';

export interface UploadFileInput {
  buffer: Buffer;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  purpose: FilePurpose;
  createdByAccountId?: string;
}

export interface UploadFileResult {
  storagePath: string;
  sizeBytes: number;
  mimeType: string;
  originalFilename: string;
}

export interface GetSignedUrlInput {
  storagePath: string;
  expirationSeconds?: number;
}

export interface FileMetadata {
  storagePath: string;
  sizeBytes: number;
  mimeType: string;
  exists: boolean;
}

export interface FileStorageAdapter {
  upload(input: UploadFileInput): Promise<UploadFileResult>;
  getSignedDownloadUrl(input: GetSignedUrlInput): Promise<string>;
  verifySignedUrl(token: string, storagePath: string, expTimestamp?: number): Promise<boolean>;
  delete(storagePath: string): Promise<boolean>;
  getMetadata(storagePath: string): Promise<FileMetadata>;
}

export interface PurposeValidationRule {
  allowedMimeTypes: string[];
  maxSizeBytes: number;
}

export const PURPOSE_VALIDATION_RULES: Record<FilePurpose, PurposeValidationRule> = {
  PAYMENT_EVIDENCE: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB
  },
  SEATING_BACKGROUND: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 25 * 1024 * 1024, // 25 MB
  },
  THERMO_SIGNATURE: {
    allowedMimeTypes: ['image/png', 'image/svg+xml', 'image/jpeg'],
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
  },
  THERMO_EVIDENCE: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB
  },
  REFUND_EVIDENCE: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB
  },
  EXPORT: {
    allowedMimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/pdf',
    ],
    maxSizeBytes: 50 * 1024 * 1024, // 50 MB
  },
  OTHER_INTERNAL: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'],
    maxSizeBytes: 15 * 1024 * 1024, // 15 MB
  },
};
