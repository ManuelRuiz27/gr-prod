import { IsEmail, IsString, MinLength, IsOptional, IsUUID } from 'class-validator';

export class ResolveEventAccessDto {
  @IsString()
  @MinLength(1)
  code: string;
}

export class RegisterGraduateDto {
  @IsUUID()
  event_id: string;

  @IsString()
  @MinLength(3)
  full_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(10)
  phone: string;

  @IsString()
  career: string;

  @IsString()
  generation: string;

  @IsString()
  @IsOptional()
  group?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  access_token?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class PasswordResetRequestDto {
  @IsEmail()
  email: string;
}

export class PasswordResetConfirmDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
