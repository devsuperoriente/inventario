import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrderProductionDto {
  @IsString()
  @IsOptional()
  numberOrder: string;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsNumber()
  @IsOptional()
  quantitySheduled?: number;

  @IsNumber()
  @IsOptional()
  quantityProduced?: number;

  @IsString()
  @IsOptional()
  observation: string;

  @Type(() => Number)
  @IsNumber()
  stateId: number;

  @Type(() => Number)
  @IsNumber()
  productId: number;
}
