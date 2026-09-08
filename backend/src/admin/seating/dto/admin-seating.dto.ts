import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TableShape, TableStatus } from '@prisma/client';

export class UpdateSeatingMapDto {
  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsString()
  background_url?: string;
}

export class CreateTableDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsEnum(TableShape)
  shape: TableShape;

  @IsNumber()
  @Min(0)
  @Max(1)
  position_x: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  position_y: number;

  @IsOptional()
  @IsNumber()
  rotation?: number;
}

export class UpdateTableDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsEnum(TableShape)
  shape?: TableShape;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  position_x?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  position_y?: number;

  @IsOptional()
  @IsNumber()
  rotation?: number;

  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;
}

export class BulkCreateTablesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTableDto)
  tables: CreateTableDto[];
}

export class DetectedTableImportItemDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsEnum(TableShape)
  shape: TableShape;

  @IsNumber()
  @Min(0)
  @Max(1)
  position_x: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  position_y: number;

  @IsOptional()
  @IsNumber()
  rotation?: number;

  @IsOptional()
  @IsNumber()
  confidence?: number;
}

export class ImportDetectedTablesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetectedTableImportItemDto)
  tables: DetectedTableImportItemDto[];

  @IsOptional()
  replace_existing?: boolean;
}

export class AdminAssignTableMembersDto {
  @IsArray()
  @IsUUID('4', { each: true })
  member_ids: string[];
}
