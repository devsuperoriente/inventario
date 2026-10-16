import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateInventoryMovementDto {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  quantity?: number | null;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  balancePrevius?: number | null;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  balanceCurrent?: number | null;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsString()
  @IsNotEmpty()
  observation: string;

  @Type(() => Number)
  @IsNumber()
  batchId: number;

  @Type(() => Number)
  @IsNumber()
  orderProductionId: number;

  @Type(() => Number)
  @IsNumber()
  typeMovementId: number;
}
