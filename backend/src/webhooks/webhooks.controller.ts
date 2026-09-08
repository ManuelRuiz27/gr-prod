import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { Public } from '../auth/public.decorator';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Public()
  @Post('mercado-pago')
  @HttpCode(HttpStatus.OK)
  async handleMercadoPago(@Body() payload: any, @Headers() headers: any) {
    return this.webhooksService.handleMercadoPago(payload, headers);
  }

  @Public()
  @Post('openpay')
  @HttpCode(HttpStatus.OK)
  async handleOpenPay(@Body() payload: any, @Headers() headers: any) {
    return this.webhooksService.handleOpenPay(payload, headers);
  }
}
