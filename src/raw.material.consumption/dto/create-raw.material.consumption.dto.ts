import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRawMaterialConsumptionDto {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  quantity?: number | null;

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
}
