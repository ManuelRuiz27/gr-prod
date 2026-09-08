import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsOptional,
  IsUUID,
  IsDateString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventStatus, ProductKind, ConfigurationStatus, MealType } from '@prisma/client';

export class CreateEventProductInputDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ProductKind)
  kind: ProductKind;

  @IsNumber()
  @Min(0)
  unit_price: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateEventWizardDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  venue: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  access_code?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEventProductInputDto)
  products?: CreateEventProductInputDto[];

  @IsOptional()
  @IsNumber()
  thermo_threshold?: number;

  @IsOptional()
  @IsDateString()
  seating_deadline?: string;

  @IsOptional()
  @IsDateString()
  meals_deadline?: string;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  venue?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsString()
  timezone?: string;
}

export class TransitionEventDto {
  @IsEnum(EventStatus)
  status: EventStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class RotateAccessCodeDto {
  @IsOptional()
  @IsString()
  new_code?: string;

  @IsOptional()
  @IsInt()
  max_uses?: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ProductKind)
  kind: ProductKind;

  @IsNumber()
  @Min(0)
  unit_price: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  display_order?: number;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unit_price?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  is_active?: boolean;

  @IsOptional()
  @IsInt()
  display_order?: number;
}

export class CreateFinancialConfigurationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  total_package_amount: number;

  @IsNumber()
  @Min(0)
  down_payment_amount: number;

  @IsInt()
  @Min(1)
  scheduled_installments: number;

  @IsOptional()
  @IsDateString()
  liquidation_due_date?: string;
}

export class CreateFinancialMilestoneDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  due_date: string;

  @IsNumber()
  @Min(0)
  target_amount: number;
}

export class UpdateLatePaymentPolicyDto {
  @IsInt()
  @Min(0)
  late_grace_days: number;

  @IsNumber()
  @Min(0)
  late_fee_amount: number;
}

export class CreateMealOptionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(MealType)
  type?: MealType;

  @IsOptional()
  is_vegetarian?: boolean;

  @IsOptional()
  is_vegan?: boolean;

  @IsOptional()
  @IsInt()
  display_order?: number;
}

export class UpdateMealOptionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(MealType)
  type?: MealType;

  @IsOptional()
  is_vegetarian?: boolean;

  @IsOptional()
  is_vegan?: boolean;

  @IsOptional()
  is_active?: boolean;

  @IsOptional()
  @IsInt()
  display_order?: number;
}

export class CreateCancellationPolicyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class AddCancellationPolicyRangeDto {
  @IsInt()
  @Min(0)
  days_before_event_min: number;

  @IsInt()
  @Min(0)
  days_before_event_max: number;

  @IsNumber()
  @Min(0)
  penalty_percentage: number;

  @IsNumber()
  @Min(0)
  refund_percentage: number;
}

export class CreateThermoConfigurationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  eligibility_threshold_percentage: number;

  @IsOptional()
  @IsArray()
  customization_fields?: any[];
}
