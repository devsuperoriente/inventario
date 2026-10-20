import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrderProductionDto {
  @IsString()
  @IsNotEmpty()
  numberOrder: string;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsString()
  @IsOptional()
  observation: string;

  @IsNumber()
  stateId: number;

  @Type(() => Number)
  @IsNumber()
  productId: number;


}
