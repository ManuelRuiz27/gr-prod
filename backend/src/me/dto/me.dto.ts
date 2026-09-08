import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  full_name?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class CreateGroupMemberDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsOptional()
  @IsString()
  relationship?: string;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateGroupMemberDto {
  @IsString()
  @IsOptional()
  full_name?: string;

  @IsOptional()
  @IsString()
  relationship?: string;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class LineItemRequestItemDto {
  @IsUUID()
  product_id: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class QuoteLineItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineItemRequestItemDto)
  items: LineItemRequestItemDto[];
}

export class AddLineItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineItemRequestItemDto)
  items: LineItemRequestItemDto[];
}

export class SelectMealDto {
  @IsUUID()
  meal_option_id: string;

  @IsOptional()
  @IsString()
  special_instructions?: string;
}

export class AssignTableMembersDto {
  @IsUUID()
  table_id: string;

  @IsArray()
  @IsUUID('4', { each: true })
  member_ids: string[];
}

export class CreatePaymentAttemptDto {
  @IsString()
  @IsNotEmpty()
  gateway: 'MERCADO_PAGO' | 'OPENPAY';

  @IsOptional()
  @IsInt()
  @Min(1)
  installment_number?: number;
}

export class SubmitPaymentProofDto {
  @IsString()
  payment_method: 'CASH' | 'TRANSFER' | 'DEPOSIT';

  @IsString()
  amount: string;

  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsOptional()
  @IsString()
  evidence_file_id?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class RequestThermoDto {
  @IsString()
  @IsNotEmpty()
  custom_name: string;

  @IsOptional()
  @IsString()
  custom_title?: string;

  @IsOptional()
  @IsString()
  color_choice?: string;
}

export class MarkNotificationReadDto {
  @IsOptional()
  is_read?: boolean;
}
