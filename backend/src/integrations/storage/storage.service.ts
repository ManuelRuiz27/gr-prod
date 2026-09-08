import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FileStorageAdapter, UploadFileInput } from './file-storage.interface';
import { LocalDiskStorageAdapter } from './local-disk-storage.adapter';
import { FileAsset, FileAssetStatus } from '@prisma/client';
import {
  ResourceNotFoundException,
  ForbiddenResourceException,
  InvalidRequestException,
} from '../../common/errors/domain-exceptions';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly adapter: FileStorageAdapter;

  constructor(
    private readonly prisma: PrismaService,
    localAdapter: LocalDiskStorageAdapter,
  ) {
    this.adapter = localAdapter;
  }

  public async uploadAndRegisterFile(
    input: UploadFileInput,
    actor: { id: string; role: string },
  ): Promise<FileAsset> {
    const uploadResult = await this.adapter.upload(input);

    const asset = await this.prisma.fileAsset.create({
      data: {
        purpose: input.purpose,
        storage_path: uploadResult.storagePath,
        original_filename: uploadResult.originalFilename,
        mime_type: uploadResult.mimeType,
        size_bytes: uploadResult.sizeBytes,
        status: FileAssetStatus.AVAILABLE,
        created_by_account_id: actor.id,
      },
    });

    this.logger.log(`FileAsset ${asset.id} registered successfully for purpose ${asset.purpose}`);
    return asset;
  }

  public async getDownloadUrlForAsset(
    assetId: string,
    actor: { id: string; role: string },
    expirationSeconds?: number,
  ): Promise<string> {
    const asset = await this.prisma.fileAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset || asset.status === FileAssetStatus.ARCHIVED) {
      throw new ResourceNotFoundException('El archivo solicitado no fue encontrado o no está disponible.');
    }

    // Authorization: Admin can access any file. Graduate can only access files they created.
    if (actor.role !== 'ADMIN' && asset.created_by_account_id !== actor.id) {
      throw new ForbiddenResourceException('No cuenta con privilegios para descargar este archivo.');
    }

    return this.adapter.getSignedDownloadUrl({
      storagePath: asset.storage_path,
      expirationSeconds,
    });
  }

  public async verifyAndResolveDownload(
    storagePath: string,
    exp: number,
    sig: string,
  ): Promise<{ fullPath: string; mimeType: string; originalFilename: string }> {
    const isValid = await this.adapter.verifySignedUrl(sig, storagePath, exp);
    if (!isValid) {
      throw new InvalidRequestException('El enlace de descarga es inválido o ha expirado.');
    }

    const asset = await this.prisma.fileAsset.findUnique({
      where: { storage_path: storagePath },
    });

    if (!asset || asset.status === FileAssetStatus.ARCHIVED) {
      throw new ResourceNotFoundException('El archivo solicitado no se encuentra disponible.');
    }

    const localAdapter = this.adapter as LocalDiskStorageAdapter;
    const fullPath = localAdapter.resolveSafePath(storagePath);

    return {
      fullPath,
      mimeType: asset.mime_type,
      originalFilename: asset.original_filename,
    };
  }

  public getAdapter(): FileStorageAdapter {
    return this.adapter;
  }
}
