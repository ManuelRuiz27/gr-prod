import { Global, Module } from '@nestjs/common';
import { MercadoPagoAdapter } from './payments/mercado-pago.adapter';
import { OpenPayAdapter } from './payments/openpay.adapter';
import { LocalDiskStorageAdapter } from './storage/local-disk-storage.adapter';
import { StorageService } from './storage/storage.service';
import { FakeEmailAdapter } from './email/fake-email.adapter';
import { EmailService } from './email/email.service';
import { CommonModule } from '../common/common.module';

@Global()
@Module({
  imports: [CommonModule],
  providers: [
    MercadoPagoAdapter,
    OpenPayAdapter,
    LocalDiskStorageAdapter,
    StorageService,
    FakeEmailAdapter,
    EmailService,
  ],
  exports: [
    MercadoPagoAdapter,
    OpenPayAdapter,
    LocalDiskStorageAdapter,
    StorageService,
    FakeEmailAdapter,
    EmailService,
  ],
})
export class IntegrationsModule {}
