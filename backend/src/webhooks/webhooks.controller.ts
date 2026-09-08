import {
  Controller,
  Post,
  Get,
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
  async handleMercadoPago(
    @Body() payload: Record<string, unknown>,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    return this.webhooksService.handleMercadoPago(payload, headers);
  }

  @Public()
  @Post('openpay')
  @HttpCode(HttpStatus.OK)
  async handleOpenPay(
    @Body() payload: Record<string, unknown>,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    return this.webhooksService.handleOpenPay(payload, headers);
  }

  @Public()
  @Get('return')
  handleReturnUrl() {
    return this.webhooksService.assertReturnUrlCannotConfirm();
  }
}
