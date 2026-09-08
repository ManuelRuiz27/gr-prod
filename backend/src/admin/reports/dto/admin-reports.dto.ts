import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ExportFormat } from '@prisma/client';

export enum ExportJobType {
  OPERATIONS = 'OPERATIONS',
  FINANCIAL = 'FINANCIAL',
  MEALS = 'MEALS',
  SEATING = 'SEATING',
  THERMOS = 'THERMOS',
  AUDIT = 'AUDIT',
}

export class CreateExportJobDto {
  @IsEnum(ExportJobType)
  job_type: ExportJobType;

  @IsOptional()
  @IsString()
  file_format?: 'CSV' | 'XLSX';

  @IsOptional()
  filters?: Record<string, any>;
}
