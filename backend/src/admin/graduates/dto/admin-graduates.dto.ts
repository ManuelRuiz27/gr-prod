import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { PaymentSource, ThermoOperationalStatus } from '@prisma/client';

export class ReducePlacesDto {
  @IsInt()
  @Min(1)
  places_to_remove: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class CreateInternalNoteDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class CancelMembershipDto {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsNumber()
  custom_refund_amount?: number;
}

export class RecordManualPaymentDto {
  @IsEnum(PaymentSource)
  payment_method: PaymentSource;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AdminUpdateMealSelectionDto {
  @IsUUID()
  meal_option_id: string;

  @IsOptional()
  @IsString()
  special_instructions?: string;
}

export class UpdateThermoStatusDto {
  @IsEnum(ThermoOperationalStatus)
  status: ThermoOperationalStatus;

  @IsOptional()
  @IsString()
  delivery_notes?: string;
}
