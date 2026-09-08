import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ResolveEventAccessDto,
  RegisterGraduateDto,
  LoginDto,
  RefreshTokenDto,
  PasswordResetRequestDto,
  PasswordResetConfirmDto,
} from './dto/auth.dto';
import { Public } from './public.decorator';
import { CurrentUser } from '../common/guards/current-user.decorator';
import { Idempotent } from '../common/idempotency/idempotent.decorator';
import { IdempotencyInterceptor } from '../common/idempotency/idempotency.interceptor';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('event-access/resolve')
  @HttpCode(HttpStatus.OK)
  async resolveEventAccess(@Body() dto: ResolveEventAccessDto) {
    return this.authService.resolveEventAccess(dto);
  }

  @Public()
  @UseInterceptors(IdempotencyInterceptor)
  @Idempotent(true)
  @Post('graduate/register')
  @HttpCode(HttpStatus.OK)
  async registerGraduate(@Body() dto: RegisterGraduateDto) {
    return this.authService.registerGraduate(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshSession(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshSession(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser('id') accountId: string,
    @Body() dto: Partial<RefreshTokenDto>,
  ) {
    return this.authService.logout(accountId, dto?.refreshToken);
  }

  @Public()
  @Post('password-reset/request')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() dto: PasswordResetRequestDto) {
    return this.authService.requestPasswordReset(dto);
  }

  @Public()
  @Post('password-reset/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmPasswordReset(@Body() dto: PasswordResetConfirmDto) {
    return this.authService.confirmPasswordReset(dto);
  }
}
