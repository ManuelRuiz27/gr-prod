import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { AdjustmentType } from '@prisma/client';

export class ApproveSubmissionDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectSubmissionDto {
  @IsString()
  @IsNotEmpty()
  rejection_reason: string;
}

export class CreateAdjustmentDto {
  @IsEnum(AdjustmentType)
  type: AdjustmentType;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class CreateRefundDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class ResolveReconciliationCaseDto {
  @IsString()
  @IsNotEmpty()
  resolution_notes: string;
}
