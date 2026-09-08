import { LocalDiskStorageAdapter } from './local-disk-storage.adapter';
import { StorageService } from './storage.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  InvalidRequestException,
  ForbiddenResourceException,
  ResourceNotFoundException,
} from '../../common/errors/domain-exceptions';
import { FilePurpose, FileAssetStatus } from '@prisma/client';

describe('File Storage Contract (Unit)', () => {
  let adapter: LocalDiskStorageAdapter;
  let storageService: StorageService;
  let mockPrismaService: {
    fileAsset: {
      create: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  beforeEach(() => {
    adapter = new LocalDiskStorageAdapter();

    mockPrismaService = {
      fileAsset: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    storageService = new StorageService(mockPrismaService as unknown as PrismaService, adapter);
  });

  describe('1. LocalDiskStorageAdapter', () => {
    it('rejects upload with forbidden MIME type for purpose', async () => {
      await expect(
        adapter.upload({
          buffer: Buffer.from('executable binary code'),
          originalFilename: 'malicious.exe',
          mimeType: 'application/x-msdownload',
          sizeBytes: 1024,
          purpose: FilePurpose.PAYMENT_EVIDENCE,
        }),
      ).rejects.toThrow(InvalidRequestException);
    });

    it('rejects upload exceeding max size limit for purpose', async () => {
      const oversizedBytes = 15 * 1024 * 1024; // 15 MB (limit is 10 MB)
      await expect(
        adapter.upload({
          buffer: Buffer.alloc(10),
          originalFilename: 'large_receipt.pdf',
          mimeType: 'application/pdf',
          sizeBytes: oversizedBytes,
          purpose: FilePurpose.PAYMENT_EVIDENCE,
        }),
      ).rejects.toThrow(InvalidRequestException);
    });

    it('uploads valid file and returns safe storage path', async () => {
      const result = await adapter.upload({
        buffer: Buffer.from('test pdf content'),
        originalFilename: 'recibo_bancario.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 100,
        purpose: FilePurpose.PAYMENT_EVIDENCE,
      });

      expect(result.storagePath).toMatch(/^payment_evidence\/[a-f0-9-]+-recibo_bancario\.pdf$/);
      expect(result.sizeBytes).toBe(100);
      expect(result.mimeType).toBe('application/pdf');
    });

    it('generates signed download URL with exp and sig', async () => {
      const url = await adapter.getSignedDownloadUrl({
        storagePath: 'payment_evidence/receipt-1.pdf',
        expirationSeconds: 300,
      });

      expect(url).toContain('/api/v1/storage/download?path=');
      expect(url).toContain('&exp=');
      expect(url).toContain('&sig=');
    });

    it('verifies valid signed URL successfully', async () => {
      const path = 'payment_evidence/valid.pdf';
      const exp = Math.floor(Date.now() / 1000) + 600; // valid for 10 min
      const sig = adapter.generateSignature(path, exp);

      const isValid = await adapter.verifySignedUrl(sig, path, exp);
      expect(isValid).toBe(true);
    });

    it('rejects expired signed URL when timestamp has passed', async () => {
      const path = 'payment_evidence/expired.pdf';
      const exp = Math.floor(Date.now() / 1000) - 10; // expired 10s ago
      const sig = adapter.generateSignature(path, exp);

      const isValid = await adapter.verifySignedUrl(sig, path, exp);
      expect(isValid).toBe(false);
    });

    it('rejects signed URL when path or signature has been tampered', async () => {
      const path = 'payment_evidence/authentic.pdf';
      const exp = Math.floor(Date.now() / 1000) + 600;
      const sig = adapter.generateSignature(path, exp);

      // Tampered path
      const isValid = await adapter.verifySignedUrl(sig, 'payment_evidence/tampered.pdf', exp);
      expect(isValid).toBe(false);
    });

    it('blocks path traversal attempts in resolveSafePath', () => {
      expect(() => adapter.resolveSafePath('../../windows/system32/cmd.exe')).toThrow(
        InvalidRequestException,
      );
    });
  });

  describe('2. StorageService Authorization & Ownership', () => {
    const assetId = 'asset-uuid-1';
    const gradOwnerId = 'acc-graduate-1';
    const otherGradId = 'acc-graduate-2';
    const adminId = 'acc-admin-1';

    const mockAsset = {
      id: assetId,
      purpose: FilePurpose.PAYMENT_EVIDENCE,
      storage_path: 'payment_evidence/voucher.pdf',
      original_filename: 'voucher.pdf',
      mime_type: 'application/pdf',
      size_bytes: 2048,
      status: FileAssetStatus.AVAILABLE,
      created_by_account_id: gradOwnerId,
    };

    it('allows owner graduate to generate download URL for their file', async () => {
      mockPrismaService.fileAsset.findUnique.mockResolvedValue(mockAsset);

      const url = await storageService.getDownloadUrlForAsset(assetId, {
        id: gradOwnerId,
        role: 'GRADUATE',
      });

      expect(url).toContain(encodeURIComponent('payment_evidence/voucher.pdf'));
    });

    it('rejects unauthorized graduate trying to access another graduate file (403)', async () => {
      mockPrismaService.fileAsset.findUnique.mockResolvedValue(mockAsset);

      await expect(
        storageService.getDownloadUrlForAsset(assetId, {
          id: otherGradId,
          role: 'GRADUATE',
        }),
      ).rejects.toThrow(ForbiddenResourceException);
    });

    it('allows ADMIN to access any graduate file', async () => {
      mockPrismaService.fileAsset.findUnique.mockResolvedValue(mockAsset);

      const url = await storageService.getDownloadUrlForAsset(assetId, {
        id: adminId,
        role: 'ADMIN',
      });

      expect(url).toContain(encodeURIComponent('payment_evidence/voucher.pdf'));
    });

    it('throws 404 RESOURCE_NOT_FOUND if asset does not exist', async () => {
      mockPrismaService.fileAsset.findUnique.mockResolvedValue(null);

      await expect(
        storageService.getDownloadUrlForAsset('non-existent', {
          id: adminId,
          role: 'ADMIN',
        }),
      ).rejects.toThrow(ResourceNotFoundException);
    });
  });
});
