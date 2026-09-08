import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  FileStorageAdapter,
  UploadFileInput,
  UploadFileResult,
  GetSignedUrlInput,
  FileMetadata,
  PURPOSE_VALIDATION_RULES,
} from './file-storage.interface';
import { InvalidRequestException } from '../../common/errors/domain-exceptions';
import { loadIntegrationsConfig, StorageConfig } from '../config/integrations.config';

@Injectable()
export class LocalDiskStorageAdapter implements FileStorageAdapter {
  private readonly logger = new Logger(LocalDiskStorageAdapter.name);
  private readonly config: StorageConfig;
  private readonly baseDir: string;

  constructor() {
    this.config = loadIntegrationsConfig().storage;
    this.baseDir = path.resolve(this.config.localDir);
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  public async upload(input: UploadFileInput): Promise<UploadFileResult> {
    await Promise.resolve();
    // 1. Validate purpose rules
    const rule = PURPOSE_VALIDATION_RULES[input.purpose];
    if (!rule) {
      throw new InvalidRequestException(`Propósito de archivo no soportado: ${input.purpose}`);
    }

    if (!rule.allowedMimeTypes.includes(input.mimeType)) {
      throw new InvalidRequestException(
        `Tipo de archivo no permitido (${input.mimeType}) para ${input.purpose}. Permitidos: ${rule.allowedMimeTypes.join(', ')}`,
      );
    }

    if (input.sizeBytes > rule.maxSizeBytes) {
      throw new InvalidRequestException(
        `El archivo excede el tamaño máximo permitido de ${rule.maxSizeBytes / (1024 * 1024)} MB para ${input.purpose}.`,
      );
    }

    // 2. Generate secure non-predictable path
    const sanitizedFilename = path
      .basename(input.originalFilename)
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueId = crypto.randomUUID();
    const relativePath = path.join(
      input.purpose.toLowerCase(),
      `${uniqueId}-${sanitizedFilename}`,
    );

    const fullPath = this.resolveSafePath(relativePath);
    const parentDir = path.dirname(fullPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    // 3. Write file
    fs.writeFileSync(fullPath, input.buffer);

    this.logger.log(`Uploaded file for ${input.purpose} at safe path ${relativePath}`);

    return {
      storagePath: relativePath.replace(/\\/g, '/'),
      sizeBytes: input.sizeBytes,
      mimeType: input.mimeType,
      originalFilename: input.originalFilename,
    };
  }

  public async getSignedDownloadUrl(input: GetSignedUrlInput): Promise<string> {
    await Promise.resolve();
    const expirationSeconds = input.expirationSeconds || this.config.defaultExpirationSeconds;
    const exp = Math.floor(Date.now() / 1000) + expirationSeconds;
    const cleanPath = input.storagePath.replace(/\\/g, '/');

    const signature = this.generateSignature(cleanPath, exp);

    return `/api/v1/storage/download?path=${encodeURIComponent(cleanPath)}&exp=${exp}&sig=${signature}`;
  }

  public async verifySignedUrl(
    tokenOrSig: string,
    storagePath: string,
    expTimestamp?: number,
  ): Promise<boolean> {
    await Promise.resolve();
    try {
      const nowSec = Math.floor(Date.now() / 1000);
      const cleanPath = storagePath.replace(/\\/g, '/');

      // If expTimestamp provided, check expiration
      if (expTimestamp !== undefined) {
        if (nowSec > expTimestamp) {
          this.logger.warn(`Signed URL expired for path ${cleanPath}`);
          return false;
        }

        const expectedSig = this.generateSignature(cleanPath, expTimestamp);
        const expectedBuf = Buffer.from(expectedSig, 'utf8');
        const providedBuf = Buffer.from(tokenOrSig, 'utf8');

        if (expectedBuf.length !== providedBuf.length || !crypto.timingSafeEqual(expectedBuf, providedBuf)) {
          this.logger.warn(`Signed URL invalid signature for path ${cleanPath}`);
          return false;
        }

        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  public async delete(storagePath: string): Promise<boolean> {
    await Promise.resolve();
    try {
      const fullPath = this.resolveSafePath(storagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
      return false;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : typeof err === 'string' ? err : 'Unknown error';
      this.logger.error(`Error deleting file at ${storagePath}: ${errMsg}`);
      return false;
    }
  }

  public async getMetadata(storagePath: string): Promise<FileMetadata> {
    await Promise.resolve();
    try {
      const fullPath = this.resolveSafePath(storagePath);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        return {
          storagePath: storagePath.replace(/\\/g, '/'),
          sizeBytes: stats.size,
          mimeType: 'application/octet-stream',
          exists: true,
        };
      }
      return {
        storagePath: storagePath.replace(/\\/g, '/'),
        sizeBytes: 0,
        mimeType: '',
        exists: false,
      };
    } catch {
      return {
        storagePath: storagePath.replace(/\\/g, '/'),
        sizeBytes: 0,
        mimeType: '',
        exists: false,
      };
    }
  }

  public generateSignature(storagePath: string, exp: number): string {
    const payload = `${storagePath}:${exp}`;
    return crypto
      .createHmac('sha256', this.config.signedUrlSecret)
      .update(payload)
      .digest('hex');
  }

  public resolveSafePath(userPath: string): string {
    const normalized = path.normalize(userPath);
    if (normalized.includes('..') || path.isAbsolute(userPath)) {
      throw new InvalidRequestException('Intento de acceso a ruta no permitida (Path Traversal).');
    }
    const resolved = path.resolve(this.baseDir, normalized);
    if (!resolved.startsWith(this.baseDir)) {
      throw new InvalidRequestException('Intento de acceso a ruta no permitida (Path Traversal).');
    }
    return resolved;
  }
}
